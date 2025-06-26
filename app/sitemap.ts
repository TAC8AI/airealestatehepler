import { MetadataRoute } from 'next'

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
  ]
} 