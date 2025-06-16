import { supabase } from './supabase';
import { redirect } from 'next/navigation';

/**
 * Utility functions for authentication and session management
 */

/**
 * Get the current user session
 * Returns the session object or null if not authenticated
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Unexpected error getting session:', error);
    return null;
  }
}

/**
 * Get the current user
 * Returns the user object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Unexpected error getting user:', error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 * Can be used in server components
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return session;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error signing out:', error);
    return false;
  }
}

/**
 * Create a new user account
 */
export async function signUp(email: string, password: string, userData?: Record<string, any>) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    if (error) {
      console.error('Error signing up:', error);
      return { user: null, error: error.message };
    }
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Unexpected error signing up:', error);
    return { user: null, error: error.message || 'An unexpected error occurred' };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing in:', error);
      return { session: null, error: error.message };
    }
    
    return { session: data.session, error: null };
  } catch (error: any) {
    console.error('Unexpected error signing in:', error);
    return { session: null, error: error.message || 'An unexpected error occurred' };
  }
}
