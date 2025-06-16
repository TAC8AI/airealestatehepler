import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../components/Navigation';
import { FiArrowRight, FiCheck, FiStar, FiBarChart2, FiFileText, FiHome, FiTrendingUp } from 'react-icons/fi';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-primary-50 rounded-l-full transform translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-3/4 h-1/2 bg-secondary-50 rounded-tr-full transform -translate-x-1/4 translate-y-1/4"></div>
        </div>
        
        <div className="relative z-10 py-20 md:py-32 px-6 md:px-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">AI-Powered Real Estate Solutions</div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-secondary-900 leading-tight">
                Transform Your <span className="text-primary-600">Real Estate</span> Marketing
              </h1>
              <p className="text-lg mb-8 text-secondary-600 leading-relaxed">
                Generate professional MLS descriptions and social media content for your listings in seconds with AI. Analyze contracts and streamline your workflow.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup" className="btn-primary flex items-center">
                  Get Started <FiArrowRight className="ml-2" />
                </Link>
                <Link href="#features" className="btn-secondary">
                  Learn More
                </Link>
              </div>
              
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-primary-${i*100} flex items-center justify-center text-white text-xs font-bold`}>
                      {i}
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-900">Trusted by 2,000+ real estate professionals</p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FiStar key={i} className="w-4 h-4 text-yellow-400" />
                    ))}
                    <span className="ml-1 text-xs text-secondary-600">4.9/5 rating</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary-100 rounded-full filter blur-xl opacity-70"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary-100 rounded-full filter blur-xl opacity-70"></div>
              
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-secondary-200 bg-white">
                <div className="p-1 bg-secondary-50">
                  <div className="flex space-x-1.5 px-2 py-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4 pb-4 border-b border-secondary-100">
                    <h3 className="text-lg font-semibold mb-2">AI-Generated MLS Description</h3>
                    <p className="text-sm text-secondary-600 leading-relaxed">
                      This stunning 4-bedroom, 3-bath contemporary home offers panoramic mountain views and an open floor plan perfect for entertaining. Featuring a gourmet kitchen with high-end appliances, primary suite with spa-like bathroom, and a spacious backyard with custom pool and outdoor kitchen.
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-secondary-500">Generated in 2.3 seconds</span>
                    </div>
                    <button className="text-xs text-primary-600 font-medium">Copy to clipboard</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">Powerful Features</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">Our AI-powered platform helps real estate professionals save time and create better content.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card group">
              <div className="mb-6 p-4 bg-primary-50 rounded-xl inline-block group-hover:bg-primary-100 transition-colors">
                <FiHome className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-600 transition-colors">Generative Listings</h3>
              <p className="text-secondary-600 mb-4">
                Create professional MLS descriptions and social media content optimized for multiple platforms.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-secondary-700">
                  <FiCheck className="mr-2 text-primary-600" /> MLS descriptions
                </li>
                <li className="flex items-center text-sm text-secondary-700">
                  <FiCheck className="mr-2 text-primary-600" /> Social media posts
                </li>
                <li className="flex items-center text-sm text-secondary-700">
                  <FiCheck className="mr-2 text-primary-600" /> Property highlights
                </li>
              </ul>
            </div>
            
            <div className="feature-card group">
              <div className="mb-6 p-4 bg-primary-50 rounded-xl inline-block group-hover:bg-primary-100 transition-colors">
                <FiFileText className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-600 transition-colors">Contract Analysis</h3>
              <p className="text-secondary-600 mb-4">
                Upload real estate contracts and get AI-powered summaries and insights in seconds.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-secondary-700">
                  <FiCheck className="mr-2 text-primary-600" /> Key terms extraction
                </li>
                <li className="flex items-center text-sm text-secondary-700">
                  <FiCheck className="mr-2 text-primary-600" /> Plain language summaries
                </li>
                <li className="flex items-center text-sm text-secondary-700">
                  <FiCheck className="mr-2 text-primary-600" /> Risk identification
                </li>
              </ul>
            </div>
            
            <div className="feature-card group">
              <div className="mb-6 p-4 bg-primary-50 rounded-xl inline-block group-hover:bg-primary-100 transition-colors">
                <FiBarChart2 className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-600 transition-colors">Dashboard Analytics</h3>
              <p className="text-secondary-600 mb-4">
                Track your listings performance and manage all your real estate content in one place.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-secondary-700">
                  <FiCheck className="mr-2 text-primary-600" /> Content management
                </li>
                <li className="flex items-center text-sm text-secondary-700">
                  <FiCheck className="mr-2 text-primary-600" /> Performance tracking
                </li>
                <li className="flex items-center text-sm text-secondary-700">
                  <FiCheck className="mr-2 text-primary-600" /> Centralized workspace
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-r from-primary-50 to-secondary-50 border-t border-secondary-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-secondary-900">Ready to transform your real estate marketing?</h2>
          <p className="text-lg mb-10 text-secondary-600">Join thousands of real estate professionals using AI to create better listings and save time.</p>
          <Link href="/signup" className="btn-primary px-10 py-4 text-lg inline-flex items-center justify-center">
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-10 bg-secondary-900 text-white border-t border-secondary-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-2">AI Real Estate Helper</h3>
            <p className="text-secondary-300 text-sm max-w-sm">Modern AI tools for real estate professionals. Create listings, analyze contracts, and manage your business with ease.</p>
          </div>
          <div className="flex gap-8 text-secondary-200 text-sm">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/dashboard/generate-listing" className="hover:text-white">New Listing</Link>
            <Link href="/dashboard/contract-analysis" className="hover:text-white">Contract Analysis</Link>
            <Link href="/dashboard/settings" className="hover:text-white">Settings</Link>
          </div>
          <div className="text-secondary-400 text-xs text-right md:text-left">&copy; {new Date().getFullYear()} AI Real Estate Helper. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
