import React from 'react';

interface SchemaMarkupProps {
  type: 'article' | 'howto' | 'product' | 'faq';
  data: any;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ type, data }) => {
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
    };

    switch (type) {
      case 'article':
        return {
          ...baseSchema,
          '@type': 'Article',
          headline: data.title,
          author: {
            '@type': 'Organization',
            name: 'AI Real Estate Helper'
          },
          publisher: {
            '@type': 'Organization',
            name: 'AI Real Estate Helper',
            logo: {
              '@type': 'ImageObject',
              url: 'https://airealestatehelper.com/logo.png'
            }
          },
          datePublished: data.datePublished || new Date().toISOString(),
          dateModified: data.dateModified || new Date().toISOString(),
          description: data.description,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url
          }
        };

      case 'howto':
        return {
          ...baseSchema,
          '@type': 'HowTo',
          name: data.title,
          description: data.description,
          step: data.steps?.map((step: any, index: number) => ({
            '@type': 'HowToStep',
            name: step.title,
            text: step.description,
            position: index + 1
          })) || [],
          totalTime: data.totalTime || 'PT8M',
          supply: data.supply || ['Real estate software', 'Property data'],
          tool: 'AI Real Estate Helper'
        };

      case 'product':
        return {
          ...baseSchema,
          '@type': 'SoftwareApplication',
          name: 'AI Real Estate Helper',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            priceValidUntil: '2025-12-31',
            availability: 'https://schema.org/InStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            ratingCount: '12'
          },
          description: 'AI-powered real estate tools for contract analysis, property valuations, and listing generation.'
        };

      case 'faq':
        return {
          ...baseSchema,
          '@type': 'FAQPage',
          mainEntity: data.faqs?.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          })) || []
        };

      default:
        return baseSchema;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSchema(), null, 2)
      }}
    />
  );
};

export default SchemaMarkup; 