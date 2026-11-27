import DOMPurify from 'dompurify';
import { iconEl } from '../icons';
import { slugify } from './markdown-viewer';
import { downloadBlob, type ViewerContext, type ViewerHandle } from './types';

export async function renderDocxViewer(ctx: ViewerContext): Promise<ViewerHandle> {
  const buf = await ctx.ds.readBinary(ctx.path);
  const mammoth = await import('mammoth/mammoth.browser');
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });

  const article = document.createElement('article');
  article.className = 'markdown-body';
  article.innerHTML = DOMPurify.sanitize(html);

  const seen = new Map<string, number>();
  for (const h of article.querySelectorAll<HTMLElement>('h1, h2, h3, h4')) {
    const base = slugify(h.textContent ?? '') || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    h.id = count ? `${base}-${count}` : base;
  }

  const words = (article.textContent ?? '').trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 220));
  ctx.onMetaText?.(`Word · ${words.toLocaleString()} words`);

  const bar = document.createElement('div');
  bar.className = 'doc-meta-bar';
  const stat = document.createElement('span');
  stat.textContent = `${words.toLocaleString()} words · ${mins} min read`;
  const spacer = document.createElement('span');
  spacer.className = 'doc-meta-spacer';
  const dlBtn = document.createElement('button');
  dlBtn.type = 'button';
  dlBtn.className = 'btn small';
  dlBtn.append(iconEl('download', 13), document.createTextNode('Download .docx'));
  dlBtn.addEventListener('click', () => {
    downloadBlob(new Blob([buf], { type: ctx.format.mime }), ctx.path.split('/').pop() || 'document.docx');
  });
  bar.append(stat, spacer, dlBtn);

  ctx.container.replaceChildren(bar, article);
  ctx.onTocReady?.();
  return {};
}
