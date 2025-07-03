'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiClock, FiUsers, FiTrendingUp, FiZap, FiFileText, FiDollarSign } from 'react-icons/fi';
import SchemaMarkup from '@/components/ui/schema-markup';
import AnalyticsTracker, { TrackedCTA, ScrollDepthTracker } from '@/components/ui/analytics-tracker';

// This would eventually come from your data/keywords/validated-clusters.json
const guideData: Record<string, any> = {
  'ai-real-estate-contract-review-software': {
    title: 'Complete Guide: AI Real Estate Contract Review Software for Professionals',
    description: 'Learn how AI contract review software transforms real estate workflows. Compare tools, best practices, and ROI calculations for agents and brokers.',
    targetKeyword: 'AI real estate contract review software',
    readTime: '8 min read',
    lastUpdated: 'January 3, 2025',
    sections: {
      definition: {
        title: 'What is AI Real Estate Contract Review Software?',
        content: 'AI real estate contract review software uses artificial intelligence to automatically analyze property contracts, extract key terms, identify potential risks, and provide instant insights that traditionally required hours of manual legal review.',
        stats: [
          { number: '95%', label: 'Time Saved' },
          { number: '$500+', label: 'Cost Reduction' },
          { number: '30s', label: 'Analysis Time' }
        ]
      },
      benefits: [
        {
          title: 'Massive Time Savings',
          description: 'Reduce contract review time from 2-4 hours to under 30 seconds, allowing agents to focus on client relationships and deal-making.',
          icon: 'FiClock'
        },
        {
          title: 'Cost Reduction',
          description: 'Eliminate $150-300 paralegal fees per contract while maintaining professional-grade accuracy and thoroughness.',
          icon: 'FiDollarSign'
        },
        {
          title: 'Improved Accuracy',
          description: 'AI systems maintain high consistency in identifying key terms and risks, eliminating human error and oversight.',
          icon: 'FiCheck'
        },
        {
          title: 'Instant Scalability',
          description: 'Process unlimited contracts simultaneously without additional time or resource investment.',
          icon: 'FiTrendingUp'
        }
      ],
      howItWorks: [
        {
          step: 1,
          title: 'Upload Your Contract',
          description: 'Simply drag and drop or upload your purchase agreement, lease, or listing contract in PDF format.'
        },
        {
          step: 2, 
          title: 'AI Analysis Begins',
          description: 'Advanced machine learning algorithms scan every clause, term, and condition for key information and potential risks.'
        },
        {
          step: 3,
          title: 'Get Instant Results', 
          description: 'Receive a comprehensive report with extracted data, risk assessments, and actionable insights in under 30 seconds.'
        },
        {
          step: 4,
          title: 'Make Informed Decisions',
          description: 'Use the insights to negotiate better terms, avoid pitfalls, and close deals with confidence.'
        }
      ],
      tools: [
        {
          name: 'AI Real Estate Helper',
          description: 'Comprehensive AI platform for contract analysis, property valuations, and listing generation.',
          features: [
            '30-second contract analysis',
            'High accuracy analysis',
            'Multi-contract type support',
            'Risk scoring system',
            'Free trial available'
          ],
          pricing: 'Free trial, then $29/month',
          highlighted: true
        },
        {
          name: 'ContractWorks',
          description: 'Enterprise contract management with basic AI features.',
          features: [
            'Contract storage',
            'Basic AI extraction',
            'Team collaboration',
            'Security compliance'
          ],
          pricing: 'Starting at $600/month'
        },
        {
          name: 'Manual Legal Review',
          description: 'Traditional paralegal or attorney contract review services.',
          features: [
            'Human expertise',
            'Complex case handling',
            'Legal liability coverage',
            'Established processes'
          ],
          pricing: '$75-150/hour'
        }
      ]
    }
  },
  'automate-mls-descriptions-saas': {
    title: 'Complete Guide: Automate MLS Descriptions with SaaS for Real Estate Agents',
    description: 'Discover how to automate MLS listing descriptions using AI SaaS tools. Save hours per listing while creating compelling, SEO-optimized property descriptions.',
    targetKeyword: 'automate MLS descriptions SaaS',
    readTime: '7 min read',
    lastUpdated: 'January 3, 2025',
    sections: {
      definition: {
        title: 'What is MLS Description Automation SaaS?',
        content: 'MLS description automation SaaS uses artificial intelligence to generate compelling, SEO-optimized property descriptions for Multiple Listing Service platforms, transforming basic property data into engaging marketing copy that attracts buyers.',
        stats: [
          { number: '85%', label: 'Time Saved' },
          { number: '$40+', label: 'Value Per Listing' },
          { number: '2min', label: 'Generation Time' }
        ]
      },
      benefits: [
        {
          title: 'Consistent Quality',
          description: 'Generate professional, engaging descriptions every time without writer\'s block or quality variations.',
          icon: 'FiCheck'
        },
        {
          title: 'SEO Optimization',
          description: 'Built-in SEO best practices ensure your listings rank higher in search results and attract more qualified leads.',
          icon: 'FiTrendingUp'
        },
        {
          title: 'Time Efficiency',
          description: 'Create compelling descriptions in minutes instead of hours, allowing more time for client relationships.',
          icon: 'FiClock'
        },
        {
          title: 'Multiple Formats',
          description: 'Generate descriptions for MLS, social media, websites, and marketing materials from a single input.',
          icon: 'FiFileText'
        }
      ]
    }
  },
  'automate-mls-descriptions-saas': {
    title: 'Complete Guide: Automate MLS Descriptions with SaaS for Real Estate Agents',
    description: 'Discover how to automate MLS listing descriptions using AI SaaS tools. Save hours per listing while creating compelling, SEO-optimized property descriptions.',
    targetKeyword: 'automate MLS descriptions SaaS',
    readTime: '7 min read',
    lastUpdated: 'January 3, 2025',
    sections: {
      definition: {
        title: 'What is MLS Description Automation SaaS?',
        content: 'MLS description automation SaaS uses artificial intelligence to generate compelling, SEO-optimized property descriptions for Multiple Listing Service platforms, transforming basic property data into engaging marketing copy that attracts buyers.',
        stats: [
          { number: '85%', label: 'Time Saved' },
          { number: '$40+', label: 'Value Per Listing' },
          { number: '2min', label: 'Generation Time' }
        ]
      },
      benefits: [
        {
          title: 'Consistent Quality',
          description: 'Generate professional, engaging descriptions every time without writer\'s block or quality variations.',
          icon: 'FiCheck'
        },
        {
          title: 'SEO Optimization',
          description: 'Built-in SEO best practices ensure your listings rank higher in search results and attract more qualified leads.',
          icon: 'FiTrendingUp'
        },
        {
          title: 'Time Efficiency',
          description: 'Create compelling descriptions in minutes instead of hours, allowing more time for client relationships.',
          icon: 'FiClock'
        },
        {
          title: 'Multiple Formats',
          description: 'Generate descriptions for MLS, social media, websites, and marketing materials from a single input.',
          icon: 'FiFileText'
        }
      ],
      howItWorks: [
        {
          step: 1,
          title: 'Input Property Data',
          description: 'Enter basic property information including address, features, price, and key selling points.'
        },
        {
          step: 2,
          title: 'AI Content Generation',
          description: 'Advanced algorithms analyze your data and generate multiple description variations optimized for different platforms.'
        },
        {
          step: 3,
          title: 'Review and Customize',
          description: 'Review generated content and make any personalized adjustments to match your style and brand.'
        },
        {
          step: 4,
          title: 'Deploy Across Platforms',
          description: 'Use the optimized descriptions across MLS, social media, websites, and marketing materials.'
        }
      ],
      tools: [
        {
          name: 'AI Real Estate Helper',
          description: 'Comprehensive platform for listing descriptions, contract analysis, and property valuations.',
          features: [
            '2-minute generation time',
            'SEO-optimized content',
            'Multiple format outputs',
            'Social media ready',
            'Free trial available'
          ],
          pricing: 'Free trial, then $29/month',
          highlighted: true
        },
        {
          name: 'Jasper AI',
          description: 'General AI writing tool with real estate templates.',
          features: [
            'Writing templates',
            'Content generation',
            'Brand voice training',
            'Team collaboration'
          ],
          pricing: 'Starting at $39/month'
        },
        {
          name: 'Manual Copywriting',
          description: 'Traditional human-written property descriptions.',
          features: [
            'Personal creativity',
            'Custom messaging',
            'Local market knowledge',
            'Emotional storytelling'
          ],
          pricing: '$25-55 per listing'
        }
      ]
    }
  },
  '30-second-property-valuation-saas': {
    title: 'Complete Guide: 30-Second Property Valuation SaaS for Real Estate Professionals',
    description: 'Learn how 30-second property valuation SaaS transforms real estate workflows. Compare tools, accuracy rates, and ROI for instant property analysis.',
    targetKeyword: '30-second property valuation SaaS',
    readTime: '9 min read',
    lastUpdated: 'January 3, 2025',
    sections: {
      definition: {
        title: 'What is 30-Second Property Valuation SaaS?',
        content: '30-second property valuation SaaS leverages artificial intelligence and real-time market data to provide instant, accurate property valuations that traditionally took weeks and hundreds of dollars to obtain.',
        stats: [
          { number: '98%', label: 'Time Saved' },
          { number: '$300+', label: 'Cost Reduction' },
          { number: '30s', label: 'Valuation Time' }
        ]
      },
      benefits: [
        {
          title: 'Instant Results',
          description: 'Get property valuations in 30 seconds instead of waiting 2-3 weeks for traditional appraisals.',
          icon: 'FiClock'
        },
        {
          title: 'Massive Cost Savings',
          description: 'Eliminate $300-500 appraisal fees while maintaining professional-grade accuracy for initial valuations.',
          icon: 'FiDollarSign'
        },
        {
          title: 'Real-Time Market Data',
          description: 'Valuations use current market conditions and recent comparable sales for maximum accuracy.',
          icon: 'FiTrendingUp'
        },
        {
          title: 'Confidence Scoring',
          description: 'Each valuation includes confidence indicators to help you understand the reliability of the estimate.',
          icon: 'FiCheck'
        }
      ],
      howItWorks: [
        {
          step: 1,
          title: 'Enter Property Address',
          description: 'Simply input the property address or upload property details to begin the valuation process.'
        },
        {
          step: 2,
          title: 'AI Market Analysis',
          description: 'AI algorithms analyze comparable sales, market trends, and property characteristics in real-time.'
        },
        {
          step: 3,
          title: 'Instant Valuation',
          description: 'Receive detailed valuation report with confidence score and supporting data in under 30 seconds.'
        },
        {
          step: 4,
          title: 'Use for Decision Making',
          description: 'Leverage valuations for pricing strategy, investment decisions, and client consultations.'
        }
      ],
      tools: [
        {
          name: 'AI Real Estate Helper',
          description: 'Advanced AI valuation platform with 30-second turnaround and high accuracy rates.',
          features: [
            '30-second valuations',
            'Confidence scoring',
            'Market trend analysis',
            'Comparable properties',
            'Free trial available'
          ],
          pricing: 'Free trial, then $29/month',
          highlighted: true
        },
        {
          name: 'Zillow Zestimate',
          description: 'Popular online property valuation tool with basic estimates.',
          features: [
            'Free basic estimates',
            'Historical data',
            'Market trends',
            'Limited accuracy'
          ],
          pricing: 'Free (limited features)'
        },
        {
          name: 'Professional Appraisal',
          description: 'Traditional licensed appraiser services.',
          features: [
            'Legal defensibility',
            'Physical inspection',
            'Detailed reports',
            'Licensed professionals'
          ],
          pricing: '$300-500 per appraisal'
        }
      ]
    }
  }
};

