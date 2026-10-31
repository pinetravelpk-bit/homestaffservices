import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import Artwork from '@/components/Artwork';
import BlogCard from '@/components/BlogCard';
import { getContent } from '@/lib/db';
import { publishedPost, publishedPosts } from '@/lib/posts';
import { renderMarkdown, readingMinutes, formatDate, markdownToText } from '@/lib/markdown';
import { telHref } from '@/lib/phone';
import { ArrowLeft, ArrowUpRight, Clock, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

const description = (p: { seoDescription: string; excerpt: string; body: string }) => p.seoDescription || p.excerpt || markdownToText(p.body).slice(0, 160);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = publishedPost(slug);
  if (!post) return { title: 'Article not found' };
  const site = getContent().settings.siteUrl;
  const url = site + '/blog/' + post.slug;
  const image = post.cover && !post.cover.startsWith('art:') ? site + post.cover : undefined;
  return {
    title: post.seoTitle || post.title,
    description: description(post),
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: post.seoTitle || post.title, description: description(post), publishedTime: post.publishedAt, modifiedTime: post.updatedAt, images: image ? [image] : undefined },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = publishedPost(slug);
  if (!post) notFound();
  const c = getContent();
  const s = c.settings;
  const more = publishedPosts(4).filter(p => p.id !== post.id).slice(0, 3);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: description(post),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: post.author || s.brand },
    publisher: { '@type': 'Organization', name: s.brand, logo: { '@type': 'ImageObject', url: s.siteUrl + '/logo.webp' } },
    mainEntityOfPage: s.siteUrl + '/blog/' + post.slug,
    ...(post.cover && !post.cover.startsWith('art:') ? { image: s.siteUrl + post.cover } : {}),
  };
  return (
    <InnerLayout title={post.title} eyebrow="BLOG">
      <article className="container section blog-article">
        <div className="blog-article-main">
          <p className="blog-meta">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span><Clock size={12} /> {readingMinutes(post.body)} min read</span>
            {post.author && <span>By {post.author}</span>}
          </p>
          {post.cover && <Artwork image={post.cover} label={post.title} className="blog-cover" priority />}
          <div className="blog-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
          <a href="/blog" className="blog-back"><ArrowLeft size={15} /> All articles</a>
        </div>
        <aside className="blog-aside">
          <p className="eyebrow">NEED HELP AT HOME?</p>
          <h3>Let’s find the right person for your household.</h3>
          <p>Tell us what you need and our team will get back to you.</p>
          {s.phone && <a className="button" href={telHref(s.phone)}><Phone size={16} /> Call {s.phone}</a>}
          <a className="button outline" href="/contact">Send your requirements <ArrowUpRight size={15} /></a>
          {s.whatsapp && <a className="blog-aside-wa" href={'https://wa.me/' + s.whatsapp} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>}
        </aside>
      </article>
      {more.length > 0 && (
        <section className="container section blog-more">
          <p className="eyebrow">KEEP READING</p>
          <h2>More from our blog.</h2>
          <div className="blog-grid">{more.map(p => <BlogCard key={p.id} post={p} />)}</div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    </InnerLayout>
  );
}
