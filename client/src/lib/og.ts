/**
 * Open Graph meta tag utilities for Facebook sharing optimization
 */

export interface OGMetaTags {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: string;
}

export function setOGMetaTags(tags: OGMetaTags) {
  // Set or update meta tags in the document head
  const setMetaTag = (property: string, content: string) => {
    let element = document.querySelector(`meta[property="${property}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('property', property);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  setMetaTag('og:title', tags.title);
  setMetaTag('og:description', tags.description);
  setMetaTag('og:url', tags.url);
  setMetaTag('og:type', tags.type || 'article');

  if (tags.image) {
    setMetaTag('og:image', tags.image);
    setMetaTag('og:image:width', '1200');
    setMetaTag('og:image:height', '630');
  }

  // Also set Twitter Card tags
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', tags.title);
  setMetaTag('twitter:description', tags.description);
  if (tags.image) {
    setMetaTag('twitter:image', tags.image);
  }
}

export function getDefaultOGTags(): OGMetaTags {
  return {
    title: 'Just Jessica',
    description: 'Personal essays and reflections on life, motherhood, and identity',
    url: window.location.origin,
    type: 'website'
  };
}
