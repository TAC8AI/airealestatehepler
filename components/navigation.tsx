'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-white tracking-tight">AI Real Estate Helper</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {!loading && (
              user ? (
                <>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
                    Dashboard
                  </Link>
                  <div className="h-6 w-px bg-gray-700"></div>
                  <div className="relative group">
                    <button className="flex items-center text-gray-300 hover:text-white transition-colors duration-300 font-medium">
                      <FiUser className="mr-2" />
                      <span>{user.email?.split('@')[0] || 'Account'}</span>
                    </button>
                    <div className="absolute right-0 w-48 mt-2 origin-top-right bg-black/95 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="py-2">
                        <Link href="/dashboard/settings" className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200">
                          Settings
                        </Link>
                        <Link href="/dashboard/subscription" className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200">
                          Subscription
                        </Link>
                        <button 
                          onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/';
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 flex items-center transition-all duration-200"
                        >
                          <FiLogOut className="mr-2" /> Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-white hover:bg-gray-100 text-black font-semibold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 focus:outline-none transition-all duration-300"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl">
            {!loading && (
              user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/dashboard/settings" 
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link 
                    href="/dashboard/subscription" 
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Subscription
                  </Link>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = '/';
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
