import fs from 'node:fs/promises';
import path from 'node:path';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Extra fields merged into the JSON error body. */
    public extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export function isInside(root: string, target: string): boolean {
  const rel = path.relative(root, target);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel));
}

/**
 * Resolve a client-supplied relative path against the root folder.
 * Throws 400 for anything that would land outside the root (or on the root itself).
 */
export function resolveSafe(root: string, relPath: unknown): string {
  if (typeof relPath !== 'string' || relPath === '' || relPath.includes('\0')) {
    throw new HttpError(400, 'Invalid path');
  }
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
    throw new HttpError(400, 'Path must be relative');
  }
  if (normalized.split('/').some((seg) => seg.startsWith('.') && seg !== '.' && seg !== '..')) {
    throw new HttpError(400, 'Hidden files are not accessible');
  }
  const full = path.resolve(root, normalized);
  if (!isInside(root, full) || full === path.resolve(root)) {
    throw new HttpError(400, 'Path is outside the root folder');
  }
  return full;
}

/** Like resolveSafe, but also follows symlinks and re-checks that the real target is inside the root. */
export async function resolveExisting(root: string, relPath: unknown): Promise<string> {
  const full = resolveSafe(root, relPath);
  let real: string;
  try {
    real = await fs.realpath(full);
  } catch {
    throw new HttpError(404, 'File not found');
  }
  if (!isInside(await fs.realpath(root), real)) {
    throw new HttpError(400, 'Path is outside the root folder');
  }
  return real;
}

/**
 * For a path that may not exist yet: check that its closest existing ancestor
 * really lives inside the root (so a symlinked folder can't redirect new files outside).
 */
export async function assertCreatableInside(root: string, full: string): Promise<void> {
  const realRoot = await fs.realpath(root);
  let dir = path.dirname(full);
  for (;;) {
    try {
      const real = await fs.realpath(dir);
      if (!isInside(realRoot, real)) throw new HttpError(400, 'Path is outside the root folder');
      return;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      const parent = path.dirname(dir);
      if (parent === dir) throw new HttpError(400, 'Invalid path');
      dir = parent;
    }
  }
}

/** Turn an absolute path back into the `/`-separated relative form used by the API. */
export function toRel(root: string, full: string): string {
  return path.relative(root, full).split(path.sep).join('/');
}
