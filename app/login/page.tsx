'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiMail, FiLock, FiArrowRight, FiShield, FiZap, FiTrendingUp } from 'react-icons/fi';

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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      
      {/* Premium Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Value Props */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-lg">
            <div className="mb-8">
              <Link href="/" className="inline-block">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AI Real Estate Helper
                </h1>
              </Link>
              <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mt-4"></div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
              The Future of Real Estate is Here
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join elite agents using AI to close more deals, analyze contracts instantly, and dominate their markets.
            </p>
            
            {/* Feature Highlights */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <FiZap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Lightning-Fast Contract Analysis</h3>
                  <p className="text-gray-400 text-sm">AI-powered insights in seconds, not hours</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FiTrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Precision Property Valuations</h3>
                  <p className="text-gray-400 text-sm">Market-accurate pricing with confidence scores</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FiShield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Enterprise-Grade Security</h3>
                  <p className="text-gray-400 text-sm">Bank-level encryption for your data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Branding */}
            <div className="lg:hidden text-center mb-12">
              <Link href="/" className="inline-block">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AI Real Estate Helper
                </h1>
              </Link>
              <p className="text-gray-400 mt-2">Welcome back to the future</p>
            </div>
            
            {/* Login Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400">Sign in to your account to continue</p>
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <div className="mt-2 text-right">
                    <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25"
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
                <p className="text-gray-400">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
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
    </div>
  );
}
