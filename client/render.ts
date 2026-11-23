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

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadMermaidSvg(svgMarkup: string, index: number): void {
  downloadBlob(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }), `diagram-${index}.svg`);
}

function downloadMermaidPng(svgEl: SVGSVGElement | null, svgMarkup: string, index: number): void {
  const rect = svgEl?.getBoundingClientRect();
  const width = Math.max(1, Math.round(svgEl?.viewBox?.baseVal?.width || rect?.width || 1200));
  const height = Math.max(1, Math.round(svgEl?.viewBox?.baseVal?.height || rect?.height || 800));
  const scale = 2;
  const img = new Image();
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((png) => {
        if (png) downloadBlob(png, `diagram-${index}.png`);
      }, 'image/png');
    }
    URL.revokeObjectURL(url);
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

function openMermaidLightbox(svgMarkup: string, diagramIndex: number): void {
  document.querySelector('.mermaid-lightbox')?.remove();

  let scale = 1;
  const overlay = document.createElement('div');
  overlay.className = 'mermaid-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Diagram viewer');

  const toolbar = document.createElement('div');
  toolbar.className = 'mermaid-lightbox-bar';

  const hint = document.createElement('span');
  hint.className = 'mermaid-lightbox-hint';
  hint.textContent = 'Kéo để di chuyển · Ctrl + cuộn để zoom';

  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.type = 'button';
  zoomOutBtn.textContent = '−';
  zoomOutBtn.title = 'Thu nhỏ (-)';

  const zoomLabel = document.createElement('span');
  zoomLabel.className = 'mermaid-zoom-label';
  zoomLabel.textContent = '100%';

  const zoomInBtn = document.createElement('button');
  zoomInBtn.type = 'button';
  zoomInBtn.textContent = '+';
  zoomInBtn.title = 'Phóng to (+)';

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.textContent = '100%';
  resetBtn.title = 'Đặt lại tỷ lệ (0)';

  const svgBtn = document.createElement('button');
  svgBtn.type = 'button';
  svgBtn.textContent = '⬇ SVG';
  svgBtn.title = 'Tải ảnh vector SVG';

  const pngBtn = document.createElement('button');
  pngBtn.type = 'button';
  pngBtn.textContent = '⬇ PNG';
  pngBtn.title = 'Tải ảnh PNG độ nét cao';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'mermaid-close-btn';
  closeBtn.textContent = '✕ Đóng';

  toolbar.append(hint, zoomOutBtn, zoomLabel, zoomInBtn, resetBtn, svgBtn, pngBtn, closeBtn);

  const stage = document.createElement('div');
  stage.className = 'mermaid-lightbox-stage';
  const canvas = document.createElement('div');
  canvas.className = 'mermaid-lightbox-canvas';
  canvas.innerHTML = svgMarkup;
  stage.append(canvas);

  const applyScale = (next: number) => {
    scale = Math.min(3.5, Math.max(0.35, Math.round(next * 100) / 100));
    canvas.style.transform = `scale(${scale})`;
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  };

  zoomInBtn.addEventListener('click', () => applyScale(scale + 0.25));
  zoomOutBtn.addEventListener('click', () => applyScale(scale - 0.25));
  resetBtn.addEventListener('click', () => applyScale(1));
  svgBtn.addEventListener('click', () => downloadMermaidSvg(svgMarkup, diagramIndex));
  pngBtn.addEventListener('click', () => downloadMermaidPng(canvas.querySelector<SVGSVGElement>('svg'), svgMarkup, diagramIndex));

  // Ctrl + wheel / trackpad pinch zoom inside lightbox
  stage.addEventListener(
    'wheel',
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      applyScale(scale + (e.deltaY < 0 ? 0.15 : -0.15));
    },
    { passive: false },
  );

  // Drag-to-pan across the lightbox stage
  let panning = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let startScrollTop = 0;

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    panning = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    startScrollLeft = stage.scrollLeft;
    startScrollTop = stage.scrollTop;
    stage.classList.add('is-panning');
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!panning) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    stage.scrollLeft = startScrollLeft - dx;
    stage.scrollTop = startScrollTop - dy;
  });

  const endPan = (e: PointerEvent) => {
    if (!panning) return;
    panning = false;
    stage.classList.remove('is-panning');
    if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
  };
  stage.addEventListener('pointerup', endPan);
  stage.addEventListener('pointercancel', endPan);

  const close = () => {
    window.removeEventListener('keydown', onKeyDown);
    overlay.remove();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
    else if (e.key === '+' || e.key === '=') applyScale(scale + 0.25);
    else if (e.key === '-') applyScale(scale - 0.25);
    else if (e.key === '0') applyScale(1);
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (!moved && (e.target === overlay || e.target === stage)) close();
  });
  window.addEventListener('keydown', onKeyDown);

  overlay.append(toolbar, stage);
  document.body.append(overlay);
}

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
      const idx = ++mermaidSeq;
      const { svg } = await mermaid.render(`mermaid-${idx}`, code.textContent ?? '');
      if (!pre.isConnected) continue;
      const wrap = document.createElement('div');
      wrap.className = 'mermaid-wrap';

      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'mermaid-expand-btn';
      expandBtn.textContent = '⤢ Phóng to';
      expandBtn.title = 'Xem biểu đồ toàn màn hình (Zoom +/- / Kéo / Tải SVG/PNG)';
      expandBtn.addEventListener('click', () => openMermaidLightbox(svg, idx));

      const figure = document.createElement('div');
      figure.className = 'mermaid';
      figure.innerHTML = svg; // produced by mermaid in strict mode (sanitised labels, no scripts)
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
