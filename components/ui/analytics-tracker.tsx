'use client';

import React, { useEffect } from 'react';

interface AnalyticsTrackerProps {
  pageType: 'comparison' | 'guide';
  keyword: string;
  templateType: string;
}

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ 
  pageType, 
  keyword, 
  templateType 
}) => {
  useEffect(() => {
    // Track page view with custom dimensions
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: `${pageType}: ${keyword}`,
        page_location: window.location.href,
        content_group1: 'Programmatic SEO',
        content_group2: templateType,
        content_group3: keyword
      });
    }
  }, [pageType, keyword, templateType]);

  return null;
};

// CTA Tracking Hook
export const useCTATracking = () => {
  const trackCTA = (ctaType: string, ctaPosition: string, pageTemplate: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'CTA',
        event_label: `${ctaType}_${pageTemplate}`,
        value: ctaPosition
      });
    }
  };

  const trackROICalculator = (action: string, values: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'roi_calculator_interaction', {
        event_category: 'Engagement',
        event_label: action,
        custom_parameters: values
      });
    }
  };

  const trackScrollDepth = (depth: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'scroll', {
        event_category: 'Engagement',
        event_label: `${depth}% scrolled`,
        value: depth
      });
    }
  };

  return { trackCTA, trackROICalculator, trackScrollDepth };
};

// Enhanced CTA Component with Tracking
interface TrackedCTAProps {
  href: string;
  children: React.ReactNode;
  ctaType: string;
  ctaPosition: string;
  pageTemplate: string;
  className?: string;
  onClick?: () => void;
}

export const TrackedCTA: React.FC<TrackedCTAProps> = ({
  href,
  children,
  ctaType,
  ctaPosition,
  pageTemplate,
  className,
  onClick
}) => {
  const { trackCTA } = useCTATracking();

  const handleClick = () => {
    trackCTA(ctaType, ctaPosition, pageTemplate);
    onClick?.();
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

// Scroll Depth Tracker Component
export const ScrollDepthTracker: React.FC = () => {
  const { trackScrollDepth } = useCTATracking();
  const [trackedDepths, setTrackedDepths] = React.useState<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

      // Track at 25%, 50%, 75%, and 100%
      const milestones = [25, 50, 75, 100];
      
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !trackedDepths.has(milestone)) {
          trackScrollDepth(milestone);
          setTrackedDepths(prev => new Set(Array.from(prev).concat(milestone)));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth, trackedDepths]);

  return null;
};

export default AnalyticsTracker; 