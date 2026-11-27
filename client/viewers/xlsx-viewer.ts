import { iconEl } from '../icons';
import { renderDataGrid } from './table-viewer';
import { downloadBlob, type ViewerContext, type ViewerHandle } from './types';

function formatCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val);
}

export async function renderXlsxViewer(ctx: ViewerContext): Promise<ViewerHandle> {
  const buf = await ctx.ds.readBinary(ctx.path);
  const blob = new Blob([buf], { type: ctx.format.mime });
  const { default: readXlsxFile, readSheetNames } = await import('read-excel-file/browser');
  const sheets = await readSheetNames(blob);

  if (sheets.length === 0) {
    ctx.container.innerHTML = '<div class="message"><h2>Empty workbook</h2><p>No sheets found in this Excel file.</p></div>';
    return {};
  }

  let activeSheet = sheets[0];
  const bar = document.createElement('div');
  bar.className = 'sheet-tabs';

  const dlBtn = document.createElement('button');
  dlBtn.type = 'button';
  dlBtn.className = 'btn small';
  dlBtn.style.marginLeft = 'auto';
  dlBtn.append(iconEl('download', 13), document.createTextNode('Download .xlsx'));
  dlBtn.addEventListener('click', () => downloadBlob(blob, ctx.path.split('/').pop() || 'workbook.xlsx'));

  const body = document.createElement('div');
  ctx.container.replaceChildren(bar, body);

  let gridHandle: ViewerHandle | undefined;

  const loadSheet = async (name: string) => {
    activeSheet = name;
    bar.querySelectorAll('.sheet-tab').forEach((b) => {
      b.classList.toggle('active', (b as HTMLButtonElement).dataset.sheet === name);
    });
    const rawRows = await readXlsxFile(blob, { sheet: name });
    const [first, ...rest] = rawRows;
    const headers = (first ?? []).map(formatCell);
    const rows = rest.map((r: unknown[]) => headers.map((_: string, i: number) => formatCell(r[i])));
    gridHandle?.destroy?.();
    gridHandle = renderDataGrid(body, {
      headers,
      rows,
      fileName: `${ctx.path.split('/').pop()?.replace(/\.xlsx$/i, '')}-${name}.csv`,
      onMetaText: (extra) => ctx.onMetaText?.(`Excel · ${sheets.length} sheet${sheets.length > 1 ? 's' : ''} · ${extra}`),
      onToast: ctx.onToast,
    });
  };

  for (const name of sheets) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = `sheet-tab${name === activeSheet ? ' active' : ''}`;
    tab.dataset.sheet = name;
    tab.textContent = name;
    tab.addEventListener('click', () => void loadSheet(name));
    bar.append(tab);
  }
  bar.append(dlBtn);

  await loadSheet(activeSheet);

  return {
    destroy() {
      gridHandle?.destroy?.();
    },
  };
}
