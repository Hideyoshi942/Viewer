import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../server/app';

let tmp: string;
let root: string;
let app: ReturnType<typeof createApp>;

async function write(rel: string, content: string) {
  const full = path.join(root, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content);
}

beforeAll(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mdv-api-'));
  root = path.join(tmp, 'notes');
  await write('README.md', '# Home');
  await write('guide/intro.md', '# Intro');
  await write('guide/step 10.md', '# Ten');
  await write('guide/step 2.md', '# Two');
  await write('guide/deep/nested/tip.md', '# Tip');
  await write('Tiếng Việt/ghi chú.md', '# Xin chào');
  await write('guide/diagram.png', 'png-bytes');
  await write('guide/notes.txt', 'not markdown');
  await write('empty/only.txt', 'no md here');
  await write('.git/HEAD.md', 'hidden');
  await write('node_modules/pkg/readme.md', 'ignored');
  await fs.writeFile(path.join(tmp, 'secret.md'), '# outside');
  app = createApp(root);
});

afterAll(() => fs.rm(tmp, { recursive: true, force: true }));

describe('GET /api/tree', () => {
  it('lists markdown files in nested folders, folders first, natural order', async () => {
    const res = await request(app).get('/api/tree').expect(200);
    expect(res.body.map((n: { name: string }) => n.name)).toEqual(['guide', 'Tiếng Việt', 'README.md']);

    const guide = res.body[0];
    expect(guide.children.map((n: { name: string }) => n.name)).toEqual([
      'deep',
      'intro.md',
      'step 2.md',
      'step 10.md',
    ]);
    expect(guide.children[0].children[0].children[0]).toEqual({
      name: 'tip.md',
      path: 'guide/deep/nested/tip.md',
      type: 'file',
    });
  });

  it('skips hidden folders, node_modules and folders without markdown', async () => {
    const res = await request(app).get('/api/tree');
    const json = JSON.stringify(res.body);
    expect(json).not.toContain('.git');
    expect(json).not.toContain('node_modules');
    expect(json).not.toContain('empty');
    expect(json).not.toContain('notes.txt');
  });
});

describe('GET /api/file', () => {
  it('returns content and version', async () => {
    const res = await request(app).get('/api/file').query({ path: 'guide/intro.md' }).expect(200);
    expect(res.body).toMatchObject({ path: 'guide/intro.md', content: '# Intro' });
    expect(res.body.version).toMatch(/^[\d.]+-\d+$/);
  });

  it('strips a UTF-8 BOM and normalises line endings to \\n', async () => {
    await fs.writeFile(path.join(root, 'bom.md'), '\uFEFF# BOM\r\nline\r\n');
    const res = await request(app).get('/api/file').query({ path: 'bom.md' }).expect(200);
    expect(res.body.content).toBe('# BOM\nline\n');
  });

  it('handles unicode and spaces in paths', async () => {
    const res = await request(app).get('/api/file').query({ path: 'Tiếng Việt/ghi chú.md' }).expect(200);
    expect(res.body.content).toBe('# Xin chào');
  });

  it.each([
    ['../secret.md', 400],
    ['guide/../../secret.md', 400],
    ['.git/HEAD.md', 400],
    ['guide/notes.txt', 400],
    ['guide', 400],
    ['missing.md', 404],
  ])('%j → %i', async (p, status) => {
    await request(app).get('/api/file').query({ path: p }).expect(status);
  });

  it('400s when path is missing', async () => {
    await request(app).get('/api/file').expect(400);
  });
});

describe('GET /api/asset', () => {
  it('serves images with a locked-down CSP', async () => {
    const res = await request(app).get('/api/asset').query({ path: 'guide/diagram.png' }).expect(200);
    expect(res.headers['content-type']).toBe('image/png');
    expect(res.headers['content-security-policy']).toContain("default-src 'none'");
  });

  it('refuses non-image files', async () => {
    await request(app).get('/api/asset').query({ path: 'guide/intro.md' }).expect(400);
  });
});

it('returns JSON 404 for unknown API routes', async () => {
  const res = await request(app).get('/api/nope').expect(404);
  expect(res.body.error).toBe('Not found');
});
