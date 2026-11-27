import fs from 'node:fs/promises';
import path from 'node:path';
import { isSearchableFile } from '../shared/formats';
import { searchDocs, type SearchDoc } from '../shared/search';
import type { SearchHit, TreeNode } from '../shared/types';
import { buildTree } from './tree';

const MAX_SEARCH_BYTES = 512 * 1024;

function filePaths(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => (n.type === 'file' ? [n.path] : filePaths(n.children ?? [])));
}

/**
 * Full-text search over every markdown file under the root.
 * The whole folder is read into memory on first use and re-read after the watcher reports a change.
 */
export class SearchIndex {
  private docs: Promise<SearchDoc[]> | null = null;

  constructor(private root: string) {}

  invalidate() {
    this.docs = null;
  }

  async search(query: string): Promise<SearchHit[]> {
    this.docs ??= this.load().catch((err) => {
      this.docs = null;
      throw err;
    });
    return searchDocs(await this.docs, query);
  }

  /** Every searchable text file (<= 512 KB) as {path, content}; also used by the static build. */
  async load(): Promise<SearchDoc[]> {
    const paths = filePaths(await buildTree(this.root)).filter(isSearchableFile);
    const docs = await Promise.all(
      paths.map(async (p) => {
        const full = path.join(this.root, ...p.split('/'));
        const stat = await fs.stat(full);
        if (stat.size > MAX_SEARCH_BYTES) return null;
        return {
          path: p,
          content: (await fs.readFile(full, 'utf8')).replace(/^\uFEFF/, ''),
        };
      }),
    );
    return docs.filter((d): d is SearchDoc => d !== null);
  }
}
