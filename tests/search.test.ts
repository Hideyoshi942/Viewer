import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../server/app';
import { fold, matchRanges, searchDocs, titleOf } from '../shared/search';

const docs = [
  { path: 'guide/cai-dat.md', content: '# Cài đặt\n\nHướng dẫn cài đặt trên Windows và macOS.\n' },
  { path: 'notes/deploy.md', content: '# Deploy\n\nPush to main and GitHub Actions deploys to Pages.\n' },
  { path: 'README.md', content: 'No heading here, mentions deploy once.\n' },
];

describe('searchDocs', () => {
  it('ignores Vietnamese diacritics and case', () => {
    expect(searchDocs(docs, 'CAI DAT').map((h) => h.path)).toEqual(['guide/cai-dat.md']);
    expect(searchDocs(docs, 'hướng dẫn').map((h) => h.path)).toEqual(['guide/cai-dat.md']);
  });

  it('requires every term and ranks title matches first', () => {
    expect(searchDocs(docs, 'deploy').map((h) => h.path)).toEqual(['notes/deploy.md', 'README.md']);
    expect(searchDocs(docs, 'deploy pages').map((h) => h.path)).toEqual(['notes/deploy.md']);
    expect(searchDocs(docs, 'deploy nothing-like-this')).toEqual([]);
  });

  it('returns a title and a snippet around the match', () => {
    const [hit] = searchDocs(docs, 'macos');
    expect(hit.title).toBe('Cài đặt');
    expect(hit.snippet).toContain('macOS');
    expect(hit.snippet).not.toContain('#');
  });

  it('takes the snippet from the body, not the front matter', () => {
    const [hit] = searchDocs([{ path: 'w.md', content: '---\ntitle: Tuần 1\n---\n\n# Tuần 1\n\nHọc Git tuần 1.\n' }], 'tuan');
    expect(hit.snippet).not.toContain('title');
    expect(hit.snippet).toContain('Học Git');
  });

  it('matches folder names too', () => {
    expect(searchDocs(docs, 'notes').map((h) => h.path)).toEqual(['notes/deploy.md']);
  });

  it('treats an empty query as no results', () => {
    expect(searchDocs(docs, '   ')).toEqual([]);
  });
});

describe('helpers', () => {
  it('titleOf uses the first H1, else the file name', () => {
    expect(titleOf('a/x.md', 'text\n# Real title\n')).toBe('Real title');
    expect(titleOf('a/x.md', 'no heading')).toBe('x');
  });

  it('matchRanges maps folded matches back to the original text', () => {
    const text = 'Cài đặt xong, CÀI lại';
    expect(matchRanges(text, 'cai').map(([s, e]) => text.slice(s, e))).toEqual(['Cài', 'CÀI']);
  });

  it('fold handles đ and combining marks', () => {
    expect(fold('Đường đi')).toBe('duong di');
    expect(fold('Tie\u0302\u0301ng')).toBe('tieng'); // NFD input
  });
});

describe('GET /api/search', () => {
  let tmp: string;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mdv-search-'));
    await fs.mkdir(path.join(tmp, 'guide'));
    await fs.writeFile(path.join(tmp, 'guide/a.md'), '# Alpha\n\nsecret sauce\n');
    await fs.mkdir(path.join(tmp, '.mdviewer/backup'), { recursive: true });
    await fs.writeFile(path.join(tmp, '.mdviewer/backup/old.md'), 'secret sauce from a backup');
    app = createApp(tmp);
  });

  afterAll(() => fs.rm(tmp, { recursive: true, force: true }));

  it('searches visible files only', async () => {
    const res = await request(app).get('/api/search').query({ q: 'sauce' }).expect(200);
    expect(res.body.map((h: { path: string }) => h.path)).toEqual(['guide/a.md']);
  });

  it('sees changes made through the API', async () => {
    const file = await request(app).get('/api/file').query({ path: 'guide/a.md' });
    await request(app)
      .put('/api/file')
      .query({ path: 'guide/a.md' })
      .send({ content: '# Alpha\n\nbrand new words\n', baseVersion: file.body.version })
      .expect(200);
    expect((await request(app).get('/api/search').query({ q: 'brand new' })).body).toHaveLength(1);
    expect((await request(app).get('/api/search').query({ q: 'sauce' })).body).toHaveLength(0);
  });

  it('returns [] for an empty query', async () => {
    expect((await request(app).get('/api/search').query({ q: '' })).body).toEqual([]);
  });
});
