import { getFormat, stripDisplayExtension, type FormatCategory } from '../shared/formats';
import { fold } from '../shared/search';
import type { TreeNode } from '../shared/types';
import { formatIconName, iconEl } from './icons';
import { fileHref } from './links';

const STORAGE_KEY = 'mdv.expanded';

function loadExpanded(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function saveExpanded(expanded: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]));
  } catch {
    // Storage unavailable
  }
}

export function flattenFiles(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => (n.type === 'file' ? [n.path] : flattenFiles(n.children ?? [])));
}

export function collectCategories(nodes: TreeNode[]): FormatCategory[] {
  const cats = new Set<FormatCategory>();
  const walk = (list: TreeNode[]) => {
    for (const n of list) {
      if (n.type === 'dir') walk(n.children ?? []);
      else {
        const fmt = getFormat(n.path);
        if (fmt) cats.add(fmt.category);
      }
    }
  };
  walk(nodes);
  const order: FormatCategory[] = ['markdown', 'code', 'data', 'document', 'media'];
  return order.filter((c) => cats.has(c));
}

export class Sidebar {
  private tree: TreeNode[] = [];
  private expanded = loadExpanded();
  private active = '';
  private filter = '';
  private categoryFilter: FormatCategory | 'all' = 'all';
  private onRemoveRoot: ((path: string) => void) | null = null;

  constructor(private el: HTMLElement) {
    el.addEventListener('click', (e) => {
      const remove = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-remove-root]');
      if (remove) {
        this.onRemoveRoot?.(remove.dataset.removeRoot!);
        return;
      }
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-dir]');
      if (!button) return;
      const dir = button.dataset.dir!;
      if (this.expanded.has(dir)) this.expanded.delete(dir);
      else this.expanded.add(dir);
      saveExpanded(this.expanded);
      this.render();
    });
  }

  setTree(tree: TreeNode[]) {
    this.tree = tree;
    this.render();
  }

  setRootRemover(onRemoveRoot: ((path: string) => void) | null) {
    this.onRemoveRoot = onRemoveRoot;
    this.render();
  }

  setFilter(filter: string) {
    this.filter = fold(filter.trim());
    this.render();
  }

  setCategoryFilter(cat: FormatCategory | 'all') {
    this.categoryFilter = cat;
    this.render();
  }

  setActive(path: string) {
    this.active = path;
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) this.expanded.add(parts.slice(0, i).join('/'));
    saveExpanded(this.expanded);
    this.render();
    this.el.querySelector('.active')?.scrollIntoView({ block: 'nearest' });
  }

  private render() {
    const hasFilter = this.filter !== '' || this.categoryFilter !== 'all';
    const nodes = hasFilter ? this.filtered(this.tree) : this.tree;
    if (nodes.length === 0) {
      this.el.innerHTML = `<p class="tree-empty">${hasFilter ? 'No matching files' : 'No supported files found'}</p>`;
      return;
    }
    this.el.replaceChildren(this.renderList(nodes, true));
  }

  private filtered(nodes: TreeNode[]): TreeNode[] {
    return nodes.flatMap((node) => {
      if (node.type === 'file') {
        const nameOk = !this.filter || fold(node.name).includes(this.filter);
        const catOk = this.categoryFilter === 'all' || getFormat(node.path)?.category === this.categoryFilter;
        return nameOk && catOk ? [node] : [];
      }
      const children = this.filtered(node.children ?? []);
      return children.length ? [{ ...node, children }] : [];
    });
  }

  private renderList(nodes: TreeNode[], top = false): HTMLUListElement {
    const ul = document.createElement('ul');
    for (const node of nodes) {
      const li = document.createElement('li');
      if (node.type === 'dir') {
        const open = this.filter !== '' || this.categoryFilter !== 'all' || this.expanded.has(node.path);
        const button = document.createElement('button');
        button.className = 'row dir';
        button.dataset.dir = node.path;
        button.setAttribute('aria-expanded', String(open));

        const chev = document.createElement('span');
        chev.className = 'dir-chevron';
        chev.append(iconEl('chevronRight', 13));

        const dirIcon = document.createElement('span');
        dirIcon.className = 'dir-icon';
        dirIcon.append(iconEl(open ? 'folderOpen' : 'folder', 15));

        const label = document.createElement('span');
        label.className = 'row-label';
        label.textContent = node.name;

        button.append(chev, dirIcon, label);

        if (top && this.onRemoveRoot) {
          const remove = document.createElement('button');
          remove.className = 'remove-root';
          remove.dataset.removeRoot = node.path;
          remove.textContent = '×';
          remove.title = `Close “${node.name}”`;
          remove.setAttribute('aria-label', `Close ${node.name}`);
          const wrap = document.createElement('div');
          wrap.className = 'root-row';
          wrap.append(button, remove);
          li.append(wrap);
        } else {
          li.append(button);
        }
        if (open) li.append(this.renderList(node.children ?? []));
      } else {
        const a = document.createElement('a');
        a.className = 'row file';
        a.href = fileHref(node.path);
        a.title = node.path;

        const fmt = getFormat(node.path);
        const iconWrap = document.createElement('span');
        iconWrap.className = 'file-icon';
        if (fmt) iconWrap.dataset.cat = fmt.category;
        iconWrap.append(iconEl(fmt ? formatIconName(fmt.kind) : 'doc', 14));

        const label = document.createElement('span');
        label.className = 'row-label';
        label.textContent = stripDisplayExtension(node.name);
        a.append(iconWrap, label);

        if (fmt && fmt.kind !== 'markdown') {
          const extPill = document.createElement('span');
          extPill.className = 'row-ext';
          extPill.textContent = fmt.ext;
          a.append(extPill);
        }

        if (node.path === this.active) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }
        li.append(a);
      }
      ul.append(li);
    }
    return ul;
  }
}

export function defaultFile(tree: TreeNode[]): string | null {
  const preferred = tree.find((n) => n.type === 'file' && /^(readme|index)\.(md|markdown)$/i.test(n.name));
  if (preferred) return preferred.path;
  const firstFile = tree.find((n) => n.type === 'file');
  if (firstFile) return firstFile.path;
  for (const node of tree) {
    const nested = defaultFile(node.children ?? []);
    if (nested) return nested;
  }
  return null;
}
