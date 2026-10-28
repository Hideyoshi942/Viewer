import { fold } from '../shared/search';
import type { TreeNode } from '../shared/types';
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
    // Storage unavailable (private mode etc.) — expand state just won't persist.
  }
}

function displayName(node: TreeNode): string {
  return node.type === 'file' ? node.name.replace(/\.(md|markdown)$/i, '') : node.name;
}

export class Sidebar {
  private tree: TreeNode[] = [];
  private expanded = loadExpanded();
  private active = '';
  private filter = '';
  /** When set, each top-level folder gets a × button that calls this with the folder's path. */
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

  setActive(path: string) {
    this.active = path;
    // Open every folder on the way to the active file.
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) this.expanded.add(parts.slice(0, i).join('/'));
    saveExpanded(this.expanded);
    this.render();
    this.el.querySelector('.active')?.scrollIntoView({ block: 'nearest' });
  }

  private render() {
    const nodes = this.filter ? this.filtered(this.tree) : this.tree;
    if (nodes.length === 0) {
      this.el.innerHTML = `<p class="tree-empty">${this.filter ? 'No file names match' : 'No markdown files found'}</p>`;
      return;
    }
    this.el.replaceChildren(this.renderList(nodes, true));
  }

  private filtered(nodes: TreeNode[]): TreeNode[] {
    return nodes.flatMap((node) => {
      if (node.type === 'file') return fold(node.name).includes(this.filter) ? [node] : [];
      const children = this.filtered(node.children ?? []);
      return children.length ? [{ ...node, children }] : [];
    });
  }

  private renderList(nodes: TreeNode[], top = false): HTMLUListElement {
    const ul = document.createElement('ul');
    for (const node of nodes) {
      const li = document.createElement('li');
      if (node.type === 'dir') {
        const open = this.filter !== '' || this.expanded.has(node.path);
        const button = document.createElement('button');
        button.className = 'row dir';
        button.dataset.dir = node.path;
        button.setAttribute('aria-expanded', String(open));
        button.textContent = node.name;
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
        a.textContent = displayName(node);
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

/** README.md / index.md, else the first file at this level, else look inside folders (in order). */
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