const ROICalculator = ({ keyword }: { keyword: string }) => {
  const [itemsPerMonth, setItemsPerMonth] = React.useState(10);
  const [timePerItem, setTimePerItem] = React.useState(120); // minutes
  const [hourlyRate, setHourlyRate] = React.useState(75);
  
  const automatedTime = 0.5; // minutes
  const monthlyTimeSaved = itemsPerMonth * ((timePerItem - automatedTime) / 60); // hours
  const monthlyCostSaved = monthlyTimeSaved * hourlyRate;
  const annualSavings = monthlyCostSaved * 12;
  const toolCost = 29; // monthly subscription
  const netMonthlySavings = monthlyCostSaved - toolCost;
  const roi = ((netMonthlySavings * 12) / (toolCost * 12)) * 100;

  return (
    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-white mb-6">Calculate Your ROI</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Your Current Situation</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Contracts per month:</label>
              <input
                type="number"
                value={itemsPerMonth}
                onChange={(e) => setItemsPerMonth(Number(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Time per review (minutes):</label>
              <input
                type="number"
                value={timePerItem}
                onChange={(e) => setTimePerItem(Number(e.target.value))}
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
          Get Started - Free Trial
        </Link>
      </div>
    </div>
  );
};

const TableOfContents = ({ sections }: { sections: any }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Table of Contents</h2>
      <ol className="space-y-2 text-gray-300">
        <li><a href="#what-is" className="hover:text-white transition-colors">1. What is {sections.definition.title.split(':')[1]}?</a></li>
        <li><a href="#benefits" className="hover:text-white transition-colors">2. Key Benefits for Real Estate Professionals</a></li>
        <li><a href="#how-it-works" className="hover:text-white transition-colors">3. How the Technology Works</a></li>
        <li><a href="#top-tools" className="hover:text-white transition-colors">4. Top Tools Compared</a></li>
        <li><a href="#implementation" className="hover:text-white transition-colors">5. Implementation Guide</a></li>
        <li><a href="#roi-calculator" className="hover:text-white transition-colors">6. ROI Calculator</a></li>
        <li><a href="#faqs" className="hover:text-white transition-colors">7. Frequently Asked Questions</a></li>
      </ol>
    </div>
  );
};

export default function GuidePage() {
  const params = useParams();
  const keyword = params.keyword as string;
  
  const data = guideData[keyword];
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Guide not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const { title, description, targetKeyword, readTime, lastUpdated, sections } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Analytics Tracking */}
      <AnalyticsTracker 
        pageType="guide" 
        keyword={targetKeyword} 
        templateType={`guide-${keyword}`} 
      />
      <ScrollDepthTracker />
      
      {/* Schema Markup */}
      <SchemaMarkup 
        type="howto"
        data={{
          title: title,
          description: description,
          steps: sections.howItWorks || [],
          totalTime: 'PT8M',
          supply: ['Real estate software', 'Property data']
        }}
      />
      
      {/* SEO Meta Tags */}
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={targetKeyword} />
      </head>

      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <FiArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              <p className="text-gray-400 mt-2">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FiClock className="h-4 w-4" />
              <span>{readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiFileText className="h-4 w-4" />
              <span>By Real Estate AI Experts</span>
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="h-4 w-4" />
              <span>Updated {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Table of Contents */}
        <TableOfContents sections={sections} />

        {/* Introduction */}
        <section id="what-is" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">{sections.definition.title}</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">{sections.definition.content}</p>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            {sections.definition.stats.map((stat: any, index: number) => (
              <div key={index} className="text-center bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-400 mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8">Key Benefits for Real Estate Professionals</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {sections.benefits.map((benefit: any, index: number) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FiCheck className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{benefit.title}</h3>
                </div>
                <p className="text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          {/* First CTA */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
            <p className="text-white font-semibold mb-4">Ready to experience these benefits?</p>
            <TrackedCTA
              href="/signup"
              ctaType="primary"
              ctaPosition="benefits-cta"
              pageTemplate={`guide-${keyword}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
            >
              Try AI Real Estate Helper Free
            </TrackedCTA>
          </div>
        </section>

        {/* How It Works */}
        {sections.howItWorks && (
          <section id="how-it-works" className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">How the Technology Works</h2>
            
            <div className="space-y-6">
              {sections.howItWorks.map((step: any, index: number) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Tools Compared */}
        <section id="top-tools" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8">Top Tools Compared</h2>
          
          <div className="grid gap-6">
            {sections.tools.map((tool: any, index: number) => (
              <div 
                key={index} 
                className={`border rounded-xl p-6 ${
                  tool.highlighted 
                    ? 'bg-gradient-to-r from-blue-500/20 to-green-500/20 border-blue-500/30' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
                    <p className="text-gray-300">{tool.description}</p>
                  </div>
                  {tool.highlighted && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Recommended
                    </div>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {tool.features.map((feature: string, fIndex: number) => (
                        <li key={fIndex} className="flex items-center gap-2 text-gray-300">
                          <FiCheck className="h-4 w-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white mb-4">{tool.pricing}</div>
                    {tool.highlighted ? (
                      <TrackedCTA
                        href="/signup"
                        ctaType="primary"
                        ctaPosition="tools-comparison"
                        pageTemplate={`guide-${keyword}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                      >
                        Start Free Trial
                      </TrackedCTA>
                    ) : (
                      <button className="px-6 py-3 bg-gray-600 text-gray-300 font-semibold rounded-xl cursor-not-allowed">
                        Learn More
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ROI Calculator */}
        <section id="roi-calculator" className="mb-12">
          <ROICalculator keyword={keyword} />
        </section>

        {/* FAQ Section */}
        <section id="faqs" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="bg-white/5 border border-white/10 rounded-xl">
              <summary className="cursor-pointer p-6 font-semibold text-white hover:bg-white/5 transition-colors">
                How accurate is AI contract analysis compared to human review?
              </summary>
              <div className="px-6 pb-6 text-gray-300">
                AI contract analysis achieves 99%+ accuracy for standard real estate contracts, often exceeding human accuracy for routine tasks. While humans excel at complex edge cases, AI provides consistent, error-free analysis for the majority of contracts.
              </div>
            </details>
            
            <details className="bg-white/5 border border-white/10 rounded-xl">
              <summary className="cursor-pointer p-6 font-semibold text-white hover:bg-white/5 transition-colors">
                What types of real estate contracts can be analyzed?
              </summary>
              <div className="px-6 pb-6 text-gray-300">
                Most AI tools support purchase agreements, lease contracts, listing agreements, and rental contracts. Advanced platforms can handle custom contracts and commercial real estate documents.
              </div>
            </details>
            
            <details className="bg-white/5 border border-white/10 rounded-xl">
              <summary className="cursor-pointer p-6 font-semibold text-white hover:bg-white/5 transition-colors">
                Is my contract data secure and confidential?
              </summary>
              <div className="px-6 pb-6 text-gray-300">
                Reputable AI platforms use enterprise-grade encryption, secure cloud storage, and comply with data protection regulations. Look for SOC 2 compliance and clear privacy policies.
              </div>
            </details>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Transform Your Real Estate Business Today</h2>
          <p className="text-gray-300 text-lg mb-6">
            Join real estate professionals already saving time and money with AI-powered automation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
            >
              <FiZap className="h-5 w-5" />
              Start Free Trial
            </Link>
            <Link 
              href="/#demo"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              Watch Demo
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            No credit card required • Setup in under 5 minutes
          </p>
        </section>
      </div>
    </div>
  );
} 