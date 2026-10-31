// Minimal Markdown → HTML for blog posts. Runs on the server and in the admin preview.
// All text is HTML-escaped first, so raw HTML in a post is shown as text, never executed.
// Supported: ## / ### / #### headings, paragraphs, - and 1. lists, > quotes, --- rules,
// ![alt](image) images, [text](link), **bold**, *italic*, `code`.

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Only allow safe link and image targets. Input is already escaped.
function safeUrl(url: string, forImage = false) {
  const u = url.trim();
  if (forImage) return /^(\/(media|images)\/[\w./-]+|https:\/\/[^\s]+)$/i.test(u) ? u : '';
  return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(u) ? u : '';
}

function inline(text: string) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => {
      const src = safeUrl(url, true);
      return src ? `<img src="${src}" alt="${alt}" loading="lazy"/>` : '';
    })
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
      const href = safeUrl(url);
      if (!href) return label;
      const external = /^https?:\/\//i.test(href);
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/(^|[\s(])_([^_\s][^_]*)_(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');
}

export function renderMarkdown(source: string) {
  const lines = escapeHtml(source.replace(/\r\n?/g, '\n')).split('\n');
  const out: string[] = [];
  let para: string[] = [];
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let quote: string[] = [];

  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<${list.type}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.type}>`); list = null; } };
  const flushQuote = () => { if (quote.length) { out.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`); quote = []; } };
  const flushAll = () => { flushPara(); flushList(); flushQuote(); };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushAll(); continue; }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    // "#" and "##" both become h2: the post title is the page's only h1.
    if (heading) { flushAll(); const level = Math.max(2, heading[1].length); out.push(`<h${level}>${inline(heading[2])}</h${level}>`); continue; }
    if (/^(-{3,}|\*{3,})$/.test(line)) { flushAll(); out.push('<hr/>'); continue; }
    const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(line);
    if (image) {
      flushAll();
      const src = safeUrl(image[2], true);
      if (src) out.push(`<figure><img src="${src}" alt="${image[1]}" loading="lazy"/>${image[1] ? `<figcaption>${image[1]}</figcaption>` : ''}</figure>`);
      continue;
    }
    const quoteLine = /^&gt;\s?(.*)$/.exec(line);
    if (quoteLine) { flushPara(); flushList(); quote.push(quoteLine[1]); continue; }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.+)$/.exec(line);
    if (bullet || numbered) {
      flushPara(); flushQuote();
      const type = bullet ? 'ul' : 'ol';
      if (list && list.type !== type) flushList();
      if (!list) list = { type, items: [] };
      list.items.push((bullet || numbered)![1]);
      continue;
    }
    flushList(); flushQuote();
    para.push(line);
  }
  flushAll();
  return out.join('\n');
}

/** Plain text (for excerpts and reading time). */
export const markdownToText = (source: string) =>
  source.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#>*_`-]+/g, ' ').replace(/\s+/g, ' ').trim();

export const readingMinutes = (source: string) => Math.max(1, Math.round(markdownToText(source).split(' ').length / 200));

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

export const formatDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Karachi' }) : '');
