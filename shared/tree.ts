import { MARKDOWN_EXT, type TreeNode } from './types';

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Folders first, then natural A–Z ("step 2" before "step 10"). */
export function compareNodes(a: TreeNode, b: TreeNode): number {
  return a.type !== b.type ? (a.type === 'dir' ? -1 : 1) : collator.compare(a.name, b.name);
}

/** A path segment the viewer never shows: dotfiles/dot-folders and node_modules. */
export function isIgnoredSegment(segment: string): boolean {
  return segment.startsWith('.') || segment === 'node_modules';
}

/** Build the sidebar tree from a flat list of `/`-separated file paths (e.g. from the GitHub API). */
export function treeFromPaths(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];
  const dirs = new Map<string, TreeNode[]>([['', root]]);

  for (const filePath of paths) {
    const parts = filePath.split('/');
    if (!MARKDOWN_EXT.test(filePath) || parts.some(isIgnoredSegment)) continue;

    let parent = '';
    for (const name of parts.slice(0, -1)) {
      const dirPath = parent ? `${parent}/${name}` : name;
      if (!dirs.has(dirPath)) {
        const children: TreeNode[] = [];
        dirs.get(parent)!.push({ name, path: dirPath, type: 'dir', children });
        dirs.set(dirPath, children);
      }
      parent = dirPath;
    }
    dirs.get(parent)!.push({ name: parts[parts.length - 1], path: filePath, type: 'file' });
  }

  for (const children of dirs.values()) children.sort(compareNodes);
  return root;
}
