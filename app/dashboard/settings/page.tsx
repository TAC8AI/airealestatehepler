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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Clean Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Settings</h1>
        <p className="text-lg text-gray-600">Manage your account preferences and profile information</p>
      </div>
      
      {/* Settings Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10 max-w-4xl">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
          <p className="text-gray-600">Update your personal information and preferences</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-gray-900 mb-3">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">Contact support to change your email</p>
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-3">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={profile.company}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                placeholder="Real Estate Company"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-3">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          
          {/* Notification Preferences */}
          <div className="border-t border-gray-200 pt-10 mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300">
                <div>
                  <label htmlFor="notification_email" className="text-base font-semibold text-gray-900">
                    Email notifications
                  </label>
                  <p className="text-sm text-gray-600 mt-1">Receive updates and alerts via email</p>
                </div>
                <input
                  type="checkbox"
                  id="notification_email"
                  name="notification_email"
                  checked={profile.notification_email}
                  onChange={handleChange}
                  className="h-5 w-5 text-black focus:ring-black border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300">
                <div>
                  <label htmlFor="notification_app" className="text-base font-semibold text-gray-900">
                    In-app notifications
                  </label>
                  <p className="text-sm text-gray-600 mt-1">Show notifications within the application</p>
                </div>
                <input
                  type="checkbox"
                  id="notification_app"
                  name="notification_app"
                  checked={profile.notification_app}
                  onChange={handleChange}
                  className="h-5 w-5 text-black focus:ring-black border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-3 shadow-lg hover:shadow-xl"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <FiCheck className="h-5 w-5" />
                  Saved
                </>
              ) : (
                <>
                  <FiSave className="h-5 w-5" />
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
