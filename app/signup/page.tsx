'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Create user account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Create profile record
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Signup error:', err);
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
              Join elite agents making 10x more commissions.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Instant Contract Analysis</h3>
                <p className="text-gray-400 leading-relaxed">
                  Analyze any contract for hidden risks in seconds, not hours. Never miss important details again.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Market-Accurate Valuations</h3>
                <p className="text-gray-400 leading-relaxed">
                  Get expert-level property valuations with confidence indicators and market data in under 30 seconds.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">High-Converting Listings</h3>
                <p className="text-gray-400 leading-relaxed">
                  Create compelling property listings and social media content that drives results across all platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="lg:hidden text-center mb-12">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                AI Real Estate Helper
              </h1>
            </Link>
            <p className="text-gray-400">Start your free trial</p>
          </div>
          
          {/* Signup Card */}
          <div className="bg-white rounded-3xl p-10 shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Start Your Free Trial</h2>
              <p className="text-gray-600 text-lg">No credit card required • Cancel anytime</p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-3">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3">
                  Business Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                    placeholder="Enter your business email"
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
                    placeholder="Create a secure password"
                    required
                    minLength={6}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Minimum 6 characters
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                    placeholder="Confirm your password"
                    required
                  />
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
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    Start Free Trial
                    <FiArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-black hover:text-gray-800 font-semibold transition-colors duration-300">
                  Sign in here
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
