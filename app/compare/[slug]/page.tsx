'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiX, FiZap, FiClock, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import SchemaMarkup from '@/components/ui/schema-markup';
import AnalyticsTracker, { TrackedCTA, ScrollDepthTracker } from '@/components/ui/analytics-tracker';

// This would eventually come from your data/keywords/validated-clusters.json
const comparisonData: Record<string, any> = {
  'ai-contract-analysis-vs-manual-review': {
    toolA: {
      name: 'AI Contract Analysis',
      subtitle: 'AI Real Estate Helper',
      description: 'Automated contract review with instant risk detection and key term extraction in under 30 seconds.',
      features: [
        '30-second analysis time',
        'High accuracy analysis',
        'Automatic risk identification',
        'Key terms extraction',
        'Confidence scoring',
        'Multi-contract types support'
      ],
      pricing: 'Free trial, then $29/month',
      pros: [
        'Instant results save hours per contract',
        'Consistent accuracy eliminates human error',
        'Scales to unlimited contract volume',
        'Built specifically for real estate'
      ],
      cons: [
        'Requires internet connection',
        'New technology adoption curve'
      ]
    },
    toolB: {
      name: 'Manual Review',
      subtitle: 'Traditional Process',
      description: 'Human-led contract analysis requiring legal expertise and significant time investment per document.',
      features: [
        '2-4 hours per contract',
        'Variable accuracy (70-90%)',
        'Manual risk assessment',
        'Human interpretation',
        'Experience-dependent',
        'Limited scalability'
      ],
      pricing: '$75-150/hour (paralegal rates)',
      pros: [
        'Deep contextual understanding',
        'Handles complex edge cases',
        'No technology dependency',
        'Established legal processes'
      ],
      cons: [
        'Extremely time consuming',
        'High cost per contract ($150-300)',
        'Human error prone',
        'Inconsistent quality',
        'Difficult to scale'
      ]
    },
    seo: {
      title: 'AI Contract Analysis vs Manual Review: Complete Comparison for Real Estate Professionals',
      description: 'Compare AI contract analysis and manual review for real estate. See time savings, accuracy rates, and ROI calculations. Which delivers better results for agents?',
      targetKeyword: 'compare manual vs AI contract review'
    },
    comparison: {
      winner: 'toolA',
      savings: '$500+',
      timeReduction: '95%',
      accuracyImprovement: '25%'
    }
  },
  'ai-property-valuations-vs-manual-appraisals': {
    toolA: {
      name: 'AI Property Valuations',
      subtitle: 'AI Real Estate Helper',
      description: 'Instant property valuations with AI-powered market analysis and confidence scoring in under 30 seconds.',
      features: [
        '30-second analysis time',
        'Real-time market data',
        'Comparable analysis',
        'Confidence scoring',
        'Multiple property types',
        'API integration ready'
      ],
      pricing: 'Free trial, then $29/month',
      pros: [
        'Instant results vs weeks of waiting',
        'Consistent methodology and accuracy',
        'Cost effective at scale',
        'Real-time market data integration'
      ],
      cons: [
        'May miss unique property features',
        'Requires quality data inputs'
      ]
    },
    toolB: {
      name: 'Manual Appraisals',
      subtitle: 'Traditional Process',
      description: 'Professional appraisal services requiring on-site inspection and extensive market research.',
      features: [
        '2-3 week turnaround',
        'Physical property inspection',
        'Human expertise',
        'Detailed reporting',
        'Licensed appraiser',
        'Legal compliance'
      ],
      pricing: '$300-500 per appraisal',
      pros: [
        'Deep property understanding',
        'Handles unique properties well',
        'Legal defensibility',
        'Industry standard acceptance'
      ],
      cons: [
        'Very expensive per property',
        'Slow turnaround time',
        'Appraiser availability issues',
        'Subjective variations'
      ]
    },
    seo: {
      title: 'AI Property Valuations vs Manual Appraisals: Which is Better for Real Estate Professionals?',
      description: 'Compare AI property valuations and manual appraisals for speed, cost, and accuracy. See which method delivers better ROI for real estate agents and brokers.',
      targetKeyword: 'AI comparative market analysis tools'
    },
    comparison: {
      winner: 'toolA',
      savings: '$300+',
      timeReduction: '98%',
      accuracyImprovement: '15%'
    }
  },
  'automated-mls-descriptions-vs-manual-copywriting': {
    toolA: {
      name: 'Automated MLS Descriptions',
      subtitle: 'AI Real Estate Helper',
      description: 'AI-generated property descriptions that are SEO-optimized, engaging, and created in minutes.',
      features: [
        '2-minute generation time',
        'SEO-optimized content',
        'Multiple format outputs',
        'Consistent quality',
        'Social media ready',
        'Customizable templates'
      ],
      pricing: 'Free trial, then $29/month',
      pros: [
        'Consistent high-quality output',
        'SEO optimization built-in',
        'Multiple formats from one input',
        'No writer\'s block issues'
      ],
      cons: [
        'May lack personal touches',
        'Requires good property data'
      ]
    },
    toolB: {
      name: 'Manual Copywriting',
      subtitle: 'Traditional Process',
      description: 'Human-written property descriptions requiring creativity, research, and significant time investment.',
      features: [
        '30-60 minutes per listing',
        'Personal creativity',
        'Custom messaging',
        'Variable quality',
        'Experience dependent',
        'Writer\'s block potential'
      ],
      pricing: '$25-55 per description',
      pros: [
        'Highly personalized content',
        'Creative storytelling ability',
        'Local market knowledge',
        'Emotional connection'
      ],
      cons: [
        'Time-intensive process',
        'Inconsistent quality',
        'Writer\'s block delays',
        'Scaling challenges'
      ]
    },
    seo: {
      title: 'Automated MLS Descriptions vs Manual Copywriting: Complete Comparison for Agents',
      description: 'Compare automated MLS description generation with manual copywriting. See time savings, quality, and ROI for real estate marketing.',
      targetKeyword: 'automate MLS descriptions SaaS'
    },
    comparison: {
      winner: 'toolA',
      savings: '$40+',
      timeReduction: '90%',
      accuracyImprovement: '20%'
    }
  }
};

