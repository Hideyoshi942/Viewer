import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../server/app';

let tmp: string;
let root: string;
let app: ReturnType<typeof createApp>;

const read = (rel: string) => fs.readFile(path.join(root, rel), 'utf8');
const exists = (rel: string) =>
  fs.access(path.join(root, rel)).then(
    () => true,
    () => false,
  );

async function version(rel: string): Promise<string> {
  const res = await request(app).get('/api/file').query({ path: rel }).expect(200);
  return res.body.version;
}

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mdv-write-'));
  root = path.join(tmp, 'notes');
  await fs.mkdir(path.join(root, 'guide'), { recursive: true });
  await fs.writeFile(path.join(root, 'guide/intro.md'), '# Intro\n');
  app = createApp(root);
});

afterEach(() => fs.rm(tmp, { recursive: true, force: true }));

describe('PUT /api/file (save)', () => {
  it('writes the file, returns a new version and keeps a backup', async () => {
    const base = await version('guide/intro.md');
    const res = await request(app)
      .put('/api/file')
      .query({ path: 'guide/intro.md' })
      .send({ content: '# Intro v2\n', baseVersion: base })
      .expect(200);

    expect(await read('guide/intro.md')).toBe('# Intro v2\n');
    expect(res.body.version).not.toBe(base);
    expect(await read('.mdviewer/backup/guide/intro.md')).toBe('# Intro\n');
  });

  it('returns 409 with the current version when the file changed since it was loaded', async () => {
    const base = await version('guide/intro.md');
    await fs.writeFile(path.join(root, 'guide/intro.md'), '# Changed in VS Code, longer\n');

    const res = await request(app)
      .put('/api/file')
      .query({ path: 'guide/intro.md' })
      .send({ content: 'mine', baseVersion: base })
      .expect(409);

    expect(res.body.currentVersion).toBe(await version('guide/intro.md'));
    expect(await read('guide/intro.md')).toBe('# Changed in VS Code, longer\n');
  });

  it('can overwrite after a conflict by sending the current version', async () => {
    await fs.writeFile(path.join(root, 'guide/intro.md'), 'theirs, longer text');
    const current = await version('guide/intro.md');
    await request(app)
      .put('/api/file')
      .query({ path: 'guide/intro.md' })
      .send({ content: 'mine', baseVersion: current })
      .expect(200);
    expect(await read('guide/intro.md')).toBe('mine');
  });

  it('only one of two saves from the same base version wins', async () => {
    const base = await version('guide/intro.md');
    const send = (content: string) =>
      request(app).put('/api/file').query({ path: 'guide/intro.md' }).send({ content, baseVersion: base });
    const statuses = (await Promise.all([send('first save'), send('second save, longer')])).map((r) => r.status);
    expect(statuses.sort()).toEqual([200, 409]);
  });

  it('keeps CRLF line endings and the BOM of the existing file', async () => {
    await fs.writeFile(path.join(root, 'win.md'), '\uFEFF# Win\r\nline\r\n');
    const base = await version('win.md');
    await request(app)
      .put('/api/file')
      .query({ path: 'win.md' })
      .send({ content: '# Win\nline\nnew\n', baseVersion: base })
      .expect(200);
    expect(await read('win.md')).toBe('\uFEFF# Win\r\nline\r\nnew\r\n');
  });

  it('leaves no temp files behind', async () => {
    const base = await version('guide/intro.md');
    await request(app)
      .put('/api/file')
      .query({ path: 'guide/intro.md' })
      .send({ content: 'x', baseVersion: base })
      .expect(200);
    expect(await fs.readdir(path.join(root, 'guide'))).toEqual(['intro.md']);
  });

  it.each([
    [{ path: '../evil.md' }, { content: 'x', baseVersion: '1' }, 400],
    [{ path: 'missing.md' }, { content: 'x', baseVersion: '1' }, 404],
    [{ path: 'guide/intro.md' }, { content: 42, baseVersion: '1' }, 400],
    [{ path: 'guide/intro.md' }, { content: 'x' }, 400],
  ])('rejects %j %j with %i', async (query, body, status) => {
    await request(app).put('/api/file').query(query).send(body).expect(status);
  });
});

describe('POST /api/file (create)', () => {
  it('creates a file, including missing folders', async () => {
    await request(app)
      .post('/api/file')
      .query({ path: 'new/deep/Ghi chú.md' })
      .send({ content: '# Mới\n' })
      .expect(201);
    expect(await read('new/deep/Ghi chú.md')).toBe('# Mới\n');
  });

  it('refuses to overwrite an existing file', async () => {
    await request(app).post('/api/file').query({ path: 'guide/intro.md' }).send({ content: '' }).expect(409);
    expect(await read('guide/intro.md')).toBe('# Intro\n');
  });

  it.each(['notes.txt', '../out.md', '.hidden/a.md'])('rejects %s', async (p) => {
    await request(app).post('/api/file').query({ path: p }).send({ content: '' }).expect(400);
  });
});

