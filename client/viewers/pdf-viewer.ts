import { iconEl } from '../icons';
import { downloadBlob, type ViewerContext, type ViewerHandle } from './types';

export async function renderPdfViewer(ctx: ViewerContext): Promise<ViewerHandle> {
  const buf = await ctx.ds.readBinary(ctx.path);
  const [pdfjs, workerMod] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerMod.default;

  const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const totalPages = pdfDoc.numPages;
  let currentPage = 1;
  let scale = 1.2;
  let mode: 'continuous' | 'single' = 'continuous';
  let destroyed = false;

  ctx.onMetaText?.(`PDF · ${totalPages} page${totalPages === 1 ? '' : 's'}`);

  const toolbar = document.createElement('div');
  toolbar.className = 'viewer-toolbar';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'btn small';
  prevBtn.append(iconEl('chevronLeft', 14));

  const pageInput = document.createElement('input');
  pageInput.type = 'number';
  pageInput.min = '1';
  pageInput.max = String(totalPages);
  pageInput.value = '1';
  pageInput.className = 'pdf-page-input';

  const pageTotal = document.createElement('span');
  pageTotal.className = 'viewer-stat';
  pageTotal.textContent = `/ ${totalPages}`;

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'btn small';
  nextBtn.append(iconEl('chevronRight', 14));

  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.type = 'button';
  zoomOutBtn.className = 'btn small';
  zoomOutBtn.append(iconEl('zoomOut', 14));

  const zoomLabel = document.createElement('span');
  zoomLabel.className = 'viewer-stat';
  zoomLabel.textContent = '120%';

  const zoomInBtn = document.createElement('button');
  zoomInBtn.type = 'button';
  zoomInBtn.className = 'btn small';
  zoomInBtn.append(iconEl('zoomIn', 14));

  const modeBtn = document.createElement('button');
  modeBtn.type = 'button';
  modeBtn.className = 'btn small';
  modeBtn.textContent = 'Single Page';

  const spacer = document.createElement('span');
  spacer.className = 'viewer-toolbar-spacer';

  const dlBtn = document.createElement('button');
  dlBtn.type = 'button';
  dlBtn.className = 'btn small';
  dlBtn.append(iconEl('download', 13), document.createTextNode('Download PDF'));
  dlBtn.addEventListener('click', () => {
    downloadBlob(new Blob([buf], { type: 'application/pdf' }), ctx.path.split('/').pop() || 'document.pdf');
  });

  toolbar.append(prevBtn, pageInput, pageTotal, nextBtn, zoomOutBtn, zoomLabel, zoomInBtn, modeBtn, spacer, dlBtn);

  const stage = document.createElement('div');
  stage.className = 'pdf-stage';
  ctx.container.replaceChildren(toolbar, stage);

  let observer: IntersectionObserver | null = null;
  const rendered = new Set<number>();

  const renderPageToCanvas = async (pageNum: number, wrap: HTMLElement) => {
    if (destroyed || rendered.has(pageNum)) return;
    rendered.add(pageNum);
    const page = await pdfDoc.getPage(pageNum);
    if (destroyed) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;
    canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    wrap.replaceChildren(canvas);
    await page.render({ canvasContext: canvasCtx, viewport, canvas }).promise;
  };

  const rebuildStage = () => {
    observer?.disconnect();
    rendered.clear();
    stage.replaceChildren();
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
    pageInput.value = String(currentPage);
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    if (mode === 'single') {
      const wrap = document.createElement('div');
      wrap.className = 'pdf-page-wrap';
      wrap.style.minHeight = '400px';
      stage.append(wrap);
      void renderPageToCanvas(currentPage, wrap);
      return;
    }

    const wraps: HTMLElement[] = [];
    for (let p = 1; p <= totalPages; p++) {
      const wrap = document.createElement('div');
      wrap.className = 'pdf-page-wrap';
      wrap.dataset.page = String(p);
      wrap.style.minHeight = '320px';
      wrap.style.minWidth = '240px';
      stage.append(wrap);
      wraps.push(wrap);
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const wrap = entry.target as HTMLElement;
          const p = Number(wrap.dataset.page);
          void renderPageToCanvas(p, wrap);
        }
      },
      { rootMargin: '300px 0px' },
    );
    wraps.forEach((w) => observer!.observe(w));
  };

  const goToPage = (p: number) => {
    currentPage = Math.max(1, Math.min(totalPages, p));
    pageInput.value = String(currentPage);
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    if (mode === 'single') {
      rebuildStage();
    } else {
      stage.querySelector(`[data-page="${currentPage}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
  pageInput.addEventListener('change', () => goToPage(Number(pageInput.value) || 1));
  zoomInBtn.addEventListener('click', () => {
    scale = Math.min(3, Math.round((scale + 0.2) * 10) / 10);
    rebuildStage();
  });
  zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(0.5, Math.round((scale - 0.2) * 10) / 10);
    rebuildStage();
  });
  modeBtn.addEventListener('click', () => {
    mode = mode === 'continuous' ? 'single' : 'continuous';
    modeBtn.textContent = mode === 'continuous' ? 'Single Page' : 'Continuous';
    rebuildStage();
  });

  rebuildStage();

  return {
    destroy() {
      destroyed = true;
      observer?.disconnect();
      void (pdfDoc as { destroy?: () => Promise<void> }).destroy?.();
    },
  };
}
