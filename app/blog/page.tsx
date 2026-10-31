import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import BlogCard from '@/components/BlogCard';
import { getContent } from '@/lib/db';
import { publishedPosts } from '@/lib/posts';
import { Newspaper } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const c = getContent();
  return {
    title: 'Blog: Hiring Tips & Home Guides',
    description: 'Practical advice for Pakistani households on hiring maids, cooks, drivers, nannies and carers, and working well with domestic staff.',
    alternates: { canonical: c.settings.siteUrl + '/blog' },
  };
}

export default function Blog() {
  const posts = publishedPosts();
  return (
    <InnerLayout title="Tips & guides for a happier home." eyebrow="BLOG">
      <section className="container section">
        {posts.length ? (
          <div className="blog-grid">{posts.map(p => <BlogCard key={p.id} post={p} />)}</div>
        ) : (
          <div className="blog-empty">
            <Newspaper size={34} />
            <h2>Articles are on their way.</h2>
            <p>We’re preparing helpful guides on hiring and working with domestic staff. Please check back soon.</p>
          </div>
        )}
      </section>
    </InnerLayout>
  );
}
