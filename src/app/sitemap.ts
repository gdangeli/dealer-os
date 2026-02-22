import { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/content/blog';
import { locales, defaultLocale } from '@/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.dealeros.ch';
  
  const pages: MetadataRoute.Sitemap = [];
  
  // Generate URLs for all locales
  locales.forEach((locale) => {
    // Homepage - always include with locale prefix for consistency
    pages.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: locale === defaultLocale ? 1 : 0.9,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}`])
        ),
      },
    });
    
    // Blog index
    pages.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}/blog`])
        ),
      },
    });
    
    // Hilfe (Support) page
    pages.push({
      url: `${baseUrl}/${locale}/hilfe`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}/hilfe`])
        ),
      },
    });
    
    // Kontakt page
    pages.push({
      url: `${baseUrl}/${locale}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}/kontakt`])
        ),
      },
    });
    
    // Static legal pages
    const staticPages = [
      { slug: 'impressum', priority: 0.3 },
      { slug: 'datenschutz', priority: 0.3 },
      { slug: 'agb', priority: 0.3 },
    ];
    
    staticPages.forEach(({ slug, priority }) => {
      pages.push({
        url: `${baseUrl}/${locale}/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/${slug}`])
          ),
        },
      });
    });
    
    // Blog posts
    const blogPosts = getAllBlogPosts();
    blogPosts.forEach((post) => {
      pages.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/blog/${post.slug}`])
          ),
        },
      });
    });
  });

  return pages;
}
