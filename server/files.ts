import type { Stats } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { IMAGE_EXT, MARKDOWN_EXT, META_DIR, type FileContent, type SaveResult } from '../shared/types';
import { assertCreatableInside, HttpError, resolveExisting, resolveSafe, toRel } from './paths';

const versionOf = (stat: Stats) => `${stat.mtimeMs}-${stat.size}`;

function assertMarkdown(full: string) {
  if (!MARKDOWN_EXT.test(full)) throw new HttpError(400, 'Not a markdown file');
}

async function statFile(full: string): Promise<Stats> {
  const stat = await fs.stat(full);
  if (!stat.isFile()) throw new HttpError(400, 'Not a file');
  return stat;
}

async function relOf(root: string, full: string) {
  return toRel(await fs.realpath(root), full);
}

// ---------- Serialize writes per file so two quick saves can't interleave ----------

const locks = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  locks.set(key, next);
  try {
    return await next;
  } finally {
    if (locks.get(key) === next) locks.delete(key);
  }
}

// ---------- Encoding: keep the file's existing BOM and line endings ----------

const hasBom = (buf: Buffer) => buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;

function encodeLike(existing: Buffer | null, content: string): Buffer {
  let text = content.replace(/\r\n/g, '\n');
  if (existing?.includes('\r\n')) text = text.replace(/\n/g, '\r\n');
  return Buffer.from((existing && hasBom(existing) ? '\uFEFF' : '') + text, 'utf8');
}

// ---------- Low-level helpers ----------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** fs.rename, retrying briefly when Windows reports the target as busy (editor/antivirus holding it). */
async function renameWithRetry(from: string, to: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fs.rename(from, to);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (attempt >= 4 || !['EPERM', 'EBUSY', 'EACCES'].includes(code ?? '')) throw err;
      await sleep(50 * (attempt + 1));
    }
  }
}

/** Write to a hidden temp file next to the target, then rename over it. */
async function atomicWrite(full: string, data: Buffer) {
  const tmp = path.join(path.dirname(full), `.${path.basename(full)}.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmp, data);
  try {
    await renameWithRetry(tmp, full);
  } catch (err) {
    await fs.rm(tmp, { force: true });
    throw err;
  }
}

/** Keep the previous version of a file at .mdviewer/backup/<rel>. */
async function backup(root: string, rel: string, data: Buffer) {
  const dest = path.join(root, META_DIR, 'backup', ...rel.split('/'));
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, data);
}

/** After a file moves away, remove the folders it leaves empty (never the root itself). */
async function pruneEmptyDirs(root: string, dir: string) {
  const top = await fs.realpath(root); // `dir` comes from a realpath too
  while (dir !== top && dir.startsWith(top)) {
    try {
      await fs.rmdir(dir); // fails unless empty
    } catch {
      return;
    }
    dir = path.dirname(dir);
  }
}

async function exists(full: string) {
  return fs.access(full).then(
    () => true,
    () => false,
  );
}

// ---------- Operations ----------

export async function readMarkdown(root: string, relPath: unknown): Promise<FileContent> {
  const full = await resolveExisting(root, relPath);
  assertMarkdown(full);
  const stat = await statFile(full);
  // The API always speaks `\n`; saveMarkdown puts the file's own line endings back.
  const content = (await fs.readFile(full, 'utf8')).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  return { path: await relOf(root, full), content, version: versionOf(stat) };
}

export async function saveMarkdown(
  root: string,
  relPath: unknown,
  content: string,
  baseVersion: string,
): Promise<SaveResult> {
  const full = await resolveExisting(root, relPath);
  assertMarkdown(full);
  const rel = await relOf(root, full);

  return withLock(full, async () => {
    const current = versionOf(await statFile(full));
    if (current !== baseVersion) {
      throw new HttpError(409, 'File was changed by someone else', { currentVersion: current });
    }
    const existing = await fs.readFile(full);
    await backup(root, rel, existing);
    await atomicWrite(full, encodeLike(existing, content));
    return { path: rel, version: versionOf(await fs.stat(full)) };
  });
}

export async function createMarkdown(root: string, relPath: unknown, content: string): Promise<SaveResult> {
  const full = resolveSafe(root, relPath);
  assertMarkdown(full);
  await assertCreatableInside(root, full);
  await fs.mkdir(path.dirname(full), { recursive: true });
  try {
    await fs.writeFile(full, encodeLike(null, content), { flag: 'wx' });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') throw new HttpError(409, 'A file with that name already exists');
    throw err;
  }
  return { path: await relOf(root, full), version: versionOf(await fs.stat(full)) };
}

export async function renameMarkdown(root: string, fromRel: unknown, toRelPath: unknown): Promise<SaveResult> {
  const from = await resolveExisting(root, fromRel);
  assertMarkdown(from);
  await statFile(from);
  const to = resolveSafe(root, toRelPath);
  assertMarkdown(to);
  await assertCreatableInside(root, to);

  // On case-insensitive filesystems "a.md" → "A.md" points at the same file; that's allowed.
  const sameFile = (await exists(to)) && (await fs.realpath(to)) === from;
  if ((await exists(to)) && !sameFile) throw new HttpError(409, 'A file with that name already exists');

  await fs.mkdir(path.dirname(to), { recursive: true });
  await renameWithRetry(from, to);
  await pruneEmptyDirs(root, path.dirname(from));
  return { path: await relOf(root, to), version: versionOf(await fs.stat(to)) };
}

/** Move the file to .mdviewer/trash/<timestamp>/<rel> instead of deleting it. */
export async function trashMarkdown(root: string, relPath: unknown): Promise<void> {
  const full = await resolveExisting(root, relPath);
  assertMarkdown(full);
  await statFile(full);
  const rel = await relOf(root, full);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(root, META_DIR, 'trash', stamp, ...rel.split('/'));
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await renameWithRetry(full, dest);
  await pruneEmptyDirs(root, path.dirname(full));
}

/**
 * Store an uploaded image. Never overwrites: if the name is taken, `-1`, `-2`… is added.
 * Returns the path it was actually saved under.
 */
export async function saveImage(root: string, relPath: unknown, data: Buffer): Promise<{ path: string }> {
  const wanted = resolveSafe(root, relPath);
  if (!IMAGE_EXT.test(wanted)) throw new HttpError(400, 'Not an image file name');
  if (data.length === 0) throw new HttpError(400, 'Empty file');
  await assertCreatableInside(root, wanted);
  await fs.mkdir(path.dirname(wanted), { recursive: true });

  const ext = path.extname(wanted);
  const stem = wanted.slice(0, -ext.length);
  for (let n = 0; n < 1000; n++) {
    const candidate = n === 0 ? wanted : `${stem}-${n}${ext}`;
    try {
      await fs.writeFile(candidate, data, { flag: 'wx' });
      return { path: await relOf(root, candidate) };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
    }
  }
  throw new HttpError(409, 'Too many files with that name');
}
