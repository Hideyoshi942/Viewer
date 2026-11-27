import { renderCodeViewer } from './code-viewer';
import type { ViewerContext, ViewerHandle } from './types';

function stripJsonComments(input: string): string {
  return input
    .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, comment) => (comment ? '' : m))
    .replace(/,\s*([}\]])/g, '$1');
}

export async function renderDataViewer(ctx: ViewerContext): Promise<ViewerHandle> {
  const text = ctx.textContent ?? '';
  let parsed: unknown;
  let parseError: string | null = null;

  try {
    if (ctx.format.kind === 'yaml') {
      const yaml = await import('yaml');
      parsed = yaml.parse(text);
    } else if (ctx.format.ext === 'jsonl' || ctx.format.ext === 'ndjson') {
      parsed = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => JSON.parse(l));
    } else if (ctx.format.ext === 'jsonc') {
      parsed = JSON.parse(stripJsonComments(text));
    } else {
      parsed = JSON.parse(text);
    }
  } catch (err) {
    parseError = (err as Error).message;
  }

  if (parseError !== null) {
    const warn = document.createElement('div');
    warn.className = 'banner';
    warn.textContent = `Parse error (${ctx.format.label}): ${parseError}`;
    const codeHost = document.createElement('div');
    ctx.container.replaceChildren(warn, codeHost);
    return renderCodeViewer({ ...ctx, container: codeHost });
  }

  let mode: 'tree' | 'source' = 'tree';
  let filter = '';
  let expandAllState: boolean | null = null;

  const toolbar = document.createElement('div');
  toolbar.className = 'viewer-toolbar';

  const seg = document.createElement('div');
  seg.className = 'segmented';
  const treeBtn = document.createElement('button');
  treeBtn.type = 'button';
  treeBtn.className = 'active';
  treeBtn.textContent = 'Tree Explorer';
  const srcBtn = document.createElement('button');
  srcBtn.type = 'button';
  srcBtn.textContent = 'Source';
  seg.append(treeBtn, srcBtn);

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'mini-input';
  searchInput.placeholder = 'Filter keys or values…';

  const expandBtn = document.createElement('button');
  expandBtn.type = 'button';
  expandBtn.className = 'btn small';
  expandBtn.textContent = 'Expand all';

  const collapseBtn = document.createElement('button');
  collapseBtn.type = 'button';
  collapseBtn.className = 'btn small';
  collapseBtn.textContent = 'Collapse all';

  const spacer = document.createElement('span');
  spacer.className = 'viewer-toolbar-spacer';

  toolbar.append(seg, searchInput, expandBtn, collapseBtn, spacer);

  const body = document.createElement('div');
  ctx.container.replaceChildren(toolbar, body);

  let codeHandle: ViewerHandle | undefined;

  const renderTree = () => {
    codeHandle?.destroy?.();
    codeHandle = undefined;
    const root = document.createElement('div');
    root.className = 'json-tree jt-root';
    const q = filter.trim().toLowerCase();

    const buildNode = (key: string | null, val: unknown, path: string, depth: number): HTMLElement | null => {
      const isObj = val !== null && typeof val === 'object';
      const entries = isObj
        ? Array.isArray(val)
          ? val.map((v, i) => [String(i), v] as const)
          : Object.entries(val as Record<string, unknown>)
        : [];

      const childEls = entries
        .map(([k, v]) => buildNode(k, v, Array.isArray(val) ? `${path}[${k}]` : `${path}.${k}`, depth + 1))
        .filter((el): el is HTMLElement => el !== null);

      const selfMatches =
        !q ||
        (key !== null && key.toLowerCase().includes(q)) ||
        (!isObj && String(val).toLowerCase().includes(q));

      if (q && !selfMatches && childEls.length === 0) return null;

      const wrap = document.createElement('div');
      wrap.className = 'jt-node';

      const row = document.createElement('div');
      row.className = 'jt-row';

      let open = expandAllState !== null ? expandAllState : depth < 2 || Boolean(q);
      let childrenWrap: HTMLElement | null = null;

      if (isObj && entries.length > 0) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'jt-toggle';
        toggle.textContent = open ? '▾' : '▸';
        toggle.addEventListener('click', () => {
          open = !open;
          toggle.textContent = open ? '▾' : '▸';
          if (childrenWrap) childrenWrap.hidden = !open;
        });
        row.append(toggle);
      }

      if (key !== null) {
        const kSpan = document.createElement('span');
        kSpan.className = 'jt-key';
        kSpan.textContent = key;
        row.append(kSpan, document.createTextNode(': '));
      }

      if (isObj) {
        const count = document.createElement('span');
        count.className = 'jt-count';
        count.textContent = Array.isArray(val) ? `Array(${entries.length})` : `{${entries.length}}`;
        row.append(count);
      } else {
        const vSpan = document.createElement('span');
        if (val === null) {
          vSpan.className = 'jt-null';
          vSpan.textContent = 'null';
        } else if (typeof val === 'string') {
          vSpan.className = 'jt-str';
          vSpan.textContent = JSON.stringify(val);
        } else if (typeof val === 'number') {
          vSpan.className = 'jt-num';
          vSpan.textContent = String(val);
        } else if (typeof val === 'boolean') {
          vSpan.className = 'jt-bool';
          vSpan.textContent = String(val);
        } else {
          vSpan.textContent = String(val);
        }
        row.append(vSpan);
      }

      const copyPathBtn = document.createElement('button');
      copyPathBtn.type = 'button';
      copyPathBtn.className = 'jt-copy';
      copyPathBtn.textContent = 'Copy path';
      copyPathBtn.addEventListener('click', () => {
        void navigator.clipboard.writeText(path).then(() => ctx.onToast?.(`Copied ${path}`));
      });
      row.append(copyPathBtn);
      wrap.append(row);

      if (childEls.length > 0) {
        childrenWrap = document.createElement('div');
        childrenWrap.hidden = !open;
        childrenWrap.append(...childEls);
        wrap.append(childrenWrap);
      }

      return wrap;
    };

    const node = buildNode(null, parsed, '$', 0);
    if (node) root.append(node);
    else {
      const empty = document.createElement('div');
      empty.className = 'cmd-empty';
      empty.textContent = 'No keys or values match your filter.';
      root.append(empty);
    }
    body.replaceChildren(root);
  };

  const renderSource = () => {
    codeHandle = renderCodeViewer({ ...ctx, container: body });
  };

  const syncMode = () => {
    treeBtn.classList.toggle('active', mode === 'tree');
    srcBtn.classList.toggle('active', mode === 'source');
    searchInput.hidden = mode !== 'tree';
    expandBtn.hidden = mode !== 'tree';
    collapseBtn.hidden = mode !== 'tree';
    if (mode === 'tree') renderTree();
    else renderSource();
  };

  treeBtn.addEventListener('click', () => {
    mode = 'tree';
    syncMode();
  });
  srcBtn.addEventListener('click', () => {
    mode = 'source';
    syncMode();
  });
  expandBtn.addEventListener('click', () => {
    expandAllState = true;
    renderTree();
  });
  collapseBtn.addEventListener('click', () => {
    expandAllState = false;
    renderTree();
  });

  let timer: ReturnType<typeof setTimeout> | undefined;
  searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      filter = searchInput.value;
      renderTree();
    }, 120);
  });

  syncMode();

  return {
    destroy() {
      clearTimeout(timer);
      codeHandle?.destroy?.();
    },
  };
}
