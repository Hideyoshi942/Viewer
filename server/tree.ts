import fs from 'node:fs/promises';
import path from 'node:path';
import { isSupportedFile } from '../shared/formats';
import { compareNodes, isIgnoredSegment } from '../shared/tree';
import { type TreeNode } from '../shared/types';

/** Folder tree containing supported files and the folders that (eventually) hold some. */
export async function buildTree(root: string, rel = ''): Promise<TreeNode[]> {
  const entries = await fs.readdir(rel ? path.join(root, rel) : root, { withFileTypes: true });
  const nodes: TreeNode[] = [];

  for (const entry of entries) {
    if (isIgnoredSegment(entry.name)) continue;
    const childPath = rel ? `${rel}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const children = await buildTree(root, childPath);
      if (children.length > 0) nodes.push({ name: entry.name, path: childPath, type: 'dir', children });
    } else if (entry.isFile() && isSupportedFile(entry.name)) {
      nodes.push({ name: entry.name, path: childPath, type: 'file' });
    }
  }

  return nodes.sort(compareNodes);
}
