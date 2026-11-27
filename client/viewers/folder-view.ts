import { getFormat, stripDisplayExtension } from '../../shared/formats';
import { fold } from '../../shared/search';
import type { TreeNode } from '../../shared/types';
import type { DataSource } from '../data';
import { formatIconName, iconEl } from '../icons';
import { fileHref, folderHref } from '../links';

function findFolder(nodes: TreeNode[], folderPath: string): TreeNode[] | null {
  if (!folderPath) return nodes;
  const parts = folderPath.split('/');
  let current = nodes;
  for (const part of parts) {
    const dir = current.find((n) => n.type === 'dir' && n.name === part);
    if (!dir) return null;
    current = dir.children ?? [];
  }
  return current;
}

function countAllFiles(nodes: TreeNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.type === 'file') count++;
    else count += countAllFiles(n.children ?? []);
  }
  return count;
}

export function renderFolderView(
  container: HTMLElement,
  tree: TreeNode[],
  folderPath: string,
  ds: DataSource,
  onOpenFolderDialog: () => void,
): void {
  const nodes = findFolder(tree, folderPath) ?? tree;
  let viewMode: 'grid' | 'list' = 'grid';
  let filter = '';

  const head = document.createElement('div');
  head.className = 'folder-head folder-banner';

  const titleWrap = document.createElement('div');
  const h1 = document.createElement('h1');
  h1.textContent = folderPath ? folderPath.split('/').pop()! : 'Workspace Overview';
  const stats = document.createElement('div');
  stats.className = 'folder-stats';
  const dirs = nodes.filter((n) => n.type === 'dir').length;
  const files = nodes.filter((n) => n.type === 'file').length;
  const totalNested = countAllFiles(nodes);
  stats.textContent = `${dirs} folder${dirs === 1 ? '' : 's'} · ${files} direct file${files === 1 ? '' : 's'} · ${totalNested.toLocaleString()} total items`;
  titleWrap.append(h1, stats);

  // Format distribution bar
  const counts: Record<string, number> = { markdown: 0, code: 0, data: 0, document: 0, media: 0 };
  const countCats = (list: TreeNode[]) => {
    for (const n of list) {
      if (n.type === 'dir') countCats(n.children ?? []);
      else {
        const fmt = getFormat(n.path);
        if (fmt) counts[fmt.category] = (counts[fmt.category] ?? 0) + 1;
      }
    }
  };
  countCats(nodes);
  const totalCats = Object.values(counts).reduce((a, b) => a + b, 0);
  if (totalCats > 0) {
    const dist = document.createElement('div');
    dist.className = 'fmt-dist-bar';
    for (const [cat, n] of Object.entries(counts)) {
      if (n === 0) continue;
      const segEl = document.createElement('span');
      segEl.className = 'fmt-dist-seg';
      segEl.dataset.cat = cat;
      segEl.style.width = `${(n / totalCats) * 100}%`;
      segEl.title = `${cat}: ${n}`;
      dist.append(segEl);
    }
    titleWrap.append(dist);
  }

  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '8px';
  controls.style.alignItems = 'center';

  const filterInput = document.createElement('input');
  filterInput.type = 'search';
  filterInput.className = 'mini-input';
  filterInput.placeholder = 'Filter in folder…';

  const seg = document.createElement('div');
  seg.className = 'segmented';
  const gridBtn = document.createElement('button');
  gridBtn.type = 'button';
  gridBtn.className = 'active';
  gridBtn.append(iconEl('grid', 14));
  const listBtn = document.createElement('button');
  listBtn.type = 'button';
  listBtn.append(iconEl('list', 14));
  seg.append(gridBtn, listBtn);

  controls.append(filterInput, seg);
  head.append(titleWrap, controls);

  const grid = document.createElement('div');
  grid.className = 'folder-grid';

  const dropZone = document.createElement('div');
  dropZone.className = 'drop-zone-card';
  dropZone.innerHTML = '<strong>Open a local folder, .zip, or files</strong><br/><span>Click here or drag &amp; drop anywhere — nothing is uploaded.</span>';
  dropZone.addEventListener('click', onOpenFolderDialog);

  container.replaceChildren(head, grid, dropZone);

  const renderGrid = () => {
    const q = fold(filter.trim());
    const visible = q ? nodes.filter((n) => fold(n.name).includes(q)) : nodes;
    grid.className = `folder-grid${viewMode === 'list' ? ' is-list' : ''}`;

    if (visible.length === 0) {
      grid.innerHTML = '<div class="tree-empty">No matching files or folders here.</div>';
      return;
    }

    const cards = visible.map((node) => {
      const a = document.createElement('a');
      a.className = 'folder-card';
      if (node.type === 'dir') {
        a.href = folderHref(node.path);
        const title = document.createElement('div');
        title.className = 'folder-card-title';
        title.append(iconEl('folder', 16), Object.assign(document.createElement('span'), { textContent: node.name }));
        const sub = document.createElement('div');
        sub.className = 'folder-card-sub';
        sub.textContent = `${countAllFiles(node.children ?? []).toLocaleString()} files`;
        a.append(title, sub);
        return a;
      }

      a.href = fileHref(node.path);
      const fmt = getFormat(node.path);
      if (fmt && (fmt.kind === 'image' || fmt.kind === 'svg')) {
        const thumb = document.createElement('div');
        thumb.className = 'folder-card-thumb';
        const img = document.createElement('img');
        img.src = ds.assetUrl(node.path);
        img.alt = node.name;
        img.loading = 'lazy';
        thumb.append(img);
        a.append(thumb);
      }

      const title = document.createElement('div');
      title.className = 'folder-card-title';
      const iconWrap = document.createElement('span');
      iconWrap.className = 'file-icon';
      if (fmt) iconWrap.dataset.cat = fmt.category;
      iconWrap.append(iconEl(fmt ? formatIconName(fmt.kind) : 'doc', 15));
      const label = document.createElement('span');
      label.textContent = stripDisplayExtension(node.name);
      title.append(iconWrap, label);

      const sub = document.createElement('div');
      sub.className = 'folder-card-sub';
      sub.textContent = fmt?.label ?? 'File';
      a.append(title, sub);
      return a;
    });

    grid.replaceChildren(...cards);
  };

  gridBtn.addEventListener('click', () => {
    viewMode = 'grid';
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
    renderGrid();
  });
  listBtn.addEventListener('click', () => {
    viewMode = 'list';
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
    renderGrid();
  });
  filterInput.addEventListener('input', () => {
    filter = filterInput.value;
    renderGrid();
  });

  renderGrid();
}
