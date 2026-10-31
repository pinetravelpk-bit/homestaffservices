import 'server-only';
import { randomUUID } from 'node:crypto';
import { db, plainRows } from './db';
import type { Post } from './types';
import type { PostInput } from './validation';

const columns = 'id,slug,title,excerpt,body,cover,status,seoTitle,seoDescription,author,publishedAt,createdAt,updatedAt';

/** Published posts, newest first. */
export function publishedPosts(limit = 100): Post[] {
  return plainRows<Post>(db().prepare(`SELECT ${columns} FROM posts WHERE status='published' ORDER BY publishedAt DESC LIMIT ?`).all(limit));
}

/** Every post including drafts, for the admin panel. */
export function allPosts(): Post[] {
  return plainRows<Post>(db().prepare(`SELECT ${columns} FROM posts ORDER BY CASE status WHEN 'draft' THEN 0 ELSE 1 END, COALESCE(NULLIF(publishedAt,''),updatedAt) DESC`).all());
}

export function publishedPost(slug: string): Post | undefined {
  return db().prepare(`SELECT ${columns} FROM posts WHERE slug=? AND status='published'`).get(slug) as Post | undefined;
}

export class SlugTakenError extends Error {}

/** Create (no id) or update (with id) a post. Returns the saved post, or undefined when the id does not exist. */
export function savePost(input: PostInput & { id?: string }): Post | undefined {
  const d = db();
  const now = new Date().toISOString();
  const clash = d.prepare('SELECT id FROM posts WHERE slug=?').get(input.slug) as { id: string } | undefined;
  if (clash && clash.id !== input.id) throw new SlugTakenError('Another post already uses this URL slug.');
  const existing = input.id ? (d.prepare(`SELECT ${columns} FROM posts WHERE id=?`).get(input.id) as Post | undefined) : undefined;
  if (input.id && !existing) return undefined;
  // Keep the first publish date; set it when a post is first published. An explicit date from the editor wins.
  const publishedAt = input.status === 'published' ? input.publishedAt || existing?.publishedAt || now : input.publishedAt || existing?.publishedAt || '';
  const id = existing?.id || randomUUID();
  const values = [input.slug, input.title, input.excerpt, input.body, input.cover, input.status, input.seoTitle, input.seoDescription, input.author, publishedAt];
  if (existing) d.prepare('UPDATE posts SET slug=?,title=?,excerpt=?,body=?,cover=?,status=?,seoTitle=?,seoDescription=?,author=?,publishedAt=?,updatedAt=? WHERE id=?').run(...values, now, id);
  else d.prepare(`INSERT INTO posts(slug,title,excerpt,body,cover,status,seoTitle,seoDescription,author,publishedAt,updatedAt,createdAt,id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(...values, now, now, id);
  return d.prepare(`SELECT ${columns} FROM posts WHERE id=?`).get(id) as unknown as Post;
}

export function deletePost(id: string) {
  return db().prepare('DELETE FROM posts WHERE id=?').run(id).changes > 0;
}
