import { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/content/blog';
import { locales, defaultLocale } from '@/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dealeros.ch';
  
  const pages: MetadataRoute.Sitemap = [];
  
  // Generate URLs for all locales
  locales.forEach((locale) => {
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`;
    
    // Homepage
    pages.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: locale === defaultLocale ? 1 : 0.9,
    });
    
    // Blog index
    pages.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
    
    // Static pages
    const staticPages = ['impressum', 'datenschutz', 'agb'];
    staticPages.forEach((page) => {
      pages.push({
        url: `${baseUrl}/${locale}/${page}`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
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
      });
    });
  });

  return pages;
}
