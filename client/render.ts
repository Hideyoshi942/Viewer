import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
import MarkdownIt from 'markdown-it';
import { frontMatterInner, splitFrontMatter } from '../shared/frontmatter';
import { IMAGE_EXT, MARKDOWN_EXT } from '../shared/types';
import { isDark } from './extras';
import { fileHref, isExternal, resolveRelative, safeDecode, splitOnce } from './links';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // combining marks (accents)
    .replace(/đ/g, 'd')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    }
    return '';
  },
});

// Give every heading a stable id so `#anchor` links (and later the TOC) can target it.
md.core.ruler.push('heading_ids', (state) => {
  const seen = new Map<string, number>();
  state.tokens.forEach((token, i) => {
    if (token.type !== 'heading_open') return;
    const base = slugify(state.tokens[i + 1]?.content ?? '') || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    token.attrSet('id', count ? `${base}-${count}` : base);
  });
});

export function renderMarkdown(
  el: HTMLElement,
  content: string,
  filePath: string,
  assetUrl: (path: string) => string,
): void {
  const { frontMatter, body } = splitFrontMatter(content);
  el.innerHTML = DOMPurify.sanitize(md.render(body));
  if (frontMatter) el.prepend(frontMatterBox(frontMatter));
  rewriteLinks(el, filePath, assetUrl);
  renderTaskLists(el);
  void renderMermaid(el);
}

/** Front matter shown as a collapsed "Properties" box instead of being rendered as markdown. */
function frontMatterBox(frontMatter: string): HTMLElement {
  const details = document.createElement('details');
  details.className = 'front-matter';
  const summary = document.createElement('summary');
  summary.textContent = 'Properties';
  const pre = document.createElement('pre');
  pre.textContent = frontMatterInner(frontMatter);
  details.append(summary, pre);
  return details;
}

let mermaidSeq = 0;

/** ```mermaid blocks become diagrams. Mermaid is large, so it's only loaded when a page uses it. */
async function renderMermaid(el: HTMLElement) {
  const blocks = [...el.querySelectorAll<HTMLElement>('pre > code.language-mermaid')];
  if (blocks.length === 0) return;
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: isDark() ? 'dark' : 'default' });

  for (const code of blocks) {
    const pre = code.parentElement!;
    if (!pre.isConnected) continue; // page re-rendered meanwhile
    try {
      const { svg } = await mermaid.render(`mermaid-${++mermaidSeq}`, code.textContent ?? '');
      if (!pre.isConnected) continue;
      const figure = document.createElement('div');
      figure.className = 'mermaid';
      figure.innerHTML = svg; // produced by mermaid in strict mode (sanitised labels, no scripts)
      pre.replaceWith(figure);
    } catch (err) {
      pre.classList.add('mermaid-error');
      pre.title = `Diagram error: ${(err as Error).message}`;
    }
  }
}

function rewriteLinks(el: HTMLElement, filePath: string, assetUrl: (path: string) => string) {
  for (const a of el.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const href = a.getAttribute('href')!;
    if (href.startsWith('#')) {
      a.setAttribute('href', fileHref(filePath, safeDecode(href.slice(1))));
      continue;
    }
    if (isExternal(href)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      continue;
    }
    const [pathPart, anchor] = splitOnce(href.split('?')[0], '#');
    const target = resolveRelative(filePath, safeDecode(pathPart));
    if (target === null) continue;
    if (MARKDOWN_EXT.test(target)) a.setAttribute('href', fileHref(target, safeDecode(anchor)));
    else if (IMAGE_EXT.test(target)) a.setAttribute('href', assetUrl(target));
  }

  for (const img of el.querySelectorAll<HTMLImageElement>('img[src]')) {
    const src = img.getAttribute('src')!;
    if (isExternal(src)) continue;
    const target = resolveRelative(filePath, safeDecode(src.split(/[?#]/)[0]));
    if (target !== null) img.setAttribute('src', assetUrl(target));
    img.loading = 'lazy';
  }
}

/** GitHub-style `- [ ] item` / `- [x] item`. */
function renderTaskLists(el: HTMLElement) {
  for (const li of el.querySelectorAll('li')) {
    const host = li.firstElementChild?.tagName === 'P' ? li.firstElementChild : li;
    const first = host.firstChild;
    if (first?.nodeType !== Node.TEXT_NODE) continue;
    const match = /^\[( |x|X)\]\s/.exec(first.textContent ?? '');
    if (!match) continue;

    first.textContent = first.textContent!.slice(match[0].length);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.disabled = true;
    box.checked = match[1] !== ' ';
    host.insertBefore(box, first);
    li.classList.add('task');
    li.parentElement?.classList.add('task-list');
  }
}
