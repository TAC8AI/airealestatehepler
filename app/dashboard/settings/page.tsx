'use client';

import React, { useState, useEffect } from 'react';
import { FiSave, FiCheck } from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    company: '',
    phone: '',
    email: '',
    notification_email: true,
    notification_app: true,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          return;
        }
        
        setUser(session.user);
        
        // Fetch user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setProfile({
            full_name: data.full_name || '',
            company: data.company || '',
            phone: data.phone || '',
            email: session.user.email || '',
            notification_email: data.notification_email !== false,
            notification_app: data.notification_app !== false,
          });
        } else {
          setProfile(prev => ({
            ...prev,
            email: session.user.email || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: profile.full_name,
          company: profile.company,
          phone: profile.phone,
          notification_email: profile.notification_email,
          notification_app: profile.notification_app,
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      } else {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="card">
        <h2 className="text-lg font-medium mb-6">Profile Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="full_name" className="label">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                className="input"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                disabled
                className="input bg-secondary-50"
              />
              <p className="text-xs text-secondary-500 mt-1">Contact support to change your email</p>
            </div>
            
            <div>
              <label htmlFor="company" className="label">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={profile.company}
                onChange={handleChange}
                className="input"
                placeholder="Real Estate Company"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="label">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="input"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          
          <h3 className="font-medium mb-4">Notification Preferences</h3>
          <div className="space-y-3 mb-8">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notification_email"
                name="notification_email"
                checked={profile.notification_email}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="notification_email" className="ml-2 block text-secondary-700">
                Email notifications
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notification_app"
                name="notification_app"
                checked={profile.notification_app}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="notification_app" className="ml-2 block text-secondary-700">
                In-app notifications
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <FiCheck className="mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
