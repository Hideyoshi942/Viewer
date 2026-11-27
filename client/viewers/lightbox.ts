import { downloadBlob } from './types';

export type LightboxInput =
  | { kind: 'svg'; svgMarkup: string; filename?: string }
  | { kind: 'image'; src: string; alt?: string; filename?: string };

export function exportSvgAsPng(svgEl: SVGSVGElement | null, svgMarkup: string, filename = 'diagram.png'): void {
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
        if (png) downloadBlob(png, filename);
      }, 'image/png');
    }
    URL.revokeObjectURL(url);
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

export function openLightbox(input: LightboxInput): void {
  document.querySelector('.mermaid-lightbox')?.remove();

  let scale = 1;
  let rotation = 0;
  let bgMode: 'default' | 'light' | 'dark' = 'default';

  const overlay = document.createElement('div');
  overlay.className = 'mermaid-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Media lightbox');

  const toolbar = document.createElement('div');
  toolbar.className = 'mermaid-lightbox-bar';

  const hint = document.createElement('span');
  hint.className = 'mermaid-lightbox-hint';
  hint.textContent = 'Drag to pan · Ctrl + wheel to zoom · Esc to close';

  const btn = (label: string, title: string, onClick: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', onClick);
    return b;
  };

  const zoomLabel = document.createElement('span');
  zoomLabel.className = 'mermaid-zoom-label';
  zoomLabel.textContent = '100%';

  const stage = document.createElement('div');
  stage.className = 'mermaid-lightbox-stage';
  const canvas = document.createElement('div');
  canvas.className = 'mermaid-lightbox-canvas';

  if (input.kind === 'svg') {
    canvas.innerHTML = input.svgMarkup;
  } else {
    const img = document.createElement('img');
    img.src = input.src;
    img.alt = input.alt ?? '';
    img.style.maxWidth = '86vw';
    img.style.maxHeight = '80vh';
    img.style.display = 'block';
    canvas.append(img);
  }
  stage.append(canvas);

  const applyTransform = () => {
    canvas.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  };

  const applyScale = (next: number) => {
    scale = Math.min(4, Math.max(0.25, Math.round(next * 100) / 100));
    applyTransform();
  };

  const bgBtn = btn('BG', 'Toggle backdrop (Default / Light / Dark)', () => {
    bgMode = bgMode === 'default' ? 'light' : bgMode === 'light' ? 'dark' : 'default';
    canvas.style.background = bgMode === 'light' ? '#ffffff' : bgMode === 'dark' ? '#0f1115' : '';
  });

  const actionBtns: HTMLElement[] = [
    btn('−', 'Zoom out (-)', () => applyScale(scale - 0.25)),
    zoomLabel,
    btn('+', 'Zoom in (+)', () => applyScale(scale + 0.25)),
    btn('100%', 'Reset (0)', () => {
      rotation = 0;
      applyScale(1);
    }),
    btn('↻', 'Rotate 90°', () => {
      rotation = (rotation + 90) % 360;
      applyTransform();
    }),
    bgBtn,
  ];

  if (input.kind === 'svg') {
    const base = (input.filename ?? 'diagram').replace(/\.svg$/i, '');
    actionBtns.push(
      btn('SVG', 'Download SVG', () =>
        downloadBlob(new Blob([input.svgMarkup], { type: 'image/svg+xml;charset=utf-8' }), `${base}.svg`),
      ),
      btn('PNG', 'Export PNG (2x)', () =>
        exportSvgAsPng(canvas.querySelector<SVGSVGElement>('svg'), input.svgMarkup, `${base}.png`),
      ),
    );
  } else {
    const dl = document.createElement('a');
    dl.href = input.src;
    dl.download = input.filename ?? 'image';
    dl.textContent = 'Download';
    dl.style.cssText =
      'padding:4px 10px;font-size:13px;color:var(--text);background:var(--bg-elevated);border:1px solid var(--border);border-radius:6px;text-decoration:none;';
    actionBtns.push(dl);
  }

  const closeBtn = btn('✕ Close', 'Close (Esc)', () => close());
  toolbar.append(hint, ...actionBtns, closeBtn);

  stage.addEventListener(
    'wheel',
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      applyScale(scale + (e.deltaY < 0 ? 0.15 : -0.15));
    },
    { passive: false },
  );

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
    else if (e.key === '0') {
      rotation = 0;
      applyScale(1);
    }
  };

  overlay.addEventListener('click', (e) => {
    if (!moved && (e.target === overlay || e.target === stage)) close();
  });
  window.addEventListener('keydown', onKeyDown);

  overlay.append(toolbar, stage);
  document.body.append(overlay);
}