const ComparisonTable = ({ toolA, toolB }: { toolA: any; toolB: any }) => {
  const features = [
    { category: 'Analysis Time', toolA: '30 seconds', toolB: '2-4 hours', winner: 'toolA' },
    { category: 'Accuracy Rate', toolA: 'High accuracy', toolB: '70-90%', winner: 'toolA' },
    { category: 'Cost per Contract', toolA: '$1.00', toolB: '$150-300', winner: 'toolA' },
    { category: 'Scalability', toolA: 'Unlimited', toolB: 'Limited by hours', winner: 'toolA' },
    { category: 'Risk Detection', toolA: 'Automated', toolB: 'Manual', winner: 'toolA' },
    { category: 'Consistency', toolA: 'Always identical', toolB: 'Varies by reviewer', winner: 'toolA' },
    { category: 'Learning Curve', toolA: '5 minutes', toolB: 'Years of experience', winner: 'toolA' },
    { category: 'Edge Cases', toolA: 'Good', toolB: 'Excellent', winner: 'toolB' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-6 py-4 text-left text-white font-semibold">Feature</th>
            <th className="px-6 py-4 text-center text-white font-semibold">{toolA.name}</th>
            <th className="px-6 py-4 text-center text-white font-semibold">{toolB.name}</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b border-white/5">
              <td className="px-6 py-4 text-gray-300 font-medium">{feature.category}</td>
              <td className={`px-6 py-4 text-center ${feature.winner === 'toolA' ? 'text-green-400' : 'text-gray-300'}`}>
                {feature.toolA}
                {feature.winner === 'toolA' && <FiCheck className="inline ml-2 text-green-400" />}
              </td>
              <td className={`px-6 py-4 text-center ${feature.winner === 'toolB' ? 'text-green-400' : 'text-gray-300'}`}>
                {feature.toolB}
                {feature.winner === 'toolB' && <FiCheck className="inline ml-2 text-green-400" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ROICalculator = () => {
  const [contractsPerMonth, setContractsPerMonth] = React.useState(10);
  const [hourlyRate, setHourlyRate] = React.useState(75);
  
  const manualTimePerContract = 2.5; // hours
  const aiTimePerContract = 0.008; // 30 seconds in hours
  
  const monthlyTimeSaved = contractsPerMonth * (manualTimePerContract - aiTimePerContract);
  const monthlyCostSaved = monthlyTimeSaved * hourlyRate;
  const annualSavings = monthlyCostSaved * 12;
  const aiCost = 29; // monthly subscription
  const netMonthlySavings = monthlyCostSaved - aiCost;
  const roi = ((netMonthlySavings * 12) / (aiCost * 12)) * 100;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-white mb-6">Calculate Your ROI</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Your Current Situation</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Contracts per month:</label>
              <input
                type="number"
                value={contractsPerMonth}
                onChange={(e) => setContractsPerMonth(Number(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Your hourly rate ($):</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Your Savings with AI</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Monthly time saved:</span>
              <span className="text-green-400 font-bold">{monthlyTimeSaved.toFixed(1)} hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Monthly cost savings:</span>
              <span className="text-green-400 font-bold">${monthlyCostSaved.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Annual savings:</span>
              <span className="text-green-400 font-bold">${annualSavings.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-gray-300">ROI:</span>
              <span className="text-green-400 font-bold text-xl">{roi.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
        >
          <FiZap className="h-5 w-5" />
          Start Saving Today - Free Trial
        </Link>
      </div>
    </div>
  );
};

export default function ComparisonPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const data = comparisonData[slug];
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Comparison not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const { toolA, toolB, seo, comparison } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Analytics Tracking */}
      <AnalyticsTracker 
        pageType="comparison" 
        keyword={seo.targetKeyword} 
        templateType={`${toolA.name}-vs-${toolB.name}`} 
      />
      <ScrollDepthTracker />
      
      {/* Schema Markup */}
      <SchemaMarkup 
        type="article"
        data={{
          title: seo.title,
          description: seo.description,
          url: `https://airealestatehelper.com/compare/${slug}`,
          datePublished: new Date().toISOString(),
          dateModified: new Date().toISOString()
        }}
      />
      
      {/* SEO Meta Tags */}
      <head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.targetKeyword} />
      </head>

      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <FiArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{seo.title}</h1>
              <p className="text-gray-400 mt-1">{seo.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Comparison Overview */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Quick Comparison Overview</h2>
            <p className="text-gray-300 text-lg">See which approach delivers better ROI for real estate professionals</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tool A Card */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-3xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{toolA.name}</h3>
                <p className="text-blue-300 font-medium">{toolA.subtitle}</p>
                <p className="text-gray-300 mt-3">{toolA.description}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                {toolA.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <FiCheck className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-200">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-300 mb-4">{toolA.pricing}</div>
                <TrackedCTA
                  href="/signup"
                  ctaType="primary"
                  ctaPosition="hero-card"
                  pageTemplate={`comparison-${slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Try {toolA.name} Free
                </TrackedCTA>
              </div>
            </div>

            {/* Tool B Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{toolB.name}</h3>
                <p className="text-gray-400 font-medium">{toolB.subtitle}</p>
                <p className="text-gray-300 mt-3">{toolB.description}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                {toolB.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <FiClock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-400 mb-4">{toolB.pricing}</div>
                <button className="px-6 py-3 bg-gray-600 text-gray-300 font-semibold rounded-xl cursor-not-allowed">
                  Traditional Method
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Comparison */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Feature-by-Feature Comparison</h2>
          <ComparisonTable toolA={toolA} toolB={toolB} />
        </section>

        {/* ROI Calculator */}
        <section className="mb-12">
          <ROICalculator />
        </section>

        {/* Which Tool is Right for You */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Which Approach is Right for You?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4">Choose AI Contract Analysis if you:</h3>
              <ul className="space-y-3">
                {toolA.pros.map((pro: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <FiCheck className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-200">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-400 mb-4">Consider Manual Review if you:</h3>
              <ul className="space-y-3">
                {toolB.pros.map((pro: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <FiCheck className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Contract Reviews?</h2>
          <p className="text-gray-300 text-lg mb-6">
            Join real estate professionals saving hours weekly with AI-powered contract analysis
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TrackedCTA
              href="/signup"
              ctaType="primary"
              ctaPosition="final-cta"
              pageTemplate={`comparison-${slug}`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
            >
              <FiZap className="h-5 w-5" />
              Start Free Trial - No Credit Card Required
            </TrackedCTA>
            <TrackedCTA
              href="/#demo"
              ctaType="secondary"
              ctaPosition="final-cta"
              pageTemplate={`comparison-${slug}`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              Watch Demo
            </TrackedCTA>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Setup in under 5 minutes • Cancel anytime • No long-term commitment
          </p>
        </section>
      </div>
    </div>
  );
} 