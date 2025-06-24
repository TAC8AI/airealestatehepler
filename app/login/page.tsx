'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex">
      {/* Left Side - Clean Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 xl:px-24">
        <div className="max-w-lg">
          <div className="mb-12">
            <Link href="/" className="inline-block">
              <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
                AI Real Estate Helper
              </h1>
            </Link>
            <p className="text-xl text-gray-400 leading-relaxed">
              Welcome back to the future of real estate.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Lightning-Fast Analysis</h3>
                <p className="text-gray-400 leading-relaxed">
                  AI-powered contract insights in seconds, not hours. Transform your workflow instantly.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Expert-Level Valuations</h3>
                <p className="text-gray-400 leading-relaxed">
                  McKinsey-grade property analysis with market-accurate pricing and confidence indicators.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Compelling Listings</h3>
                <p className="text-gray-400 leading-relaxed">
                  Research-backed content that converts across all platforms and drives results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="lg:hidden text-center mb-12">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                AI Real Estate Helper
              </h1>
            </Link>
            <p className="text-gray-400">Welcome back</p>
          </div>
          
          {/* Login Card */}
          <div className="bg-white rounded-3xl p-10 shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-gray-600 text-lg">Sign in to your account to continue</p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-3">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="mt-3 text-right">
                  <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-black transition-colors duration-300 font-medium">
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl mt-8"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <FiArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-black hover:text-gray-800 font-semibold transition-colors duration-300">
                  Start your free trial
                </Link>
              </p>
            </div>
          </div>
          
          {/* Social Proof */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">Trusted by top agents nationwide</p>
          </div>
        </div>
      </div>
    </div>
  );
}
