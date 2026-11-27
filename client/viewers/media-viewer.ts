import DOMPurify from 'dompurify';
import { iconEl } from '../icons';
import { renderCodeViewer } from './code-viewer';
import { exportSvgAsPng, openLightbox } from './lightbox';
import { downloadText, formatBytes, type ViewerContext, type ViewerHandle } from './types';

export function renderMediaViewer(ctx: ViewerContext): ViewerHandle {
  if (ctx.format.kind === 'svg') return renderSvgViewer(ctx);
  if (ctx.format.kind === 'image') return renderImageViewer(ctx);
  if (ctx.format.kind === 'audio') return renderAudioViewer(ctx);
  return renderVideoViewer(ctx);
}

function renderSvgViewer(ctx: ViewerContext): ViewerHandle {
  const text = ctx.textContent ?? '';
  const sanitized = DOMPurify.sanitize(text, { USE_PROFILES: { svg: true, svgFilters: true } });
  let mode: 'canvas' | 'source' = 'canvas';
  let bg: 'checker' | 'light' | 'dark' = 'checker';
  let scale = 1;

  const toolbar = document.createElement('div');
  toolbar.className = 'viewer-toolbar';

  const seg = document.createElement('div');
  seg.className = 'segmented';
  const canvasBtn = document.createElement('button');
  canvasBtn.type = 'button';
  canvasBtn.className = 'active';
  canvasBtn.textContent = 'Canvas';
  const srcBtn = document.createElement('button');
  srcBtn.type = 'button';
  srcBtn.textContent = 'XML Source';
  seg.append(canvasBtn, srcBtn);

  const bgBtn = document.createElement('button');
  bgBtn.type = 'button';
  bgBtn.className = 'btn small';
  bgBtn.textContent = 'Backdrop: Checker';

  const zoomOut = document.createElement('button');
  zoomOut.type = 'button';
  zoomOut.className = 'btn small';
  zoomOut.append(iconEl('zoomOut', 14));

  const zoomIn = document.createElement('button');
  zoomIn.type = 'button';
  zoomIn.className = 'btn small';
  zoomIn.append(iconEl('zoomIn', 14));

  const expandBtn = document.createElement('button');
  expandBtn.type = 'button';
  expandBtn.className = 'btn small';
  expandBtn.append(iconEl('expand', 13), document.createTextNode('Fullscreen'));
  expandBtn.addEventListener('click', () => {
    openLightbox({ kind: 'svg', svgMarkup: sanitized, filename: ctx.path.split('/').pop() });
  });

  const spacer = document.createElement('span');
  spacer.className = 'viewer-toolbar-spacer';

  const pngBtn = document.createElement('button');
  pngBtn.type = 'button';
  pngBtn.className = 'btn small';
  pngBtn.textContent = 'Export PNG';
  pngBtn.addEventListener('click', () => {
    exportSvgAsPng(
      body.querySelector<SVGSVGElement>('svg'),
      sanitized,
      (ctx.path.split('/').pop() || 'diagram').replace(/\.svg$/i, '.png'),
    );
  });

  const dlBtn = document.createElement('button');
  dlBtn.type = 'button';
  dlBtn.className = 'btn small';
  dlBtn.append(iconEl('download', 13), document.createTextNode('Download SVG'));
  dlBtn.addEventListener('click', () => downloadText(text, ctx.path.split('/').pop() || 'image.svg', 'image/svg+xml'));

  toolbar.append(seg, bgBtn, zoomOut, zoomIn, expandBtn, spacer, pngBtn, dlBtn);

  const body = document.createElement('div');
  ctx.container.replaceChildren(toolbar, body);

  let codeHandle: ViewerHandle | undefined;

  const sync = () => {
    codeHandle?.destroy?.();
    codeHandle = undefined;
    canvasBtn.classList.toggle('active', mode === 'canvas');
    srcBtn.classList.toggle('active', mode === 'source');
    bgBtn.hidden = mode !== 'canvas';
    zoomOut.hidden = mode !== 'canvas';
    zoomIn.hidden = mode !== 'canvas';

    if (mode === 'source') {
      codeHandle = renderCodeViewer({ ...ctx, container: body });
      return;
    }

    const stage = document.createElement('div');
    stage.className = `media-stage bg-${bg}`;
    stage.innerHTML = sanitized;
    const svgEl = stage.querySelector('svg');
    if (svgEl) svgEl.style.transform = `scale(${scale})`;
    body.replaceChildren(stage);
  };

  bgBtn.addEventListener('click', () => {
    bg = bg === 'checker' ? 'light' : bg === 'light' ? 'dark' : 'checker';
    bgBtn.textContent = `Backdrop: ${bg[0].toUpperCase()}${bg.slice(1)}`;
    sync();
  });
  zoomIn.addEventListener('click', () => {
    scale = Math.min(3, scale + 0.25);
    sync();
  });
  zoomOut.addEventListener('click', () => {
    scale = Math.max(0.25, scale - 0.25);
    sync();
  });
  canvasBtn.addEventListener('click', () => {
    mode = 'canvas';
    sync();
  });
  srcBtn.addEventListener('click', () => {
    mode = 'source';
    sync();
  });

  sync();
  return {
    destroy() {
      codeHandle?.destroy?.();
    },
  };
}

