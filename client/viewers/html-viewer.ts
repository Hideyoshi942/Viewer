import { iconEl } from '../icons';
import { renderCodeViewer } from './code-viewer';
import { downloadText, type ViewerContext, type ViewerHandle } from './types';

export function renderHtmlViewer(ctx: ViewerContext): ViewerHandle {
  const text = ctx.textContent ?? '';
  let mode: 'preview' | 'split' | 'source' = 'preview';
  let viewport: '100%' | '768px' | '390px' = '100%';

  const toolbar = document.createElement('div');
  toolbar.className = 'viewer-toolbar';

  const seg = document.createElement('div');
  seg.className = 'segmented';
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'active';
  prevBtn.textContent = 'Preview';
  const splitBtn = document.createElement('button');
  splitBtn.type = 'button';
  splitBtn.textContent = 'Split';
  const srcBtn = document.createElement('button');
  srcBtn.type = 'button';
  srcBtn.textContent = 'Source';
  seg.append(prevBtn, splitBtn, srcBtn);

  const vpSeg = document.createElement('div');
  vpSeg.className = 'segmented';
  const vpBtns: [string, '100%' | '768px' | '390px'][] = [
    ['Full', '100%'],
    ['Tablet', '768px'],
    ['Mobile', '390px'],
  ];
  for (const [label, width] of vpBtns) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (width === viewport) b.classList.add('active');
    b.addEventListener('click', () => {
      viewport = width;
      vpSeg.querySelectorAll('button').forEach((el) => el.classList.remove('active'));
      b.classList.add('active');
      const iframe = body.querySelector<HTMLIFrameElement>('.html-sandbox-frame');
      if (iframe) iframe.style.width = viewport;
    });
    vpSeg.append(b);
  }

  const spacer = document.createElement('span');
  spacer.className = 'viewer-toolbar-spacer';

  const dlBtn = document.createElement('button');
  dlBtn.type = 'button';
  dlBtn.className = 'btn small';
  dlBtn.append(iconEl('download', 13), document.createTextNode('Download'));
  dlBtn.addEventListener('click', () => downloadText(text, ctx.path.split('/').pop() || 'page.html', 'text/html'));

  toolbar.append(seg, vpSeg, spacer, dlBtn);

  const body = document.createElement('div');
  ctx.container.replaceChildren(toolbar, body);

  let codeHandle: ViewerHandle | undefined;

  const makePreview = () => {
    const shell = document.createElement('div');
    shell.className = 'html-preview-shell';
    const bar = document.createElement('div');
    bar.className = 'browser-bar';
    bar.innerHTML = '<span class="browser-dots"><i></i><i></i><i></i></span>';
    const addr = document.createElement('span');
    addr.className = 'browser-addr';
    addr.textContent = `sandbox://${ctx.path}`;
    bar.append(addr);

    const iframe = document.createElement('iframe');
    iframe.className = 'html-sandbox-frame';
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    iframe.style.width = viewport;
    iframe.srcdoc = text;
    shell.append(bar, iframe);
    return shell;
  };

  const sync = () => {
    codeHandle?.destroy?.();
    codeHandle = undefined;
    prevBtn.classList.toggle('active', mode === 'preview');
    splitBtn.classList.toggle('active', mode === 'split');
    srcBtn.classList.toggle('active', mode === 'source');
    vpSeg.hidden = mode === 'source';

    if (mode === 'preview') {
      body.replaceChildren(makePreview());
    } else if (mode === 'source') {
      codeHandle = renderCodeViewer({ ...ctx, container: body });
    } else {
      const split = document.createElement('div');
      split.className = 'html-split';
      const srcHost = document.createElement('div');
      codeHandle = renderCodeViewer({ ...ctx, container: srcHost });
      split.append(srcHost, makePreview());
      body.replaceChildren(split);
    }
  };

  prevBtn.addEventListener('click', () => {
    mode = 'preview';
    sync();
  });
  splitBtn.addEventListener('click', () => {
    mode = 'split';
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
