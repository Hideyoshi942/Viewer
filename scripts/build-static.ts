/**
 * Build the GitHub Pages version of the site:
 *   dist/site/            the app (Vite build, hosted mode)
 *   dist/site/tree.json   the sidebar tree
 *   dist/site/search-index.json  every file's text, for full-text search
 *   dist/site/content/    copies of every markdown file and image under CONTENT_DIR
 *
 * Env:
 *   CONTENT_DIR  folder with the markdown, relative to the repo root (default: docs)
 *   BASE_PATH    URL path the site is served from, e.g. /my-repo/ (default: /)
 *   REPO         owner/name, enables "Connect GitHub" editing (default: none)
 *   BRANCH       branch that saves are committed to (default: main)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { isIgnoredSegment } from '../shared/tree';
import { IMAGE_EXT, MARKDOWN_EXT } from '../shared/types';
import { SearchIndex } from '../server/search';
import { buildTree } from '../server/tree';

const projectDir = path.resolve(import.meta.dirname, '..');
const contentDirRel = (process.env.CONTENT_DIR ?? 'docs').replace(/\\/g, '/').replace(/^\.?\/+|\/+$/g, '');
const contentDir = path.resolve(contentDirRel || '.');
const outDir = path.join(projectDir, 'dist/site');
const base = withSlashes(process.env.BASE_PATH ?? '/');

function withSlashes(p: string) {
  return `/${p.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
}

async function copyContent(rel = ''): Promise<number> {
  let count = 0;
  for (const entry of await fs.readdir(path.join(contentDir, rel), { withFileTypes: true })) {
    if (isIgnoredSegment(entry.name)) continue;
    const childRel = path.join(rel, entry.name);
    if (entry.isDirectory()) {
      count += await copyContent(childRel);
    } else if (entry.isFile() && (MARKDOWN_EXT.test(entry.name) || IMAGE_EXT.test(entry.name))) {
      const dest = path.join(outDir, 'content', childRel);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.copyFile(path.join(contentDir, childRel), dest);
      count++;
    }
  }
  return count;
}

// Vite exposes VITE_* variables from process.env to the client bundle.
process.env.VITE_HOSTED = '1';
process.env.VITE_REPO = process.env.REPO ?? '';
process.env.VITE_BRANCH = process.env.BRANCH ?? 'main';
process.env.VITE_CONTENT_DIR = contentDirRel === '.' ? '' : contentDirRel;

await build({
  configFile: path.join(projectDir, 'vite.config.ts'),
  base,
  build: { outDir, emptyOutDir: true },
  logLevel: 'warn',
});

const tree = await buildTree(contentDir);
await fs.writeFile(path.join(outDir, 'tree.json'), JSON.stringify(tree));
await fs.writeFile(path.join(outDir, 'search-index.json'), JSON.stringify(await new SearchIndex(contentDir).load()));
const copied = await copyContent();

console.log(`Built ${path.relative(projectDir, outDir)} (base ${base}): ${copied} files from ${contentDirRel || '.'}`);
if (!process.env.REPO) console.log('REPO not set: the site is read-only (no "Connect GitHub").');
