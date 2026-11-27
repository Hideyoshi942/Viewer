import hljs from 'highlight.js/lib/common';
import { iconEl } from '../icons';
import { downloadText, formatBytes, type ViewerContext, type ViewerHandle } from './types';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderCodeViewer(ctx: ViewerContext): ViewerHandle {
  const text = ctx.textContent ?? '';
  const lines = text.split('\n');
  const lang = ctx.format.hljsLang;
  const isDiff = ctx.format.ext === 'diff' || ctx.format.ext === 'patch';

  ctx.onMetaText?.(`${ctx.format.label} · ${lines.length.toLocaleString()} lines`);

  const toolbar = document.createElement('div');
  toolbar.className = 'viewer-toolbar';

  const stat = document.createElement('span');
  stat.className = 'viewer-stat';
  stat.textContent = `${ctx.format.label} · ${lines.length.toLocaleString()} lines${ctx.size ? ` · ${formatBytes(ctx.size)}` : ''}`;

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'mini-input';
  searchInput.placeholder = 'Find in file…';

  const matchStat = document.createElement('span');
  matchStat.className = 'viewer-stat';

  const spacer = document.createElement('span');
  spacer.className = 'viewer-toolbar-spacer';

  const wrapBtn = document.createElement('button');
  wrapBtn.type = 'button';
  wrapBtn.className = 'btn small';
  wrapBtn.append(iconEl('wrap', 13), document.createTextNode('Wrap'));

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn small';
  copyBtn.append(iconEl('copy', 13), document.createTextNode('Copy'));

  const dlBtn = document.createElement('button');
  dlBtn.type = 'button';
  dlBtn.className = 'btn small';
  dlBtn.append(iconEl('download', 13), document.createTextNode('Download'));

  toolbar.append(stat, searchInput, matchStat, spacer, wrapBtn, copyBtn, dlBtn);

  const frame = document.createElement('div');
  frame.className = 'code-viewer-frame';
  const table = document.createElement('table');
  table.className = 'code-table';
  const tbody = document.createElement('tbody');
  table.append(tbody);
  frame.append(table);

  const highlightedLines = (() => {
    if (lang && hljs.getLanguage(lang) && lines.length <= 5000) {
      return hljs.highlight(text, { language: lang, ignoreIllegals: true }).value.split('\n');
    }
    return lines.map(escapeHtml);
  })();

  const renderRows = (query: string) => {
    const q = query.trim().toLowerCase();
    let matches = 0;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < lines.length; i++) {
      const tr = document.createElement('tr');
      tr.className = 'code-row';
      const rawLine = lines[i];
      if (isDiff) {
        if (rawLine.startsWith('+') && !rawLine.startsWith('+++')) tr.classList.add('diff-add');
        else if (rawLine.startsWith('-') && !rawLine.startsWith('---')) tr.classList.add('diff-del');
      }
      if (q && rawLine.toLowerCase().includes(q)) {
        tr.classList.add('is-match');
        matches++;
      }

      const num = document.createElement('td');
      num.className = 'code-line-num';
      num.textContent = String(i + 1);

      const cell = document.createElement('td');
      cell.className = 'code-cell';
      cell.innerHTML = highlightedLines[i] || ' ';
      tr.append(num, cell);
      frag.append(tr);
    }
    tbody.replaceChildren(frag);
    matchStat.textContent = q ? `${matches} match${matches === 1 ? '' : 'es'}` : '';
  };

  renderRows('');

  let timer: ReturnType<typeof setTimeout> | undefined;
  searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      renderRows(searchInput.value);
      tbody.querySelector('.is-match')?.scrollIntoView({ block: 'center' });
    }, 120);
  });

  wrapBtn.addEventListener('click', () => {
    table.classList.toggle('is-wrapped');
  });

  copyBtn.addEventListener('click', () => {
    void navigator.clipboard.writeText(text).then(() => {
      ctx.onToast?.('Copied file contents');
    });
  });

  dlBtn.addEventListener('click', () => {
    downloadText(text, ctx.path.split('/').pop() || 'file.txt', ctx.format.mime);
  });

  ctx.container.replaceChildren(toolbar, frame);
  return {
    destroy() {
      clearTimeout(timer);
    },
  };
}
