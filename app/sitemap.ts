import { MetadataRoute } from 'next'
import keywordData from '@/data/keywords/validated-clusters.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://airealestatehelper.com'
  const lastModified = new Date()
  
  // Helper function to convert priority to numeric value
  const getPriorityValue = (priority: string): number => {
    switch (priority) {
      case 'very-high': return 0.9
      case 'high': return 0.8
      case 'medium': return 0.7
      default: return 0.6
    }
  }
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
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
  ]
  
  // Dynamic Guide Pages - Generate from all keyword clusters
  const guidePages: MetadataRoute.Sitemap = keywordData.clusters.flatMap(cluster => 
    cluster.keywords.map(keyword => ({
      url: `${baseUrl}/guides/${keyword.url_slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: getPriorityValue(keyword.priority),
    }))
  )
  
  // Dynamic Comparison Pages - Generate from comparison targets
  const comparisonPages: MetadataRoute.Sitemap = keywordData.comparison_targets.map(comparison => ({
    url: `${baseUrl}/compare/${comparison.url_slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: getPriorityValue(comparison.priority),
  }))
  
  // Combine all pages
  return [
    ...staticPages,
    ...guidePages,
    ...comparisonPages,
  ]
} 