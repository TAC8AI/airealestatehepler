import { MetadataRoute } from 'next';
import validatedClusters from '@/data/keywords/validated-clusters.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://airealestatehelper.com';
  const currentDate = new Date().toISOString();
  
  // Base pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  ];

  // Generate sitemap entries for all guide pages
  const guidePages: MetadataRoute.Sitemap = [];
  
  validatedClusters.clusters.forEach(cluster => {
    cluster.keywords.forEach(keyword => {
      guidePages.push({
        url: `${baseUrl}/guides/${keyword.url_slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: keyword.priority === 'very-high' ? 0.9 : 
                 keyword.priority === 'high' ? 0.8 : 0.7,
      });
    });
  });

  // Generate sitemap entries for all comparison pages
  const comparisonPages: MetadataRoute.Sitemap = validatedClusters.comparison_targets.map(comparison => ({
    url: `${baseUrl}/compare/${comparison.url_slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: comparison.priority === 'very-high' ? 0.9 : 
             comparison.priority === 'high' ? 0.8 : 0.7,
  }));

  return [...staticPages, ...guidePages, ...comparisonPages];
}

// Helper function to get sitemap data for analysis
export function getSitemapData() {
  const sitemapData = sitemap();
  return {
    totalPages: sitemapData.length,
    highPriorityPages: sitemapData.filter(page => page.priority && page.priority >= 0.8).length,
    guidePages: sitemapData.filter(page => page.url.includes('/guides/')).length,
    comparisonPages: sitemapData.filter(page => page.url.includes('/compare/')).length,
    lastGenerated: new Date().toISOString()
  };
} 