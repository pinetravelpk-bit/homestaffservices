import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/db';
import { publishedPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const c = getContent();
  const site = c.settings.siteUrl;
  const pages = ['', '/about', '/contact', '/careers', '/privacy', '/terms', ...c.services.filter(s => s.active).map(s => '/services/' + s.slug), ...c.areas.filter(a => a.active).map(a => '/areas/' + a.slug)];
  return [
    ...pages.map(path => ({ url: site + path, changeFrequency: 'monthly' as const, priority: path ? 0.7 : 1 })),
    { url: site + '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
    ...publishedPosts().map(p => ({ url: site + '/blog/' + p.slug, lastModified: new Date(p.updatedAt), changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
