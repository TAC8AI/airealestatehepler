'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiHome, FiFileText, FiSettings, FiLogOut, FiMenu, FiX, FiPlus, FiCreditCard, FiTrendingUp } from 'react-icons/fi';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {/* Premium Loading Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Generate Listing', href: '/dashboard/generate-listing', icon: FiPlus },
    { name: 'Contract Analysis', href: '/dashboard/contract-analysis', icon: FiFileText },
    { name: 'Property Valuation', href: '/dashboard/property-valuation', icon: FiTrendingUp },
    { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
    { name: 'Subscription', href: '/dashboard/subscription', icon: FiCreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-300"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <div className="text-xl font-semibold text-gray-900">AI Real Estate Helper</div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-10 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Premium Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-20 h-full w-72 bg-white border-r border-gray-200 transition-all duration-300 transform shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-8 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center group">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-300">
              <div className="w-5 h-5 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">AI Real Estate Helper</h1>
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
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <item.icon className={`h-4 w-4 ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          <div className="mb-4 p-4 rounded-xl bg-gray-50">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.email}
            </div>
            <div className="text-xs text-gray-500 mt-1">Premium Account</div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 group"
          >
            <div className="p-2 rounded-lg mr-3 bg-gray-100 group-hover:bg-red-100 transition-all duration-300">
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
