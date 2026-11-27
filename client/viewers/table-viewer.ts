import { parseDelimited, serializeCsv } from '../../shared/csv';
import { iconEl } from '../icons';
import { renderCodeViewer } from './code-viewer';
import { downloadText, type ViewerContext, type ViewerHandle } from './types';

export type DataGridOptions = {
  headers: string[];
  rows: string[][];
  fileName: string;
  rawText?: string;
  onMetaText?: (extra: string) => void;
  onToast?: (message: string, kind?: 'info' | 'error') => void;
};

const PAGE_SIZE = 200;
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export function renderDataGrid(container: HTMLElement, opts: DataGridOptions): ViewerHandle {
  const { headers, rows } = opts;
  let filter = '';
  let sortCol = -1;
  let sortDir: 'asc' | 'desc' | null = null;
  let page = 0;

  opts.onMetaText?.(`${rows.length.toLocaleString()} rows · ${headers.length} cols`);

  const toolbar = document.createElement('div');
  toolbar.className = 'viewer-toolbar';

  const stat = document.createElement('span');
  stat.className = 'viewer-stat';

  const filterInput = document.createElement('input');
  filterInput.type = 'search';
  filterInput.className = 'mini-input';
  filterInput.placeholder = 'Filter rows…';

  const spacer = document.createElement('span');
  spacer.className = 'viewer-toolbar-spacer';

  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = 'btn small';
  exportBtn.append(iconEl('download', 13), document.createTextNode('Export CSV'));
  exportBtn.addEventListener('click', () => {
    const csv = serializeCsv(headers, rows);
    downloadText(csv, opts.fileName.replace(/\.[^.]+$/, '') + '.csv', 'text/csv;charset=utf-8');
  });

  toolbar.append(stat, filterInput, spacer, exportBtn);

  const gridWrap = document.createElement('div');
  gridWrap.className = 'data-grid-wrap';
  const table = document.createElement('table');
  table.className = 'data-grid';
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);
  gridWrap.append(table);

  const pager = document.createElement('div');
  pager.className = 'grid-pager';

  const inspector = document.createElement('div');
  inspector.className = 'cell-inspector';
  inspector.hidden = true;

  container.replaceChildren(toolbar, gridWrap, inspector, pager);

  const render = () => {
    const q = filter.trim().toLowerCase();
    let filtered = q
      ? rows.filter((r) => r.some((cell) => cell.toLowerCase().includes(q)))
      : [...rows];

    if (sortCol >= 0 && sortDir) {
      const dir = sortDir === 'asc' ? 1 : -1;
      filtered.sort((a, b) => collator.compare(a[sortCol] ?? '', b[sortCol] ?? '') * dir);
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page >= totalPages) page = totalPages - 1;
    const start = page * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    stat.textContent = `${filtered.length.toLocaleString()} / ${rows.length.toLocaleString()} rows · ${headers.length} cols`;

    const headRow = document.createElement('tr');
    const idxTh = document.createElement('th');
    idxTh.className = 'row-idx';
    idxTh.textContent = '#';
    headRow.append(idxTh);

    headers.forEach((h, colIdx) => {
      const th = document.createElement('th');
      const arrow = sortCol === colIdx ? (sortDir === 'asc' ? ' ↑' : sortDir === 'desc' ? ' ↓' : '') : '';
      th.textContent = `${h || `Col ${colIdx + 1}`}${arrow}`;
      th.addEventListener('click', () => {
        if (sortCol !== colIdx) {
          sortCol = colIdx;
          sortDir = 'asc';
        } else if (sortDir === 'asc') {
          sortDir = 'desc';
        } else {
          sortCol = -1;
          sortDir = null;
        }
        render();
      });
      headRow.append(th);
    });
    thead.replaceChildren(headRow);

    const frag = document.createDocumentFragment();
    slice.forEach((row, i) => {
      const tr = document.createElement('tr');
      const idxTd = document.createElement('td');
      idxTd.className = 'row-idx';
      idxTd.textContent = String(start + i + 1);
      tr.append(idxTd);

      for (let c = 0; c < headers.length; c++) {
        const td = document.createElement('td');
        const val = row[c] ?? '';
        td.textContent = val;
        td.title = val ? `${val} (click to copy)` : '';
        td.addEventListener('click', () => {
          if (!val) return;
          inspector.hidden = false;
          inspector.replaceChildren();
          const colLabel = document.createElement('strong');
          colLabel.textContent = `${headers[c] || `Col ${c + 1}`}: `;
          const valSpan = document.createElement('span');
          valSpan.textContent = val;
          inspector.append(colLabel, valSpan);
          void navigator.clipboard.writeText(val).then(() => opts.onToast?.('Copied cell value'));
        });
        tr.append(td);
      }
      frag.append(tr);
    });
    tbody.replaceChildren(frag);

    if (totalPages > 1) {
      pager.hidden = false;
      const info = document.createElement('span');
      info.textContent = `Page ${page + 1} of ${totalPages}`;
      const btns = document.createElement('div');
      btns.style.display = 'flex';
      btns.style.gap = '6px';
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'btn small';
      prev.textContent = 'Previous';
      prev.disabled = page === 0;
      prev.addEventListener('click', () => {
        page--;
        render();
      });
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn small';
      next.textContent = 'Next';
      next.disabled = page >= totalPages - 1;
      next.addEventListener('click', () => {
        page++;
        render();
      });
      btns.append(prev, next);
      pager.replaceChildren(info, btns);
    } else {
      pager.hidden = true;
    }
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  filterInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      filter = filterInput.value;
      page = 0;
      render();
    }, 120);
  });

  render();

  return {
    destroy() {
      clearTimeout(timer);
    },
  };
}

export function renderTableViewer(ctx: ViewerContext): ViewerHandle {
  const text = ctx.textContent ?? '';
  const sep = ctx.format.ext === 'tsv' ? '\t' : ',';
  const parsed = parseDelimited(text, sep);

  let mode: 'table' | 'raw' = 'table';
  const topSwitch = document.createElement('div');
  topSwitch.className = 'sheet-tabs';

  const seg = document.createElement('div');
  seg.className = 'segmented';
  const tableBtn = document.createElement('button');
  tableBtn.type = 'button';
  tableBtn.className = 'active';
  tableBtn.textContent = 'Table';
  const rawBtn = document.createElement('button');
  rawBtn.type = 'button';
  rawBtn.textContent = 'Raw';
  seg.append(tableBtn, rawBtn);
  topSwitch.append(seg);

  const body = document.createElement('div');
  ctx.container.replaceChildren(topSwitch, body);

  let inner: ViewerHandle | undefined;
  const sync = () => {
    inner?.destroy?.();
    tableBtn.classList.toggle('active', mode === 'table');
    rawBtn.classList.toggle('active', mode === 'raw');
    if (mode === 'table') {
      inner = renderDataGrid(body, {
        headers: parsed.headers,
        rows: parsed.rows,
        fileName: ctx.path.split('/').pop() || 'data.csv',
        onMetaText: ctx.onMetaText,
        onToast: ctx.onToast,
      });
    } else {
      inner = renderCodeViewer({ ...ctx, container: body });
    }
  };

  tableBtn.addEventListener('click', () => {
    mode = 'table';
    sync();
  });
  rawBtn.addEventListener('click', () => {
    mode = 'raw';
    sync();
  });

  sync();
  return {
    destroy() {
      inner?.destroy?.();
    },
  };
}
