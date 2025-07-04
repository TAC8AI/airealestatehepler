'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiHome, FiFileText, FiSettings, FiLogOut, FiMenu, FiX, FiPlus, FiCreditCard, FiTrendingUp, FiBarChart } from 'react-icons/fi';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        router.push('/login');
        return;
      }
      
      setUser(data.session.user);
      
      // Fetch user profile to check SEO access
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }
      
      setLoading(false);
    };
    
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="text-center">
          {/* Premium Loading Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-gray-400 mt-4 font-medium">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  // Build navigation items - include SEO dashboard if user has access
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Generate Listing', href: '/dashboard/generate-listing', icon: FiPlus },
    { name: 'Contract Analysis', href: '/dashboard/contract-analysis', icon: FiFileText },
    { name: 'Property Valuation', href: '/dashboard/property-valuation', icon: FiTrendingUp },
    // Conditionally add SEO Dashboard
    ...(profile?.seo === 'yes' ? [{ name: 'SEO Dashboard', href: '/dashboard/seo', icon: FiBarChart }] : []),
    { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
    { name: 'Subscription', href: '/dashboard/subscription', icon: FiCreditCard },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-black/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-2xl">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-300"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <div className="text-xl font-semibold text-white">AI Real Estate Helper</div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Premium Glassmorphism Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-20 h-full w-72 bg-black/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 transform shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-8 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-300 border border-white/10">
              <div className="w-5 h-5 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-xl font-semibold text-white group-hover:text-gray-300 transition-colors duration-300">AI Real Estate Helper</h1>
          </Link>
        </div>

        {/* Navigation */}
        <div className="py-6">
          <nav className="px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 text-white shadow-lg border border-white/20 backdrop-blur-sm'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <item.icon className={`h-4 w-4 ${
                      isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                    }`} />
                  </div>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <div className="mb-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-sm font-medium text-white truncate">
              {user?.email}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Premium Account
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-300 group border border-transparent hover:border-red-500/20"
          >
            <div className="p-2 rounded-lg mr-3 bg-white/5 group-hover:bg-red-500/10 transition-all duration-300">
              <FiLogOut className="h-4 w-4" />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-72 transition-all duration-300">
        <div className="pt-20 lg:pt-0 min-h-screen">
          <div className="p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
