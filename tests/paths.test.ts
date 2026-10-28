import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { resolveExisting, resolveSafe } from '../server/paths';

const root = path.resolve('/srv/notes');

describe('resolveSafe', () => {
  it('resolves nested relative paths inside the root', () => {
    expect(resolveSafe(root, 'a/b/c.md')).toBe(path.join(root, 'a', 'b', 'c.md'));
    expect(resolveSafe(root, 'a\\b.md')).toBe(path.join(root, 'a', 'b.md'));
    expect(resolveSafe(root, 'a/../b.md')).toBe(path.join(root, 'b.md'));
  });

  it('allows dots inside names', () => {
    expect(resolveSafe(root, 'a/v1.2..final.md')).toBe(path.join(root, 'a', 'v1.2..final.md'));
  });

  it.each([
    ['../secret.md'],
    ['a/../../secret.md'],
    ['..\\secret.md'],
    ['/etc/passwd'],
    ['C:/Windows/win.ini'],
    ['c:secret.md'],
    ['.'],
    ['a/..'],
    [''],
    ['a\0.md'],
    ['.git/config'],
    ['a/.hidden/b.md'],
  ])('rejects %j', (input) => {
    expect(() => resolveSafe(root, input)).toThrow();
  });

  it('rejects non-string input', () => {
    expect(() => resolveSafe(root, undefined)).toThrow();
    expect(() => resolveSafe(root, ['a.md'])).toThrow();
  });
});

describe('resolveExisting', () => {
  let tmp: string;
  let inside: string;

  beforeAll(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mdv-paths-'));
    inside = path.join(tmp, 'root');
    await fs.mkdir(inside);
    await fs.writeFile(path.join(inside, 'ok.md'), '# ok');
    await fs.writeFile(path.join(tmp, 'outside.md'), '# secret');
  });

  afterAll(() => fs.rm(tmp, { recursive: true, force: true }));

  it('returns the real path of an existing file', async () => {
    expect(await resolveExisting(inside, 'ok.md')).toBe(await fs.realpath(path.join(inside, 'ok.md')));
  });

  it('404s for a missing file', async () => {
    await expect(resolveExisting(inside, 'missing.md')).rejects.toMatchObject({ status: 404 });
  });

  it('rejects a symlink pointing outside the root', async () => {
    try {
      await fs.symlink(path.join(tmp, 'outside.md'), path.join(inside, 'link.md'));
    } catch {
      return; // Creating symlinks needs extra rights on Windows; skip there.
    }
    await expect(resolveExisting(inside, 'link.md')).rejects.toMatchObject({ status: 400 });
  });
});
