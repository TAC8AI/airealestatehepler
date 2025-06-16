'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-primary-600">AI Real Estate Helper</h1>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-8">
          <h2 className="text-2xl font-semibold mb-2 text-center">Reset Password</h2>
          <p className="text-secondary-600 text-center mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary-100 rounded-full p-2">
                  <FiCheck className="text-primary-600 text-xl" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Check your email</h3>
              <p className="text-secondary-600 mb-6">
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
              <Link href="/login" className="text-primary-600 hover:underline flex items-center justify-center">
                <FiArrowLeft className="mr-2" /> Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div className="mt-6 text-center">
                <Link href="/login" className="text-primary-600 hover:underline flex items-center justify-center">
                  <FiArrowLeft className="mr-2" /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
