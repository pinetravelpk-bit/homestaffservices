"use client";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Plus, Save, Send, EyeOff, Trash2, ExternalLink, Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, ImagePlus, Eye, PenLine, Upload, Newspaper } from 'lucide-react';
import type { Post } from '@/lib/types';
import { renderMarkdown, slugify, formatDate, readingMinutes } from '@/lib/markdown';

type Draft = Omit<Post, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

const emptyDraft = (): Draft => ({ title: '', slug: '', excerpt: '', body: '', cover: '', status: 'draft', seoTitle: '', seoDescription: '', author: 'Home Staff Services Team', publishedAt: '' });
const toDraft = (p: Post): Draft => ({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, body: p.body, cover: p.cover, status: p.status, seoTitle: p.seoTitle, seoDescription: p.seoDescription, author: p.author, publishedAt: p.publishedAt });
// The date input uses yyyy-mm-dd; store it as noon Pakistan time so the shown date never shifts.
const dateInput = (iso: string) => (iso ? new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }) : '');
const fromDateInput = (v: string) => (v ? new Date(v + 'T12:00:00+05:00').toISOString() : '');

export default function BlogManager({ demo, imageField, onUploaded, setNotice, setError }: {
  demo: boolean;
  imageField: (value: string, onChange: (v: string) => void) => ReactNode;
  onUploaded: (url: string) => void;
  setNotice: (s: string) => void;
  setError: (s: string) => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [original, setOriginal] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const body = useRef<HTMLTextAreaElement>(null);
  const bodyImage = useRef<HTMLInputElement>(null);
  // Where to put the cursor after a toolbar edit; applied once React has updated the text.
  const pendingSelection = useRef<[number, number] | null>(null);
  const dirty = draft !== null && JSON.stringify(draft) !== original;

  useLayoutEffect(() => {
    const el = body.current;
    if (!el || !pendingSelection.current) return;
    const [start, end] = pendingSelection.current;
    pendingSelection.current = null;
    el.focus();
    el.setSelectionRange(start, end);
  }, [draft?.body]);

  useEffect(() => {
    if (demo) { setLoaded(true); return; }
    fetch('/api/admin/posts').then(r => (r.ok ? r.json() : Promise.reject())).then((p: Post[]) => { setPosts(p); setLoaded(true); }).catch(() => setError('Unable to load blog posts. Please sign in again if your session expired.'));
  }, [demo, setError]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function open(next: Draft) {
    if (dirty && !confirm('You have unsaved changes to this article. Discard them?')) return;
    setDraft(next); setOriginal(JSON.stringify(next)); setSlugTouched(!!next.id); setPreview(false); setNotice(''); setError('');
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(d => (d ? { ...d, [key]: value } : d));

  function setTitle(title: string) {
    setDraft(d => (d ? { ...d, title, slug: slugTouched ? d.slug : slugify(title) } : d));
  }

  async function save(status: 'draft' | 'published') {
    if (!draft) return;
    if (demo) { setError('Sign in to the secure admin to publish articles.'); return; }
    setBusy(true); setNotice(''); setError('');
    try {
      const res = await fetch('/api/admin/posts', { method: draft.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...draft, status }) });
      const data = await res.json();
      if (!res.ok) throw Error(data.error || 'Unable to save the article.');
      const saved = data as Post;
      setPosts(list => [saved, ...list.filter(p => p.id !== saved.id)]);
      const next = toDraft(saved);
      setDraft(next); setOriginal(JSON.stringify(next)); setSlugTouched(true);
      setNotice(status === 'published' ? (draft.status === 'published' ? 'Article updated on your website.' : 'Article published! It is now live on your blog.') : draft.status === 'published' ? 'Article unpublished. It is now a hidden draft.' : 'Draft saved. It is not visible on your website yet.');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  async function remove() {
    if (!draft?.id) { setDraft(null); setOriginal(''); return; }
    if (!confirm('Permanently delete this article? This cannot be undone.')) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/admin/posts?id=' + encodeURIComponent(draft.id), { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw Error(data.error || 'Unable to delete.');
      setPosts(list => list.filter(p => p.id !== draft.id));
      setDraft(null); setOriginal('');
      setNotice('Article deleted.');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  async function uploadImage(file: File) {
    if (demo) throw Error('Sign in to the secure admin to upload images.');
    const form = new FormData();
    form.set('file', file);
    const res = await fetch('/api/admin/media', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw Error(data.error || 'Upload failed.');
    onUploaded(data.url);
    return data.url as string;
  }

  // Wrap the selected text (or insert a placeholder) in the body editor.
  function format(before: string, after = '', placeholder = 'text', linePrefix = false) {
    const el = body.current;
    if (!el || !draft) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const selected = value.slice(s, e) || placeholder;
    let insert: string;
    let start: number;
    if (linePrefix) {
      const lead = s === 0 || value[s - 1] === '\n' ? '' : '\n';
      const lines = selected.split('\n');
      insert = lead + lines.map((l, i) => before.replace('1.', i + 1 + '.') + l).join('\n');
      // One line: select its text so typing replaces the placeholder. Several lines: cursor after them.
      start = lines.length === 1 ? s + lead.length + before.length : s + insert.length;
    } else {
      insert = before + selected + after;
      start = s + before.length;
    }
    const end = linePrefix && selected.includes('\n') ? start : start + selected.length;
    pendingSelection.current = [start, end];
    set('body', value.slice(0, s) + insert + value.slice(e));
  }

  function insertAtCursor(text: string) {
    const el = body.current;
    if (!el) { setDraft(d => (d ? { ...d, body: d.body + text } : d)); return; }
    const { selectionEnd: at, value } = el;
    pendingSelection.current = [at + text.length, at + text.length];
    set('body', value.slice(0, at) + text + value.slice(at));
  }

  async function insertImage(file: File) {
    try {
      setBusy(true); setError('');
      const url = await uploadImage(file);
      insertAtCursor('\n\n![Describe the image](' + url + ')\n\n');
      setNotice('Image uploaded and added to the article. Edit the description in brackets.');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); if (bodyImage.current) bodyImage.current.value = ''; }
  }

  const tools: [string, ReactNode, () => void][] = [
    ['Heading', <Heading2 key="h2" size={16} />, () => format('## ', '', 'Heading', true)],
    ['Sub-heading', <Heading3 key="h3" size={16} />, () => format('### ', '', 'Sub-heading', true)],
    ['Bold', <Bold key="b" size={16} />, () => format('**', '**', 'bold text')],
    ['Italic', <Italic key="i" size={16} />, () => format('*', '*', 'italic text')],
    ['Bullet list', <List key="ul" size={16} />, () => format('- ', '', 'List item', true)],
    ['Numbered list', <ListOrdered key="ol" size={16} />, () => format('1. ', '', 'List item', true)],
    ['Quote', <Quote key="q" size={16} />, () => format('> ', '', 'Quote', true)],
    ['Link', <Link2 key="a" size={16} />, () => { const url = prompt('Link address (for example /contact or https://…)'); if (url) format('[', '](' + url.trim() + ')', 'link text'); }],
  ];

  if (!loaded) return <section className="admin-card empty-state"><p>Loading articles…</p></section>;

  return (
    <div className="collection-editor blog-admin">
      <section className="admin-card collection-list">
        <div className="card-heading"><h3>Articles</h3><button aria-label="New article" className="icon-button" onClick={() => open(emptyDraft())}><Plus size={18} /></button></div>
        {posts.map(p => (
          <button key={p.id} className={draft?.id === p.id ? 'selected' : ''} onClick={() => open(toDraft(p))}>
            <strong>{p.title}</strong>
            <small><span className={'post-status ' + p.status}>{p.status === 'published' ? 'Published' : 'Draft'}</span>{p.publishedAt ? ' · ' + formatDate(p.publishedAt) : ''}</small>
          </button>
        ))}
        {!posts.length && <p className="muted blog-list-empty">{demo ? 'Sign in to the secure admin to manage articles.' : 'No articles yet. Write your first one!'}</p>}
      </section>

      {draft ? (
        <form className="admin-card editor blog-editor" onSubmit={e => { e.preventDefault(); save(draft.status === 'published' ? 'published' : 'draft'); }}>
          <div className="card-heading">
            <div>
              <p className="eyebrow">{draft.id ? 'EDIT ARTICLE' : 'NEW ARTICLE'}</p>
              <h3>{draft.title || 'Untitled article'} <span className={'post-status ' + draft.status}>{draft.status === 'published' ? 'Published' : 'Draft'}</span></h3>
            </div>
            <button type="button" className="danger-text" onClick={remove} disabled={busy}><Trash2 size={16} />{draft.id ? 'Delete' : 'Discard'}</button>
          </div>

          <label>Title<input value={draft.title} onChange={e => setTitle(e.target.value)} maxLength={140} placeholder="e.g. How to choose the right cook for your family" required /></label>
          <label>URL slug<input value={draft.slug} onChange={e => { setSlugTouched(true); set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-')); }} onBlur={e => set('slug', slugify(e.target.value))} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} required /></label>
          <small>Article address: /blog/{draft.slug || 'your-article'}{draft.status === 'published' ? ' — changing it changes the live link.' : ''}</small>

          <label>Short summary <span className="counter">{draft.excerpt.length}/300</span><textarea value={draft.excerpt} onChange={e => set('excerpt', e.target.value)} maxLength={300} rows={2} placeholder="One or two sentences shown on the blog list and in Google." /></label>

          <label>Cover image</label>
          {imageField(draft.cover, v => set('cover', v))}
          <div className="blog-cover-actions">
            <label className="button outline small upload-inline"><Upload size={14} /> Upload new cover
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { setBusy(true); setError(''); set('cover', await uploadImage(f)); setNotice('Cover image uploaded.'); } catch (err) { setError((err as Error).message); } finally { setBusy(false); e.target.value = ''; } }} />
            </label>
            {draft.cover && <button type="button" className="text-link" onClick={() => set('cover', '')}>Remove cover</button>}
          </div>

          <div className="blog-body-head">
            <label htmlFor="post-body">Article <span className="counter">{draft.body.trim() ? readingMinutes(draft.body) + ' min read' : ''}</span></label>
            <div className="blog-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={!preview} className={!preview ? 'active' : ''} onClick={() => setPreview(false)}><PenLine size={14} /> Write</button>
              <button type="button" role="tab" aria-selected={preview} className={preview ? 'active' : ''} onClick={() => setPreview(true)}><Eye size={14} /> Preview</button>
            </div>
          </div>
          {preview ? (
            <div className="blog-preview blog-body" dangerouslySetInnerHTML={{ __html: draft.body.trim() ? renderMarkdown(draft.body) : '<p class="muted">Nothing to preview yet.</p>' }} />
          ) : (
            <>
              <div className="blog-toolbar" role="toolbar" aria-label="Formatting">
                {/* onMouseDown preventDefault keeps the cursor in the text box while clicking a tool */}
                {tools.map(([label, icon, run]) => <button key={label} type="button" title={label} aria-label={label} onMouseDown={e => e.preventDefault()} onClick={run}>{icon}</button>)}
                <button type="button" title="Upload and insert image" aria-label="Upload and insert image" onClick={() => bodyImage.current?.click()} disabled={busy}><ImagePlus size={16} /></button>
                <input ref={bodyImage} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => { const f = e.target.files?.[0]; if (f) insertImage(f); }} />
              </div>
              <textarea id="post-body" ref={body} className="blog-textarea" value={draft.body} onChange={e => set('body', e.target.value)} rows={18} placeholder={'Start writing…\n\nUse the toolbar for headings, bold text, lists and links.\nLeave an empty line between paragraphs.'} required />
              <small>Tip: leave a blank line between paragraphs. Use the toolbar to add headings, lists, links and photos.</small>
            </>
          )}

          <details className="blog-seo">
            <summary>Search engine (SEO) & publishing options</summary>
            <label>SEO title <span className="counter">{(draft.seoTitle || draft.title).length}/60 recommended</span><input value={draft.seoTitle} onChange={e => set('seoTitle', e.target.value)} maxLength={100} placeholder={draft.title || 'Defaults to the article title'} /></label>
            <label>Meta description <span className="counter">{(draft.seoDescription || draft.excerpt).length}/160 recommended</span><textarea value={draft.seoDescription} onChange={e => set('seoDescription', e.target.value)} maxLength={300} rows={3} placeholder={draft.excerpt || 'Defaults to the short summary'} /></label>
            <div className="serp-preview" aria-label="Google preview">
              <span className="serp-url">homestaffservices.com › blog › {draft.slug || '…'}</span>
              <span className="serp-title">{(draft.seoTitle || draft.title || 'Your article title') + ' | Home Staff Services'}</span>
              <span className="serp-desc">{draft.seoDescription || draft.excerpt || 'Your summary will appear here in Google search results.'}</span>
            </div>
            <div className="blog-option-row">
              <label>Author<input value={draft.author} onChange={e => set('author', e.target.value)} maxLength={80} /></label>
              <label>Publish date<input type="date" value={dateInput(draft.publishedAt)} onChange={e => set('publishedAt', fromDateInput(e.target.value))} /></label>
            </div>
            <small>Leave the date empty to use the day you publish.</small>
          </details>

          <div className="blog-actions">
            {draft.status === 'published' && draft.id && <a className="text-link" href={'/blog/' + draft.slug} target="_blank" rel="noreferrer"><ExternalLink size={14} /> View on website</a>}
            {dirty && <span className="unsaved-inline">Unsaved changes</span>}
            {draft.status === 'published' ? (
              <>
                <button type="button" className="button outline" disabled={busy} onClick={() => save('draft')}><EyeOff size={15} /> Unpublish</button>
                <button type="button" className="button" disabled={busy || !dirty} onClick={() => save('published')}><Save size={15} /> {busy ? 'Saving…' : 'Update article'}</button>
              </>
            ) : (
              <>
                <button type="button" className="button outline" disabled={busy} onClick={() => save('draft')}><Save size={15} /> {busy ? 'Saving…' : 'Save draft'}</button>
                <button type="button" className="button" disabled={busy} onClick={() => save('published')}><Send size={15} /> Publish</button>
              </>
            )}
          </div>
        </form>
      ) : (
        <div className="admin-card empty-state blog-start">
          <Newspaper size={34} />
          <h3>Share helpful advice with families.</h3>
          <p>Blog articles help customers trust you and help your website appear in Google searches.</p>
          <button className="button" onClick={() => open(emptyDraft())}><PenLine size={15} /> Write new article</button>
          {posts.length > 0 && <p className="muted">Or choose an article on the left to edit it.</p>}
        </div>
      )}
    </div>
  );
}
