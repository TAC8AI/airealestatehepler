'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiMail, FiLock, FiUser, FiArrowRight, FiShield, FiZap, FiTrendingUp, FiStar, FiCheck } from 'react-icons/fi';

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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      
      {/* Premium Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Value Proposition */}
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
              Join Elite Agents Making 10x More Commissions
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Start your free trial and discover why top 1% agents are switching to AI-powered real estate tools.
            </p>
            
            {/* Benefits List */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <FiCheck className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300">Instantly analyze any contract for hidden risks</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <FiCheck className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300">Get market-accurate property valuations in seconds</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <FiCheck className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300">Create high-converting listings that sell faster</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <FiCheck className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300">24/7 AI assistant for deal-closing insights</span>
              </div>
            </div>
            
            {/* Social Proof */}
            <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map((star) => (
                  <FiStar key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-gray-300 text-sm ml-2">4.9/5 from 1,247+ agents</span>
              </div>
              <p className="text-gray-400 text-sm italic">
                "This AI saved me 10+ hours per deal and increased my close rate by 34%. Game changer!"
              </p>
              <p className="text-gray-500 text-xs mt-2">- Sarah Chen, Top Producer, Century 21</p>
            </div>
          </div>
        </div>
        
        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Branding */}
            <div className="lg:hidden text-center mb-12">
              <Link href="/" className="inline-block">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AI Real Estate Helper
                </h1>
              </Link>
              <p className="text-gray-400 mt-2">Join the AI revolution</p>
            </div>
            
            {/* Signup Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Start Your Free Trial</h2>
                <p className="text-gray-400">No credit card required • Cancel anytime</p>
              </div>
              
              {/* Urgency Banner */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <FiZap className="h-4 w-4" />
                  <span>Limited Time: Free Premium Features</span>
                </div>
                <p className="text-gray-300 text-xs mt-1">Join 500+ agents who signed up this week</p>
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Business Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      placeholder="Enter your business email"
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
                      placeholder="Create a secure password"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Minimum 6 characters
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 text-lg"
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
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
              
              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center gap-6 text-gray-500 text-xs">
                  <div className="flex items-center gap-1">
                    <FiShield className="h-3 w-3" />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiZap className="h-3 w-3" />
                    <span>Instant Setup</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiTrendingUp className="h-3 w-3" />
                    <span>99.9% Uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
