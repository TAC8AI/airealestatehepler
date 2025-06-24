'use client';

import React from 'react';
import Link from 'next/link';
import Navigation from '../components/navigation';
import { 
  FiArrowRight, 
  FiCheck, 
  FiStar, 
  FiBarChart2, 
  FiFileText, 
  FiTrendingUp, 
  FiZap, 
  FiShield, 
  FiTarget, 
  FiDollarSign, 
  FiClock, 
  FiUsers, 
  FiAward, 
  FiMail, 
  FiPlay, 
  FiEye, 
  FiLock, 
  FiExternalLink, 
  FiEdit3 
} from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-black via-gray-900 to-black pt-20 pb-32 px-6 md:px-10 text-white">
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            AI Real Estate Helper
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            Empowering you with precise data, rapid insights, and market intelligence to 
            outperform your competition.
          </p>
          
          {/* CTA Button */}
          <div className="mb-16">
            <Link 
              href="/signup"
              className="bg-white hover:bg-gray-100 text-black font-semibold py-5 px-12 rounded-full transition-all duration-300 inline-flex items-center gap-3 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Start Free Trial Now
              <FiArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
            <span>Quick setup, no credit card required</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Demo Cards Section */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contract Analysis Demo */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FiFileText className="h-7 w-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Contract Analysis</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We'll save you hours by extracting the key information from your contract so you don't miss a thing.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">3-10 second analysis time</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">99.7% accuracy rate</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Key terms extraction</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Risk assessment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Standard clause detection</span>
                </div>
              </div>
            </div>

            {/* Property Valuation Demo */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FiTrendingUp className="h-7 w-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Property Valuation</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get a full McKinsey level or expert level real estate valuation on your property.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Under 30 seconds</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Real-time market data</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Comparable analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Confidence scoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Market trend insights</span>
                </div>
              </div>
            </div>

            {/* Listing Generation Demo */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FiEdit3 className="h-7 w-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Generate Listing</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We'll research property for you, get all the information, and then we'll help you write appealing social media content and highly converting MLS descriptions.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Full property research</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Social media content</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">MLS descriptions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">SEO optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Multi-platform ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Contract Analysis, Property Valuation, Generate Listing
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Empowering you with precise data, rapid insights, and market intelligence to outperform your competition.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <FiFileText className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contract Analysis</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center gap-4">
                  <FiCheck className="h-5 w-5 text-black flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <span>We'll save you hours by extracting the key information from your contract so you don't miss a thing</span>
                </li>
                <li className="flex items-center gap-4">
                  <FiCheck className="h-5 w-5 text-black flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <span>Clear, actionable insights with risk assessment</span>
                </li>
                <li className="flex items-center gap-4">
                  <FiCheck className="h-5 w-5 text-black flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <span>Improved negotiation clarity and confidence</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <FiTrendingUp className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Property Valuation</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center gap-4">
                  <FiCheck className="h-5 w-5 text-black flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <span>Get a full McKinsey level or expert level real estate valuation on your property</span>
                </li>
                <li className="flex items-center gap-4">
                  <FiCheck className="h-5 w-5 text-black flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <span>Comparable property analysis with confidence indicators</span>
                </li>
                <li className="flex items-center gap-4">
                  <FiCheck className="h-5 w-5 text-black flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <span>Up-to-date market data and trend insights</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <FiBarChart2 className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Generate Listing</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center gap-4">
                  <FiCheck className="h-5 w-5 text-black flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <span>We'll research property for you and help you write appealing social media content and highly converting MLS descriptions</span>
                </li>
                <li className="flex items-center gap-4">
                  <FiCheck className="h-5 w-5 text-black flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <span>Multi-platform content for maximum reach</span>
                </li>
                <li className="flex items-center gap-4">
                  <FiCheck className="h-5 w-5 text-black flex-shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <span>SEO-optimized descriptions for better visibility</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
            Ready to Boost Your Real Estate Performance?
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join hundreds of agents enhancing their deal flow, client satisfaction, and operational efficiency with AI.
          </p>
          
          <div className="mb-10">
            <Link 
              href="/signup"
              className="bg-black hover:bg-gray-800 text-white font-semibold py-5 px-12 rounded-full transition-all duration-300 inline-flex items-center gap-3 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Start Free Trial Now
              <FiArrowRight className="h-6 w-6" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
            <span>Quick setup, no credit card required</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Expert Support Section */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">Need AI Automation?</h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Get expert AI automation consulting and custom solutions designed to transform your business operations.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-4 text-gray-700">
                  <FiCheck className="h-6 w-6 text-black" />
                  <span className="text-lg">Custom AI workflow automation</span>
                </li>
                <li className="flex items-center gap-4 text-gray-700">
                  <FiCheck className="h-6 w-6 text-black" />
                  <span className="text-lg">Business process optimization</span>
                </li>
                <li className="flex items-center gap-4 text-gray-700">
                  <FiCheck className="h-6 w-6 text-black" />
                  <span className="text-lg">Enterprise AI solutions</span>
                </li>
              </ul>
              <div className="mb-6">
                <a 
                  href="https://carlileadvisors.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <FiExternalLink className="h-6 w-6" />
                  Visit CarlileAdvisors.com
                </a>
              </div>
              <p className="text-gray-500">
                tucker@carlileadvisors.com • Expert AI Automation Consultant
              </p>
            </div>
            
            <div>
              <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FiAward className="h-10 w-10 text-black" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900">Premium AI Consulting</h4>
                </div>
                <div className="space-y-6 text-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Response Time:</span>
                    <span className="font-semibold text-gray-900 text-lg">Typically within 2 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Client Rating:</span>
                    <span className="font-semibold text-gray-900 text-lg">4.9/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Support:</span>
                    <span className="font-semibold text-gray-900 text-lg">Dedicated Expert Team</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-10 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">AI Real Estate Helper</h3>
              <p className="text-gray-400 mb-4 max-w-md">
                Trusted by ambitious real estate professionals to deliver accurate insights and elevate performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard/property-valuation" className="hover:text-white transition-colors">Property Valuation</Link></li>
                <li><Link href="/dashboard/contract-analysis" className="hover:text-white transition-colors">Contract Analysis</Link></li>
                <li><Link href="/dashboard/generate-listing" className="hover:text-white transition-colors">AI Listings</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:tucker@carlileadvisors.com" className="hover:text-white transition-colors">Contact Expert</a></li>
                <li><Link href="/dashboard/settings" className="hover:text-white transition-colors">Settings</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} AI Real Estate Helper. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
