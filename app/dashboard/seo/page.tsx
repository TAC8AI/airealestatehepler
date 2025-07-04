'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiBarChart, FiExternalLink, FiTrendingUp, FiFileText, FiTarget, FiGlobe, FiSearch, FiArrowRight } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import validatedClusters from '@/data/keywords/validated-clusters.json';

export default function SEODashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        return;
      }
      
      setUser(data.session.user);
      setLoading(false);
    };
    
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-gray-400 mt-4 font-medium">Loading SEO Dashboard</p>
        </div>
      </div>
    );
  }

  // Calculate stats from keyword data
  const totalGuidePages = validatedClusters.clusters.reduce((total, cluster) => total + cluster.keywords.length, 0);
  const totalComparisonPages = validatedClusters.comparison_targets.length;
  const totalPages = totalGuidePages + totalComparisonPages;
  const highPriorityKeywords = validatedClusters.clusters.reduce((total, cluster) => 
    total + cluster.keywords.filter(k => k.priority === 'very-high' || k.priority === 'high').length, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-white">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-xl">
              <FiBarChart className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                SEO Dashboard
              </h1>
              <p className="text-lg text-gray-400 mt-1">Track your programmatic SEO performance and organic growth</p>
            </div>
          </div>
          
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">SEO Feature Active</span>
              <span className="text-gray-400">• Programmatic pages deployed and indexed</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FiFileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalGuidePages}</div>
            </div>
            <div className="text-sm text-gray-400">Guide Pages</div>
            <div className="text-xs text-green-400 mt-1">Live & Indexable</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FiTarget className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalComparisonPages}</div>
            </div>
            <div className="text-sm text-gray-400">Comparison Pages</div>
            <div className="text-xs text-green-400 mt-1">AI vs Manual</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FiTrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalPages}</div>
            </div>
            <div className="text-sm text-gray-400">Total SEO Pages</div>
            <div className="text-xs text-blue-400 mt-1">Dynamic Generation</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <FiSearch className="h-5 w-5 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{highPriorityKeywords}</div>
            </div>
            <div className="text-sm text-gray-400">High Priority Keywords</div>
            <div className="text-xs text-orange-400 mt-1">Target Rankings</div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* SEO Directory Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FiGlobe className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">SEO Resource Center</h2>
            </div>
            
            <p className="text-gray-400 mb-6">
              Access all {totalPages} SEO pages, organized by keyword clusters and comparison targets. Perfect for internal linking and content strategy.
            </p>
            
            <Link 
              href="/seo-directory"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors group"
            >
              <FiExternalLink className="h-5 w-5" />
              View SEO Directory
              <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Sitemap Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FiTarget className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">SEO Sitemap</h2>
            </div>
            
            <p className="text-gray-400 mb-6">
              Dynamic sitemap with {totalPages} URLs automatically generated from your keyword data. Submit to Google Search Console for indexing.
            </p>
            
            <Link 
              href="/sitemap.xml"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors group"
            >
              <FiExternalLink className="h-5 w-5" />
              View Sitemap
              <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Keyword Clusters Overview */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FiSearch className="h-6 w-6 text-purple-400" />
            </div>
            Keyword Clusters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validatedClusters.clusters.map((cluster, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-2 capitalize">
                  {cluster.id.replace(/-/g, ' ')}
                </h3>
                <p className="text-sm text-gray-400 mb-3">{cluster.theme}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-400">{cluster.keywords.length} keywords</span>
                  <div className="flex gap-1">
                    {cluster.keywords.map((keyword, kidx) => (
                      <div 
                        key={kidx}
                        className={`w-2 h-2 rounded-full ${
                          keyword.priority === 'very-high' ? 'bg-red-400' :
                          keyword.priority === 'high' ? 'bg-orange-400' :
                          'bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Submit sitemap to Google Search Console
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Monitor keyword rankings weekly
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              Track organic traffic growth in Analytics
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 