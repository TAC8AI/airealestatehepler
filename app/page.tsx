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
  FiLock 
} from 'react-icons/fi';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Close More Deals with <br />
              <span className="text-blue-600">AI-Powered Real Estate Insights</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join top-performing agents using AI to swiftly analyze contracts, craft compelling listings, and stay ahead of market trends.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors flex items-center gap-2 text-lg"
              >
                Start Free Trial
                <FiArrowRight className="h-5 w-5" />
              </Link>
              
              <button className="flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-colors">
                <div className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors">
                  <FiPlay className="h-5 w-5 ml-1" />
                </div>
                <span className="font-medium">Watch 2-min Demo</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <FiCheck className="h-4 w-4 text-green-500" />
                <span>Secure Cloud-Based Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="h-4 w-4 text-green-500" />
                <span>Contract Analysis in ~10 Seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="h-4 w-4 text-green-500" />
                <span>High-Accuracy Market Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="h-4 w-4 text-green-500" />
                <span>Trusted by Industry Leaders</span>
              </div>
            </div>
          </div>

          {/* Product Demo */}
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Property Valuation Demo */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Property Valuation</h3>
              <p className="text-gray-600 mb-6">Quickly get accurate valuations and comparable sales with confidence indicators.</p>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900">123 Example Street, Michigan</h4>
                  <div className="text-2xl font-bold text-blue-600 mt-2">$238,000 - $264,000</div>
                  <div className="text-sm text-green-600 font-medium">Confidence: High</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>$130 Price/SqFt</div>
                  <div>Avg. 27 Days on Market</div>
                </div>
              </div>
            </div>

            {/* Contract Analysis Demo */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rapid Contract Analysis</h3>
              <p className="text-gray-600 mb-6">Instantly identify key contract terms, potential risks, and negotiation points clearly.</p>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">Immediate insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Highlights actionable items</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">Standard clause detection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your AI-Powered Real Estate Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering you with precise data, rapid insights, and market intelligence to outperform your competition.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <FiFileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contract Insights</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Quick AI-driven contract reviews</span>
                </li>
                <li className="flex items-center gap-3">
                  <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Clear, actionable insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Improved negotiation clarity</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <FiTrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Valuation Accuracy</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Up-to-date market data</span>
                </li>
                <li className="flex items-center gap-3">
                  <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Comparable property analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Confidence indicators</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <FiBarChart2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Listing Optimization</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Engaging, professional listings</span>
                </li>
                <li className="flex items-center gap-3">
                  <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Conversion-driven templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>SEO-friendly descriptions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Boost Your Real Estate Performance?
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Join hundreds of agents enhancing their deal flow, client satisfaction, and operational efficiency with AI.
          </p>
          
          <div className="mb-8">
            <Link 
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-lg transition-colors inline-flex items-center gap-2 text-lg"
            >
              Start Free Trial Now
              <FiArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-gray-500 text-sm">
            <span>Quick setup, no credit card required</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Expert Support Section */}
      <section className="py-20 px-6 md:px-10 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Need Personalized Guidance?</h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Receive expert support and tailored strategy sessions designed to integrate AI seamlessly into your workflow.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <FiCheck className="h-5 w-5 text-blue-600" />
                  <span>One-on-one consultations</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <FiCheck className="h-5 w-5 text-blue-600" />
                  <span>Workflow optimization</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <FiCheck className="h-5 w-5 text-blue-600" />
                  <span>Practical ROI strategies</span>
                </li>
              </ul>
              <div className="mb-4">
                <a 
                  href="mailto:tucker@carlileadvisors.com"
                  className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <FiMail className="h-5 w-5" />
                  Contact Tucker Carlile
                </a>
              </div>
              <p className="text-gray-500 text-sm">
                tucker@carlileadvisors.com • Expert AI Consultant
              </p>
            </div>
            
            <div>
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiAward className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Premium Agent Support</h4>
                </div>
                <div className="space-y-4 text-gray-600">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span className="font-medium text-gray-900">Typically within 2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Satisfaction Rating:</span>
                    <span className="font-medium text-gray-900">4.9/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Support:</span>
                    <span className="font-medium text-gray-900">Dedicated Support Team</span>
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
    </main>
  );
}
