import { watch, type FSWatcher } from 'chokidar';
import path from 'node:path';
import { isIgnoredSegment } from '../shared/tree';
import { MARKDOWN_EXT, type FsEvent } from '../shared/types';
import { toRel } from './paths';

/** Watch the root for markdown changes (same visibility rules as the tree). */
export function watchRoot(root: string, onEvent: (event: FsEvent) => void): FSWatcher {
  const watcher = watch(root, {
    ignoreInitial: true,
    ignored: (p, stats) => {
      const rel = path.relative(root, p);
      if (!rel) return false;
      if (rel.split(path.sep).some(isIgnoredSegment)) return true;
      return !!stats?.isFile() && !MARKDOWN_EXT.test(p);
    },
    // Wait until a write settles so the browser never fetches a half-written file.
    awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 25 },
  });

  for (const type of ['add', 'change', 'unlink', 'addDir', 'unlinkDir'] as const) {
    watcher.on(type, (p: string) => onEvent({ type, path: toRel(root, p) }));
  }
  watcher.on('error', (err) => console.error('Watcher error:', err));
  return watcher;
}
