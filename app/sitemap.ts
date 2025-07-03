import { MetadataRoute } from 'next'
import keywordData from '@/data/keywords/validated-clusters.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://airealestatehelper.com'
  const lastModified = new Date()
  
  return [
    // Main pages
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    
    // Dashboard pages
    {
      url: `${baseUrl}/dashboard`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard/contract-analysis`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard/property-valuation`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard/generate-listing`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard/settings`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dashboard/subscription`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // Auth pages
    {
      url: `${baseUrl}/forgot-password`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/reset-password`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    
    // SEO Directory
    {
      url: `${baseUrl}/seo-directory`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    
    // Programmatic SEO Comparison Pages
    {
      url: `${baseUrl}/compare/ai-contract-analysis-vs-manual-review`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare/ai-property-valuations-vs-manual-appraisals`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare/automated-mls-descriptions-vs-manual-copywriting`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    
    // Programmatic SEO Guide Pages
    {
      url: `${baseUrl}/guides/ai-real-estate-contract-review-software`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides/automate-mls-descriptions-saas`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides/30-second-property-valuation-saas`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
} 