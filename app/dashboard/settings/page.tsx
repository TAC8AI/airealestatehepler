'use client';

import React, { useState, useEffect } from 'react';
import { FiSave, FiCheck, FiSettings, FiBell, FiUser, FiMail, FiPhone, FiHome } from 'react-icons/fi';
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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/10 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-8">
        {/* Premium Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-xl">
              <FiSettings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                Settings
              </h1>
              <p className="text-lg text-gray-400 mt-1">Manage your account preferences and profile information</p>
            </div>
          </div>
        </div>
        
        {/* Settings Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 shadow-2xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <FiUser className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            </div>
            <p className="text-gray-400">Update your personal information and preferences</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <label htmlFor="full_name" className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FiUser className="h-4 w-4 text-blue-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FiMail className="h-4 w-4 text-purple-400" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-2">Contact support to change your email</p>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FiHome className="h-4 w-4 text-green-400" />
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={profile.company}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  placeholder="Real Estate Company"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FiPhone className="h-4 w-4 text-cyan-400" />
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            
            {/* Notification Preferences */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <FiBell className="h-6 w-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <label htmlFor="notification_email" className="text-white font-medium">Email Notifications</label>
                    <p className="text-sm text-gray-400">Receive updates and alerts via email</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="notification_email"
                      name="notification_email"
                      checked={profile.notification_email}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="notification_email"
                      className={`block w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                        profile.notification_email
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full mt-0.5 transition-transform duration-200 ${
                          profile.notification_email ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <label htmlFor="notification_app" className="text-white font-medium">App Notifications</label>
                    <p className="text-sm text-gray-400">Receive in-app notifications and alerts</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="notification_app"
                      name="notification_app"
                      checked={profile.notification_app}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="notification_app"
                      className={`block w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                        profile.notification_app
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full mt-0.5 transition-transform duration-200 ${
                          profile.notification_app ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center gap-3 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/10"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <FiCheck className="h-5 w-5" />
                    Saved!
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
    </div>
  );
}
