import { stripDisplayExtension } from '../../shared/formats';
import { fileHref } from '../links';
import { renderCodeViewer } from './code-viewer';
import { renderMarkdown } from './markdown-viewer';
import { renderMediaViewer } from './media-viewer';
import type { ViewerContext, ViewerHandle } from './types';

export type { ViewerContext, ViewerHandle } from './types';

export async function renderFileView(
  ctx: ViewerContext,
  neighbors?: { prev: string | null; next: string | null },
): Promise<ViewerHandle> {
  const { format, container } = ctx;
  let handle: ViewerHandle = {};

  switch (format.kind) {
    case 'markdown': {
      renderMarkdown(container, ctx.textContent ?? '', ctx.path, (p) => ctx.ds.assetUrl(p), {
        showMetaBar: true,
        onCopyPath: () => {
          void navigator.clipboard.writeText(ctx.path).then(() => ctx.onToast?.(`Copied ${ctx.path}`));
        },
      });
      ctx.onTocReady?.();
      break;
    }
    case 'json':
    case 'yaml': {
      const { renderDataViewer } = await import('./data-viewer');
      handle = await renderDataViewer(ctx);
      break;
    }
    case 'csv': {
      const { renderTableViewer } = await import('./table-viewer');
      handle = renderTableViewer(ctx);
      break;
    }
    case 'xlsx': {
      const { renderXlsxViewer } = await import('./xlsx-viewer');
      handle = await renderXlsxViewer(ctx);
      break;
    }
    case 'pdf': {
      const { renderPdfViewer } = await import('./pdf-viewer');
      handle = await renderPdfViewer(ctx);
      break;
    }
    case 'docx': {
      const { renderDocxViewer } = await import('./docx-viewer');
      handle = await renderDocxViewer(ctx);
      break;
    }
    case 'html': {
      const { renderHtmlViewer } = await import('./html-viewer');
      handle = renderHtmlViewer(ctx);
      break;
    }
    case 'svg':
    case 'image':
    case 'audio':
    case 'video': {
      handle = renderMediaViewer(ctx);
      break;
    }
    case 'code':
    case 'text':
    default: {
      handle = renderCodeViewer(ctx);
      break;
    }
  }

  if (neighbors && (neighbors.prev || neighbors.next)) {
    const pager = document.createElement('nav');
    pager.className = 'doc-pager';
    pager.setAttribute('aria-label', 'Adjacent files');

    if (neighbors.prev) {
      const prev = document.createElement('a');
      prev.className = 'pager-card prev';
      prev.href = fileHref(neighbors.prev);
      prev.innerHTML = `<span class="pager-dir">← Previous</span><span class="pager-title"></span>`;
      prev.querySelector('.pager-title')!.textContent = stripDisplayExtension(neighbors.prev.split('/').pop()!);
      pager.append(prev);
    }

    if (neighbors.next) {
      const next = document.createElement('a');
      next.className = 'pager-card next';
      next.href = fileHref(neighbors.next);
      next.innerHTML = `<span class="pager-dir">Next →</span><span class="pager-title"></span>`;
      next.querySelector('.pager-title')!.textContent = stripDisplayExtension(neighbors.next.split('/').pop()!);
      pager.append(next);
    }

    container.append(pager);
  }

  return handle;
}
