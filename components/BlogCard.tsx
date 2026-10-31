import { ArrowUpRight, Clock } from 'lucide-react';
import Artwork from './Artwork';
import type { Post } from '@/lib/types';
import { formatDate, readingMinutes } from '@/lib/markdown';

export default function BlogCard({ post }: { post: Post }) {
  return (
    <article className="blog-card">
      <a href={'/blog/' + post.slug} className="blog-card-link" aria-label={post.title}>
        <div className="blog-card-image">
          {post.cover ? <Artwork image={post.cover} label="" /> : <div className="blog-card-placeholder" aria-hidden="true" />}
        </div>
        <div className="blog-card-body">
          <p className="blog-meta">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span><Clock size={12} /> {readingMinutes(post.body)} min read</span>
          </p>
          <h3>{post.title}</h3>
          {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
          <span className="blog-read-more">Read article <ArrowUpRight size={15} /></span>
        </div>
      </a>
    </article>
  );
}
