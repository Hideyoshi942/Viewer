import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
import MarkdownIt from 'markdown-it';
import { isAssetServable, isSupportedFile } from '../../shared/formats';
import { frontMatterInner, splitFrontMatter } from '../../shared/frontmatter';
import { iconEl } from '../icons';
import { fileHref, isExternal, resolveRelative, safeDecode, splitOnce } from '../links';
import { isDarkTheme } from '../reader-prefs';
import { openLightbox } from './lightbox';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
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

export type MarkdownRenderOptions = {
  showMetaBar?: boolean;
  onCopyPath?: () => void;
};

export function renderMarkdown(
  el: HTMLElement,
  content: string,
  filePath: string,
  assetUrl: (path: string) => string,
  opts: MarkdownRenderOptions = {},
): void {
  const article = document.createElement('article');
  article.className = 'markdown-body';

  const { frontMatter, body } = splitFrontMatter(content);
  article.innerHTML = DOMPurify.sanitize(md.render(body));
  if (frontMatter) article.prepend(frontMatterBox(frontMatter));

  rewriteLinks(article, filePath, assetUrl);
  renderTaskLists(article);
  renderCallouts(article);
  enhanceCodeBlocks(article);
  enhanceHeadings(article, filePath);
  enhanceImages(article);
  void renderMermaid(article);

  if (opts.showMetaBar) {
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 220));
    const bar = document.createElement('div');
    bar.className = 'doc-meta-bar';
    const stat = document.createElement('span');
    stat.textContent = `${words.toLocaleString()} words · ${mins} min read`;
    const spacer = document.createElement('span');
    spacer.className = 'doc-meta-spacer';
    bar.append(stat, spacer);

    if (opts.onCopyPath) {
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'btn small';
      copyBtn.append(iconEl('copy', 13), document.createTextNode('Copy path'));
      copyBtn.addEventListener('click', opts.onCopyPath);
      bar.append(copyBtn);
    }

    const printBtn = document.createElement('button');
    printBtn.type = 'button';
    printBtn.className = 'btn small';
    printBtn.append(iconEl('printer', 13), document.createTextNode('Print'));
    printBtn.addEventListener('click', () => window.print());
    bar.append(printBtn);

    el.replaceChildren(bar, article);
  } else {
    el.replaceChildren(article);
  }
}

function frontMatterBox(frontMatter: string): HTMLElement {
  const details = document.createElement('details');
  details.className = 'front-matter';
  const summary = document.createElement('summary');
  summary.textContent = 'Properties';

  const rawText = frontMatterInner(frontMatter);
  const body = document.createElement('div');
  body.className = 'fm-body';

  const grid = document.createElement('div');
  grid.className = 'fm-grid';
  const lines = rawText.split('\n');
  let parsedCount = 0;
  for (const line of lines) {
    const m = /^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    parsedCount++;
    const k = document.createElement('span');
    k.className = 'fm-key';
    k.textContent = m[1];
    const v = document.createElement('span');
    v.className = 'fm-val';
    const val = m[2].trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      const items = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      for (const item of items) {
        const pill = document.createElement('span');
        pill.className = 'fm-pill';
        pill.textContent = item;
        v.append(pill);
      }
    } else {
      v.textContent = val.replace(/^['"]|['"]$/g, '');
    }
    grid.append(k, v);
  }

  const pre = document.createElement('pre');
  pre.textContent = rawText;
  pre.hidden = parsedCount > 0;

  if (parsedCount > 0) {
    const rawBtn = document.createElement('button');
    rawBtn.type = 'button';
    rawBtn.className = 'btn small fm-raw-btn';
    rawBtn.textContent = 'Raw';
    rawBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const showRaw = pre.hidden;
      pre.hidden = !showRaw;
      grid.hidden = showRaw;
      rawBtn.textContent = showRaw ? 'Table' : 'Raw';
    });
    summary.append(rawBtn);
    body.append(grid, pre);
  } else {
    body.append(pre);
  }

  details.append(summary, body);
  return details;
}

function enhanceHeadings(el: HTMLElement, filePath: string): void {
  for (const h of el.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id]')) {
    const a = document.createElement('a');
    a.className = 'heading-anchor';
    a.href = fileHref(filePath, h.id);
    a.setAttribute('aria-label', 'Link to section');
    h.append(a);
  }
}

function enhanceImages(el: HTMLElement): void {
  for (const img of el.querySelectorAll<HTMLImageElement>('img')) {
    img.addEventListener('click', () => {
      openLightbox({
        kind: 'image',
        src: img.currentSrc || img.src,
        alt: img.alt,
        filename: img.alt || 'image',
      });
    });
  }
}

