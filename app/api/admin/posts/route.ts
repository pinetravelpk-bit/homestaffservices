import { NextResponse } from 'next/server';
import { session, sameOrigin } from '@/lib/auth';
import { allPosts, savePost, deletePost, SlugTakenError } from '@/lib/posts';
import { postSchema } from '@/lib/validation';

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

async function guard(req: Request, write: boolean) {
  if (!(await session())) return json({ error: 'Sign in required.' }, 401);
  if (write && !sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  return null;
}

async function readPost(req: Request) {
  const raw = await req.text();
  if (raw.length > 120000) return { error: json({ error: 'This post is too long.' }, 413) };
  const data = JSON.parse(raw);
  const result = postSchema.safeParse(data);
  if (!result.success) return { error: json({ error: result.error.issues.map(i => (i.path.join('.') || 'post') + ': ' + i.message).slice(0, 3).join('; ') }, 400) };
  return { post: result.data, id: typeof data.id === 'string' ? data.id : undefined };
}

export async function GET(req: Request) {
  return (await guard(req, false)) || json(allPosts());
}

export async function POST(req: Request) {
  const blocked = await guard(req, true);
  if (blocked) return blocked;
  try {
    const r = await readPost(req);
    if (r.error) return r.error;
    return json(savePost(r.post!), 201);
  } catch (e) {
    if (e instanceof SlugTakenError) return json({ error: e.message }, 409);
    return json({ error: 'Unable to save the post.' }, 400);
  }
}

export async function PUT(req: Request) {
  const blocked = await guard(req, true);
  if (blocked) return blocked;
  try {
    const r = await readPost(req);
    if (r.error) return r.error;
    if (!r.id) return json({ error: 'Post id required.' }, 400);
    const saved = savePost({ ...r.post!, id: r.id });
    return saved ? json(saved) : json({ error: 'Post not found.' }, 404);
  } catch (e) {
    if (e instanceof SlugTakenError) return json({ error: e.message }, 409);
    return json({ error: 'Unable to save the post.' }, 400);
  }
}

export async function DELETE(req: Request) {
  const blocked = await guard(req, true);
  if (blocked) return blocked;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return json({ error: 'Post id required.' }, 400);
  return deletePost(id) ? json({ ok: true }) : json({ error: 'Post not found.' }, 404);
}
