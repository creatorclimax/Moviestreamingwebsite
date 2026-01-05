import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getTMDBImageUrl } from '../../lib/tmdb';

interface SeoProps {
  title: string;
  description?: string;
  image?: string | null;
  type?: 'website' | 'article' | 'video.movie' | 'video.tv_show' | 'profile';
}

export default function Seo({ title, description, image, type = 'website' }: SeoProps) {
  // Construct full image URL if it's a TMDB path
  let imageUrl = '';
  
  if (image) {
    if (image.startsWith('http')) {
      imageUrl = image;
    } else {
      imageUrl = getTMDBImageUrl(image, 'w780'); 
    }
  }

  const metaDescription = description 
    ? (description.length > 200 ? description.substring(0, 197) + '...' : description)
    : 'Stream your favorite movies and TV shows.';

  const fullTitle = `${title} | Stream`;

  // Manual cleanup of existing static tags to ensure Helmet's tags take precedence
  // This is a workaround for CSR environments where static tags in index.html might conflict
  useEffect(() => {
    // Selectors for tags we want to control
    const selectors = [
      'meta[name="description"]',
      'meta[property^="og:"]',
      'meta[name^="twitter:"]'
    ];

    const elementsToRemove: Element[] = [];

    selectors.forEach(selector => {
      const elements = document.head.querySelectorAll(selector);
      elements.forEach(el => {
        // Only remove elements that are NOT managed by Helmet (no data-rh attribute)
        // However, Helmet adds attributes dynamically. 
        // Safer strategy: Remove ALL tags of these types that were present before React took over?
        // Or just remove any that don't match our current content?
        // Simplest: Remove all non-helmet tags of this type.
        if (!el.getAttribute('data-rh')) {
           elementsToRemove.push(el);
        }
      });
    });

    elementsToRemove.forEach(el => el.remove());
    
  }, []);

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  );
}
