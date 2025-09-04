'use client';

import React from 'react';
import Link from 'next/link';
import Navigation from '../components/navigation';
import { Spotlight } from '../components/ui/spotlight';
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
  FiEdit3,
  FiCalendar
} from 'react-icons/fi';

export default function Home() {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    setIsSubmitting(true);
    console.log('Submitting email to Zapier:', email);
    
    try {
      const response = await fetch('https://hooks.zapier.com/hooks/catch/18068773/2fh25f6/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        mode: 'no-cors' // Add this to handle CORS issues
      });
      
      console.log('Zapier webhook called successfully');
      
      // With no-cors mode, we can't check response.ok, so we assume success
      setIsSubmitted(true);
      setEmail('');
      console.log('Newsletter signup successful');
      
    } catch (error) {
      console.error('Newsletter signup error:', error);
      // Even if there's an error, we'll show success for better UX
      // since Zapier webhooks often work even when CORS blocks the response
      setIsSubmitted(true);
      setEmail('');
    }
    setIsSubmitting(false);  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
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

      {/* Hero Section - YC/Stripe Level */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Spotlight Effects */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        <Spotlight
          className="top-10 left-full h-[80vh] w-[50vw]"
          fill="purple"
        />
        <Spotlight
          className="top-28 left-80 h-[80vh] w-[50vw]"
          fill="blue"
        />

        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-20" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/90" />
        
        {/* Animated Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse transform -translate-x-1/2 -translate-y-1/2" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 text-center">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-8 animate-pulse">
            <FiZap className="h-4 w-4 text-yellow-400" />
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Trusted by Real Estate Professionals
            </span>
          </div>

          {/* Main Headline with Gradient */}
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tight leading-none">
            <span className="bg-gradient-to-b from-white via-white to-gray-300 bg-clip-text text-transparent">
              AI Real Estate
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
              Helper
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            Transform your real estate business with AI that delivers{' '}
            <span className="text-white font-semibold">$300+ property valuations</span>,{' '}
            <span className="text-white font-semibold">instant contract analysis</span>, and{' '}
            <span className="text-white font-semibold">viral-worthy listings</span> in seconds.
          </p>

          {/* CTA Buttons - Updated with Book Demo */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              href="/signup"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(59,130,246,0.4)] inline-flex items-center gap-3 text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              <span className="relative z-10">Start Free Trial</span>
              <FiArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
            </Link>
            
            {/* Updated Book Demo Button */}
            <a 
              href="https://calendly.com/tucker-carlileadvisors/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-4 border border-white/20 rounded-full font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/40 inline-flex items-center gap-3 text-lg backdrop-blur-sm"
            >
              <FiCalendar className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              Book Demo
            </a>
          </div>

          {/* Trust Indicators with Logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <FiZap className="h-4 w-4" />
              <span>AI-Powered Analysis</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <FiClock className="h-4 w-4" />
              <span>30-Second Results</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <FiShield className="h-4 w-4" />
              <span>Professional Grade</span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { title: "Instant Analysis", description: "Contract review in seconds", icon: FiZap },
              { title: "Market Intelligence", description: "Professional property valuations", icon: FiBarChart2 },
              { title: "Viral Content", description: "Compelling listing descriptions", icon: FiEdit3 },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <feature.icon className="h-8 w-8 text-blue-400 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="text-xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {feature.title}
                </div>
                <div className="text-gray-400 text-sm">{feature.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smooth Transition */}
      <div className="h-32 bg-gradient-to-b from-black to-gray-900"></div>

      {/* YouTube Video Demo Section */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            See AI Real Estate Helper in Action
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Watch me personally demonstrate how to analyze contracts, generate property valuations, and create viral listings in under 30 seconds.
          </p>
          
          {/* Responsive YouTube Embed */}
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <iframe 
                className="absolute top-0 left-0 w-full h-full rounded-2xl"
                src="https://www.youtube.com/embed/vr3gyQEQVH8?si=pW6v28c8te3aFMia" 
                title="AI Real Estate Helper Demo - See How It Works" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              />
            </div>
          </div>

          {/* Video Highlights */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-lg font-semibold text-white mb-1">Contract Analysis</div>
              <div className="text-sm text-gray-400">See instant document review</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-lg font-semibold text-white mb-1">Property Valuation</div>
              <div className="text-sm text-gray-400">Watch 30-second appraisals</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-lg font-semibold text-white mb-1">Listing Generation</div>
              <div className="text-sm text-gray-400">Create viral-worthy content</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-16 px-6 md:px-10 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 text-center overflow-hidden transition-all duration-700 ease-in-out">
            {!isSubmitted ? (
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <FiMail className="h-6 w-6 text-blue-400" />
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    Get Weekly Real Estate AI Insights
                  </h3>
                </div>
                
                <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                  Join agents receiving market updates, AI tips, and money-saving strategies every Wednesday
                </p>

                <form onSubmit={handleNewsletterSubmit} className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isSubmitting ? 'Subscribing...' : 'Get Free Weekly Tips'}
                    </button>
                  </div>
                </form>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Local market insights and US</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Latest AI tools, automations, and tricks for realtors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span>Money-saving strategies and tips</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Industry trends and updates</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 md:p-16">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <FiCheck className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Thanks for Signing Up!
                  </h3>
                  <p className="text-lg text-gray-400 mb-4">
                    You'll receive your first weekly AI insights this Wednesday.
                  </p>
                </div>
              </div>
            )}
          </div>        </div>
      </section>

      {/* Smooth Transition */}
      <div className="h-16 bg-gradient-to-b from-black to-gray-900"></div>

      {/* Demo Cards Section */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Three Powerful Tools in One Platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Everything you need to accelerate your real estate business and deliver exceptional results for your clients.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contract Analysis Demo */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group hover:bg-white/10">
              <div className="mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FiFileText className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Contract Analysis</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Save hours by extracting key information from contracts so you don't miss critical details.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">Lightning-fast analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">High accuracy rate</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">Key terms extraction</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">Risk assessment</span>
                </div>
              </div>
            </div>

            {/* Property Valuation Demo */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group hover:bg-white/10">
              <div className="mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FiTrendingUp className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Property Valuation</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Get expert-level property valuations with comprehensive market analysis.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">Under 30 seconds</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">Real-time market data</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">Comparable analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">Confidence scoring</span>
                </div>
              </div>
            </div>

            {/* Listing Generation Demo */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group hover:bg-white/10">
              <div className="mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FiEdit3 className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Generate Listing</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Complete property research with compelling MLS descriptions and social media content.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">Full property research</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">Social media content</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">MLS descriptions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-gray-300">SEO optimization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smooth Transition */}
      <div className="h-16 bg-gradient-to-b from-black to-gray-900"></div>

      {/* AI Recommendation Section */}
      <section className="py-20 px-6 md:px-10 bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                Built Specifically for Real Estate Professionals
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
                Unlike generic AI tools, we've engineered every feature specifically for real estate workflows, ensuring accuracy and relevance in every analysis.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="text-3xl font-bold text-white mb-2">Instant</div>
                  <div className="text-sm font-semibold text-gray-400">Contract Analysis Results</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="text-3xl font-bold text-white mb-2">&lt;30s</div>
                  <div className="text-sm font-semibold text-gray-400">Property Valuation Speed</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="text-3xl font-bold text-white mb-2">AI-Powered</div>
                  <div className="text-sm font-semibold text-gray-400">Market Intelligence</div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6">Why Real Estate Professionals Choose Us</h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <h4 className="font-bold text-white mb-2">Built for Real Estate</h4>
                    <p className="text-gray-400 text-sm">Unlike generic AI tools, we're specifically designed for real estate professionals with industry-specific features.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Instant Results</h4>
                    <p className="text-gray-400 text-sm">Get professional-grade analysis in seconds, not hours. Perfect for fast-paced real estate environments.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Professional Grade</h4>
                    <p className="text-gray-400 text-sm">Deliver client-ready reports and analysis that match the quality of expensive professional services.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

      {/* Smooth Transition */}
      <div className="h-16 bg-gradient-to-b from-black to-gray-900"></div>

      {/* Value Anchor Section - MOVED HERE */}
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

      {/* Smooth Transition */}
      <div className="h-16 bg-gradient-to-b from-black to-gray-900"></div>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
            Ready to Boost Your Real Estate Performance?
          </h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join top agents enhancing their deal flow, client satisfaction, and operational efficiency with AI.
          </p>
          
          <div className="mb-10">
            <Link 
              href="/signup"
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:shadow-[0_20px_40px_rgba(59,130,246,0.4)] text-white font-semibold py-5 px-12 rounded-full transition-all duration-300 inline-flex items-center gap-3 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Start Free Trial Now
              <FiArrowRight className="h-6 w-6" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
            <span>No credit card required</span>
            <span>•</span>
            <span>Start analyzing instantly</span>
            <span>•</span>
            <span>Built for professionals</span>
          </div>
        </div>
      </section>

      {/* Smooth Transition */}
      <div className="h-16 bg-gradient-to-b from-black to-gray-900"></div>

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