function enhanceCodeBlocks(el: HTMLElement): void {
  for (const pre of el.querySelectorAll<HTMLPreElement>('pre')) {
    const code = pre.querySelector('code');
    if (!code || code.classList.contains('language-mermaid')) continue;

    const langMatch = /language-([^\s]+)/.exec(code.className);
    const lang = langMatch?.[1] ?? 'text';

    const wrap = document.createElement('div');
    wrap.className = 'code-block-wrap';

    const head = document.createElement('div');
    head.className = 'code-block-head';
    const langSpan = document.createElement('span');
    langSpan.className = 'code-block-lang';
    langSpan.textContent = lang;

    const actions = document.createElement('div');
    actions.className = 'code-block-actions';

    const wrapBtn = document.createElement('button');
    wrapBtn.type = 'button';
    wrapBtn.className = 'btn small';
    wrapBtn.textContent = 'Wrap';
    wrapBtn.addEventListener('click', () => {
      wrap.classList.toggle('is-wrapped');
    });

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn small';
    copyBtn.append(iconEl('copy', 12), document.createTextNode('Copy'));
    copyBtn.addEventListener('click', () => {
      void navigator.clipboard.writeText(code.textContent ?? '').then(() => {
        copyBtn.replaceChildren(iconEl('check', 12), document.createTextNode('Copied'));
        setTimeout(() => {
          copyBtn.replaceChildren(iconEl('copy', 12), document.createTextNode('Copy'));
        }, 1400);
      });
    });

    actions.append(wrapBtn, copyBtn);
    head.append(langSpan, actions);
    pre.replaceWith(wrap);
    wrap.append(head, pre);
  }
}

const CALLOUT_KINDS = new Set(['note', 'tip', 'important', 'warning', 'caution']);

function renderCallouts(el: HTMLElement): void {
  for (const bq of el.querySelectorAll('blockquote')) {
    const firstP = bq.firstElementChild;
    if (!firstP || firstP.tagName !== 'P') continue;
    const text = firstP.textContent ?? '';
    const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:\n|$)?/i.exec(text);
    if (!match) continue;

    const kind = match[1].toLowerCase() as 'note' | 'tip' | 'important' | 'warning' | 'caution';
    if (!CALLOUT_KINDS.has(kind)) continue;

    // Remove the [!TYPE] marker from the first text node
    const firstNode = firstP.firstChild;
    if (firstNode?.nodeType === Node.TEXT_NODE) {
      firstNode.textContent = (firstNode.textContent ?? '').replace(/^\[![A-Z]+\]\s*\n?/i, '');
    }
    if (!firstP.textContent?.trim()) firstP.remove();

    const box = document.createElement('div');
    box.className = `callout callout-${kind}`;

    const title = document.createElement('div');
    title.className = 'callout-title';
    title.append(iconEl(kind, 15), document.createTextNode(kind.toUpperCase()));

    const body = document.createElement('div');
    body.className = 'callout-body';
    while (bq.firstChild) body.append(bq.firstChild);

    box.append(title, body);
    bq.replaceWith(box);
  }
}

let mermaidSeq = 0;

async function renderMermaid(el: HTMLElement) {
  const blocks = [...el.querySelectorAll<HTMLElement>('pre > code.language-mermaid')];
  if (blocks.length === 0) return;
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: isDarkTheme() ? 'dark' : 'default' });

  for (const code of blocks) {
    const pre = code.parentElement!;
    if (!pre.isConnected) continue;
    try {
      const idx = ++mermaidSeq;
      const { svg } = await mermaid.render(`mermaid-${idx}`, code.textContent ?? '');
      if (!pre.isConnected) continue;
      const wrap = document.createElement('div');
      wrap.className = 'mermaid-wrap';

      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'mermaid-expand-btn';
      expandBtn.textContent = 'Expand';
      expandBtn.title = 'Open fullscreen diagram viewer';
      expandBtn.addEventListener('click', () => openLightbox({ kind: 'svg', svgMarkup: svg, filename: `diagram-${idx}.svg` }));

      const figure = document.createElement('div');
      figure.className = 'mermaid';
      figure.innerHTML = svg;
      wrap.append(expandBtn, figure);
      pre.replaceWith(wrap);
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
    if (isSupportedFile(target)) a.setAttribute('href', fileHref(target, safeDecode(anchor)));
    else if (isAssetServable(target)) a.setAttribute('href', assetUrl(target));
  }

  for (const img of el.querySelectorAll<HTMLImageElement>('img[src]')) {
    const src = img.getAttribute('src')!;
    if (isExternal(src)) continue;
    const target = resolveRelative(filePath, safeDecode(src.split(/[?#]/)[0]));
    if (target !== null) img.setAttribute('src', assetUrl(target));
    img.loading = 'lazy';
  }
}

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