function renderImageViewer(ctx: ViewerContext): ViewerHandle {
  const url = ctx.ds.assetUrl(ctx.path);
  let bg: 'checker' | 'light' | 'dark' = 'checker';
  let scale = 1;
  let rotation = 0;

  const toolbar = document.createElement('div');
  toolbar.className = 'viewer-toolbar';

  const dimStat = document.createElement('span');
  dimStat.className = 'viewer-stat';
  dimStat.textContent = ctx.size ? formatBytes(ctx.size) : ctx.format.label;

  const bgBtn = document.createElement('button');
  bgBtn.type = 'button';
  bgBtn.className = 'btn small';
  bgBtn.textContent = 'Backdrop: Checker';

  const rotateBtn = document.createElement('button');
  rotateBtn.type = 'button';
  rotateBtn.className = 'btn small';
  rotateBtn.append(iconEl('rotate', 13), document.createTextNode('Rotate'));

  const expandBtn = document.createElement('button');
  expandBtn.type = 'button';
  expandBtn.className = 'btn small';
  expandBtn.append(iconEl('expand', 13), document.createTextNode('Fullscreen'));

  const spacer = document.createElement('span');
  spacer.className = 'viewer-toolbar-spacer';

  const dl = document.createElement('a');
  dl.className = 'btn small';
  dl.href = url;
  dl.download = ctx.path.split('/').pop() || 'image';
  dl.append(iconEl('download', 13), document.createTextNode('Download'));

  toolbar.append(dimStat, bgBtn, rotateBtn, expandBtn, spacer, dl);

  const stage = document.createElement('div');
  stage.className = `media-stage bg-${bg}`;
  const img = document.createElement('img');
  img.src = url;
  img.alt = ctx.path.split('/').pop() || '';
  img.addEventListener('load', () => {
    const dims = `${img.naturalWidth} × ${img.naturalHeight}`;
    dimStat.textContent = ctx.size ? `${dims} · ${formatBytes(ctx.size)}` : dims;
    ctx.onMetaText?.(`${ctx.format.label} · ${dims}`);
  });
  stage.append(img);

  bgBtn.addEventListener('click', () => {
    bg = bg === 'checker' ? 'light' : bg === 'light' ? 'dark' : 'checker';
    bgBtn.textContent = `Backdrop: ${bg[0].toUpperCase()}${bg.slice(1)}`;
    stage.className = `media-stage bg-${bg}`;
  });
  rotateBtn.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    img.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
  });
  expandBtn.addEventListener('click', () => {
    openLightbox({ kind: 'image', src: url, alt: img.alt, filename: img.alt });
  });

  ctx.container.replaceChildren(toolbar, stage);
  return {};
}