describe('POST /api/rename', () => {
  it('moves a file into another (new) folder', async () => {
    const res = await request(app)
      .post('/api/rename')
      .send({ from: 'guide/intro.md', to: 'archive/2026/intro.md' })
      .expect(200);
    expect(res.body.path).toBe('archive/2026/intro.md');
    expect(await exists('guide/intro.md')).toBe(false);
    expect(await read('archive/2026/intro.md')).toBe('# Intro\n');
    expect(await exists('guide')).toBe(false); // left empty → removed
  });

  it('keeps folders that still have other files', async () => {
    await fs.writeFile(path.join(root, 'guide/other.md'), 'x');
    await request(app).post('/api/rename').send({ from: 'guide/intro.md', to: 'intro.md' }).expect(200);
    expect(await exists('guide/other.md')).toBe(true);
  });

  it('refuses to overwrite the target', async () => {
    await fs.writeFile(path.join(root, 'other.md'), 'other');
    await request(app).post('/api/rename').send({ from: 'guide/intro.md', to: 'other.md' }).expect(409);
    expect(await read('other.md')).toBe('other');
  });

  it('rejects moving outside the root or away from .md', async () => {
    await request(app).post('/api/rename').send({ from: 'guide/intro.md', to: '../x.md' }).expect(400);
    await request(app).post('/api/rename').send({ from: 'guide/intro.md', to: 'intro.txt' }).expect(400);
  });
});

describe('DELETE /api/file', () => {
  it('moves the file to .mdviewer/trash instead of deleting it', async () => {
    await request(app).delete('/api/file').query({ path: 'guide/intro.md' }).expect(204);
    expect(await exists('guide/intro.md')).toBe(false);

    const [stamp] = await fs.readdir(path.join(root, '.mdviewer/trash'));
    expect(await read(`.mdviewer/trash/${stamp}/guide/intro.md`)).toBe('# Intro\n');
  });

  it('does not show trash or backups in the tree', async () => {
    await request(app).delete('/api/file').query({ path: 'guide/intro.md' }).expect(204);
    const res = await request(app).get('/api/tree').expect(200);
    expect(JSON.stringify(res.body)).not.toContain('mdviewer');
  });
});

describe('write protections', () => {
  it('refuses cross-origin writes', async () => {
    const base = await version('guide/intro.md');
    await request(app)
      .put('/api/file')
      .query({ path: 'guide/intro.md' })
      .set('Origin', 'https://evil.example')
      .send({ content: 'pwned', baseVersion: base })
      .expect(403);
    await request(app).delete('/api/file').query({ path: 'guide/intro.md' }).set('Origin', 'null').expect(403);
    expect(await read('guide/intro.md')).toBe('# Intro\n');
  });

  it('refuses non-JSON writes (form / text posts)', async () => {
    await request(app)
      .post('/api/file')
      .query({ path: 'x.md' })
      .set('Content-Type', 'text/plain')
      .send('{"content":"x"}')
      .expect(415);
  });

  it('allows same-origin writes', async () => {
    await request(app)
      .put('/api/file')
      .query({ path: 'guide/intro.md' })
      .set('Host', '127.0.0.1:4000')
      .set('Origin', 'http://127.0.0.1:4000')
      .send({ content: 'ok', baseVersion: await version('guide/intro.md') })
      .expect(200);
  });

  it('refuses unknown Host headers when allowedHosts is set', async () => {
    const pinned = createApp(root, { allowedHosts: ['127.0.0.1:4000'] });
    await request(pinned).get('/api/tree').set('Host', 'evil.example:4000').expect(403);
    await request(pinned).get('/api/tree').set('Host', '127.0.0.1:4000').expect(200);
  });
});

describe('POST /api/asset (image upload)', () => {
  const png = Buffer.from('89504e470d0a1a0a', 'hex');

  it('stores the image, creating folders, and never overwrites', async () => {
    const first = await request(app)
      .post('/api/asset')
      .query({ path: 'guide/images/shot.png' })
      .set('Content-Type', 'image/png')
      .send(png)
      .expect(201);
    expect(first.body.path).toBe('guide/images/shot.png');

    const second = await request(app)
      .post('/api/asset')
      .query({ path: 'guide/images/shot.png' })
      .set('Content-Type', 'image/png')
      .send(png)
      .expect(201);
    expect(second.body.path).toBe('guide/images/shot-1.png');
    expect(await fs.readFile(path.join(root, 'guide/images/shot.png'))).toEqual(png);
  });

  it.each([
    ['../escape.png', 'image/png', 400],
    ['guide/x.md', 'image/png', 400],
    ['.hidden/x.png', 'image/png', 400],
    ['guide/x.png', 'text/plain', 415],
  ])('rejects %s (%s)', async (p, type, status) => {
    await request(app).post('/api/asset').query({ path: p }).set('Content-Type', type).send(Buffer.from('x')).expect(status);
  });

  it('refuses cross-origin uploads', async () => {
    await request(app)
      .post('/api/asset')
      .query({ path: 'guide/x.png' })
      .set('Origin', 'https://evil.example')
      .set('Content-Type', 'image/png')
      .send(png)
      .expect(403);
  });
});
