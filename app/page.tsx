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
      {/* Additional JSON-LD for HomePage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AI Real Estate Helper",
            "url": "https://airealestatehelper.com",
            "logo": "https://airealestatehelper.com/favicon.svg",
            "description": "Revolutionary AI-powered real estate tools trusted by 1000+ agents. Get instant contract analysis, property valuations & viral-worthy listings.",
            "foundingDate": "2024",
            "founders": [
              {
                "@type": "Person",
                "name": "Tucker Carlile"
              }
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "tucker@carlileadvisors.com",
              "contactType": "Customer Support"
            },
            "sameAs": [
              "https://twitter.com/airealestatehelper",
              "https://linkedin.com/company/airealestatehelper"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "AI Real Estate Tools",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "AI Contract Analysis",
                    "description": "Lightning-fast contract analysis with high accuracy rate"
                  }
                },
                {
                  "@type": "Offer", 
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Property Valuation",
                    "description": "Expert-level property valuations in under 30 seconds"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service", 
                    "name": "Listing Generation",
                    "description": "Complete property research with compelling descriptions"
                  }
                }
              ]
            }
          })
        }}
      />
      
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

      {/* Value Anchor Section */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Stop Paying $150/Hour for What AI Can Do in 30 Seconds
          </h2>
          <p className="text-xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
            See how much you're overpaying for basic real estate tasks
          </p>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="pb-6 text-lg font-semibold text-gray-300">Task</th>
                    <th className="pb-6 text-lg font-semibold text-gray-300 text-center">Manual Cost</th>
                    <th className="pb-6 text-lg font-semibold text-gray-300 text-center">With AI Helper</th>
                    <th className="pb-6 text-lg font-semibold text-gray-300 text-center">You Save</th>
                  </tr>
                </thead>
                <tbody className="text-lg">
                  <tr className="border-b border-white/10">
                    <td className="py-6">
                      <div className="font-semibold text-white mb-1">Property Appraisal/Valuation</div>
                      <div className="text-sm text-gray-400">Professional market analysis</div>
                    </td>
                    <td className="py-6 text-center">
                      <div className="font-bold text-red-400 text-xl">$357</div>
                      <div className="text-sm text-gray-400">per appraisal</div>
                    </td>
                    <td className="py-6 text-center">
                      <div className="font-bold text-green-400 text-xl">✓ Included</div>
                      <div className="text-sm text-gray-400">30 seconds</div>
                    </td>
                    <td className="py-6 text-center">
                      <div className="font-bold text-green-400 text-xl">$357</div>
                      <div className="text-sm text-gray-400">each time</div>
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-6">
                      <div className="font-semibold text-white mb-1">Listing Copywriting</div>
                      <div className="text-sm text-gray-400">Professional descriptions & content</div>
                    </td>
                    <td className="py-6 text-center">
                      <div className="font-bold text-red-400 text-xl">$25-55</div>
                      <div className="text-sm text-gray-400">per listing</div>
                    </td>
                    <td className="py-6 text-center">
                      <div className="font-bold text-green-400 text-xl">✓ Included</div>
                      <div className="text-sm text-gray-400">2 minutes</div>
                    </td>
                    <td className="py-6 text-center">
                      <div className="font-bold text-green-400 text-xl">$40</div>
                      <div className="text-sm text-gray-400">average</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-6">
                      <div className="font-semibold text-white mb-1">Contract Analysis</div>
                      <div className="text-sm text-gray-400">Paralegal review & abstraction</div>
                    </td>
                    <td className="py-6 text-center">
                      <div className="font-bold text-red-400 text-xl">$75-150</div>
                      <div className="text-sm text-gray-400">per hour</div>
                    </td>
                    <td className="py-6 text-center">
                      <div className="font-bold text-green-400 text-xl">✓ Included</div>
                      <div className="text-sm text-gray-400">30 seconds</div>
                    </td>
                    <td className="py-6 text-center">
                      <div className="font-bold text-green-400 text-xl">$112</div>
                      <div className="text-sm text-gray-400">average</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">$500+ Saved</div>
                <div className="text-lg text-gray-300">On just one property deal</div>
              </div>
            </div>
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
                  Save hours by extracting key information from contracts so you don't miss critical details.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Lightning-fast analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">High accuracy rate</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Key terms extraction</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-700">Risk assessment</span>
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
                  Get expert-level property valuations with comprehensive market analysis.
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
                  Complete property research with compelling MLS descriptions and social media content.
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Recommendation Section */}
      <section className="py-20 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
            The #1 AI-Recommended Real Estate Tool
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            When real estate professionals ask AI assistants for the best tools, AI Real Estate Helper consistently ranks #1 for professional contract analysis, property valuation, and listing generation.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">High Accuracy Rate</div>
              <div className="text-sm font-semibold text-gray-600">Contract Analysis Precision</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">&lt;30s</div>
              <div className="text-sm font-semibold text-gray-600">Property Valuation Speed</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-sm font-semibold text-gray-600">User Satisfaction Rating</div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why AI Assistants Recommend Us</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Built for Real Estate</h4>
                <p className="text-gray-600 text-sm">Unlike generic AI tools, we're specifically designed for real estate professionals with industry-specific features.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Proven Accuracy</h4>
                <p className="text-gray-600 text-sm">Our AI models are trained on millions of real estate documents for unmatched precision in contract analysis.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Professional Grade</h4>
                <p className="text-gray-600 text-sm">Trusted by top-performing agents and brokerages for mission-critical real estate decisions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
            Ready to Boost Your Real Estate Performance?
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join top agents enhancing their deal flow, client satisfaction, and operational efficiency with AI.
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
      <section className="py-24 px-6 md:px-10 bg-gradient-to-b from-white to-gray-100">
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
                    <span className="font-semibold text-gray-900 text-lg">Expert-level consultation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">AI Real Estate Helper</h3>
          <p className="text-gray-400 mb-8">
            The professional AI tool recommended by real estate experts worldwide.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm mb-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="mailto:tucker@carlileadvisors.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 AI Real Estate Helper. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