function renderAudioViewer(ctx: ViewerContext): ViewerHandle {
  const url = ctx.ds.assetUrl(ctx.path);
  const name = ctx.path.split('/').pop() || 'Audio';

  const card = document.createElement('div');
  card.className = 'audio-card';

  const head = document.createElement('div');
  head.className = 'audio-card-head';
  head.append(iconEl('audio', 24));
  const titleWrap = document.createElement('div');
  const h = document.createElement('strong');
  h.textContent = name;
  const sub = document.createElement('div');
  sub.className = 'viewer-stat';
  sub.textContent = `${ctx.format.label}${ctx.size ? ` · ${formatBytes(ctx.size)}` : ''}`;
  titleWrap.append(h, sub);
  head.append(titleWrap);

  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = url;

  const controls = document.createElement('div');
  controls.className = 'dialog-actions';

  const back10 = document.createElement('button');
  back10.type = 'button';
  back10.className = 'btn small';
  back10.textContent = '−10s';
  back10.addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  });

  const fwd10 = document.createElement('button');
  fwd10.type = 'button';
  fwd10.className = 'btn small';
  fwd10.textContent = '+10s';
  fwd10.addEventListener('click', () => {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  });

  for (const rate of [0.75, 1, 1.25, 1.5, 2]) {
    const rb = document.createElement('button');
    rb.type = 'button';
    rb.className = `btn small${rate === 1 ? ' primary' : ''}`;
    rb.textContent = `${rate}×`;
    rb.addEventListener('click', () => {
      audio.playbackRate = rate;
      controls.querySelectorAll('.btn').forEach((b) => b.classList.remove('primary'));
      rb.classList.add('primary');
    });
    controls.append(rb);
  }

  const dl = document.createElement('a');
  dl.className = 'btn small';
  dl.href = url;
  dl.download = name;
  dl.style.marginLeft = 'auto';
  dl.append(iconEl('download', 13), document.createTextNode('Download'));

  controls.prepend(back10, fwd10);
  controls.append(dl);
  card.append(head, audio, controls);
  ctx.container.replaceChildren(card);
  return {
    destroy() {
      audio.pause();
    },
  };
}

function renderVideoViewer(ctx: ViewerContext): ViewerHandle {
  const url = ctx.ds.assetUrl(ctx.path);
  const name = ctx.path.split('/').pop() || 'Video';

  const toolbar = document.createElement('div');
  toolbar.className = 'viewer-toolbar';

  const stat = document.createElement('span');
  stat.className = 'viewer-stat';
  stat.textContent = `${ctx.format.label}${ctx.size ? ` · ${formatBytes(ctx.size)}` : ''}`;

  const spacer = document.createElement('span');
  spacer.className = 'viewer-toolbar-spacer';

  const pipBtn = document.createElement('button');
  pipBtn.type = 'button';
  pipBtn.className = 'btn small';
  pipBtn.textContent = 'PiP';
  pipBtn.hidden = !document.pictureInPictureEnabled;

  const dl = document.createElement('a');
  dl.className = 'btn small';
  dl.href = url;
  dl.download = name;
  dl.append(iconEl('download', 13), document.createTextNode('Download'));

  toolbar.append(stat, spacer, pipBtn, dl);

  const stage = document.createElement('div');
  stage.className = 'video-stage';
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.src = url;
  stage.append(video);

  pipBtn.addEventListener('click', () => {
    if (document.pictureInPictureElement) void document.exitPictureInPicture();
    else void video.requestPictureInPicture?.();
  });

  ctx.container.replaceChildren(toolbar, stage);
  return {
    destroy() {
      video.pause();
    },
  };
}
