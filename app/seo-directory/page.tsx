import React from 'react';
import Link from 'next/link';
import { FiExternalLink, FiSearch, FiArrowRight } from 'react-icons/fi';
import validatedClusters from '@/data/keywords/validated-clusters.json';

export default function SEODirectoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">AI Real Estate Helper Resource Center</h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Comprehensive guides and comparisons to help real estate professionals leverage AI technology 
            for contract analysis, property valuations, and listing generation.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {validatedClusters.clusters.reduce((total, cluster) => total + cluster.keywords.length, 0)}
            </div>
            <div className="text-gray-300">Comprehensive Guides</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {validatedClusters.comparison_targets.length}
            </div>
            <div className="text-gray-300">Tool Comparisons</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">50+</div>
            <div className="text-gray-300">Total Resources</div>
          </div>
        </div>

        {/* Comparison Tools Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <FiSearch className="h-6 w-6 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">Tool Comparisons</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validatedClusters.comparison_targets.map((comparison, index) => (
              <Link
                key={index}
                href={`/compare/${comparison.url_slug}`}
                className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 rounded-xl p-6 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {comparison.toolA} vs {comparison.toolB}
                    </h3>
                    <p className="text-gray-400 text-sm">{comparison.target_keyword}</p>
                  </div>
                  <div className="p-1 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <FiExternalLink className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    comparison.priority === 'very-high' ? 'bg-red-500/20 text-red-400' :
                    comparison.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {comparison.priority} priority
                  </span>
                  
                  <FiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Guide Categories */}
        {validatedClusters.clusters.map((cluster, clusterIndex) => (
          <section key={clusterIndex} className="mb-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{cluster.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
              <p className="text-gray-400">{cluster.theme}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cluster.keywords.map((keyword, keywordIndex) => (
                <Link
                  key={keywordIndex}
                  href={`/guides/${keyword.url_slug}`}
                  className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 rounded-xl p-6 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                        {keyword.keyword}
                      </h3>
                      <p className="text-gray-400 text-sm capitalize">{keyword.intent} intent</p>
                    </div>
                    <div className="p-1 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                      <FiExternalLink className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      keyword.priority === 'very-high' ? 'bg-red-500/20 text-red-400' :
                      keyword.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {keyword.priority} priority
                    </span>
                    
                    <FiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 text-lg mb-6">
            Transform your real estate business with AI-powered tools for contract analysis, 
            property valuations, and listing generation.
          </p>
          <Link 
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
          >
            Start Free Trial
            <FiArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-gray-400 text-sm mt-4">
            No credit card required • Setup in under 5 minutes
          </p>
        </section>
      </div>
    </div>
  );
} 