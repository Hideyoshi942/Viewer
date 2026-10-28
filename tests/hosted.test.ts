import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { decodeBase64Utf8, encodeBase64Utf8 } from '../client/base64';
import { ApiError, ConflictError } from '../client/data';
import { HostedSource } from '../client/hosted';
import { treeFromPaths } from '../shared/tree';

const REPO = 'me/notes';
const API = `https://api.github.com/repos/${REPO}`;

/** A tiny in-memory stand-in for the parts of the GitHub REST API that HostedSource uses. */
class FakeGitHub {
  files = new Map<string, string>(); // repo path → content
  commits: string[] = [];
  requests: { method: string; url: string; auth: string | null }[] = [];
  canPush = true;
  validToken = 'good-token';

  sha(content: string) {
    return createHash('sha1').update(`blob ${Buffer.byteLength(content)}\0${content}`).digest('hex');
  }

  fetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    const url = new URL(String(input), 'https://me.github.io'); // static files use relative URLs
    const method = init.method ?? 'GET';
    const auth = new Headers(init.headers).get('Authorization');
    this.requests.push({ method, url: url.pathname + url.search, auth });
    const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

    if (url.hostname !== 'api.github.com') {
      // Static site files.
      if (url.pathname === '/site/tree.json') return json(200, [{ name: 'static.md', path: 'static.md', type: 'file' }]);
      if (url.pathname === '/site/content/static.md') return new Response('# From the static copy\r\n');
      return new Response('nope', { status: 404 });
    }
    if (auth !== `Bearer ${this.validToken}`) return json(401, { message: 'Bad credentials' });

    const path = url.pathname;
    if (path === `/repos/${REPO}`) return json(200, { permissions: { push: this.canPush } });
    if (path === `/repos/${REPO}/git/trees/main`) {
      return json(200, { truncated: false, tree: [...this.files.keys()].map((p) => ({ path: p, type: 'blob' })) });
    }

    const prefix = `/repos/${REPO}/contents/`;
    if (!path.startsWith(prefix)) return json(404, { message: 'Not Found' });
    const repoPath = path.slice(prefix.length).split('/').map(decodeURIComponent).join('/');
    const existing = this.files.get(repoPath);
    const body = init.body ? JSON.parse(String(init.body)) : {};

    if (method === 'GET') {
      if (existing === undefined) return json(404, { message: 'Not Found' });
      return json(200, { encoding: 'base64', content: encodeBase64Utf8(existing), sha: this.sha(existing) });
    }
    if (method === 'PUT') {
      if (existing !== undefined && !body.sha) return json(422, { message: '"sha" wasn\'t supplied.' });
      if (existing !== undefined && body.sha !== this.sha(existing)) return json(409, { message: 'does not match' });
      const content = decodeBase64Utf8(body.content);
      this.files.set(repoPath, content);
      this.commits.push(body.message);
      return json(existing === undefined ? 201 : 200, { content: { sha: this.sha(content) } });
    }
    if (method === 'DELETE') {
      if (existing === undefined) return json(404, { message: 'Not Found' });
      if (body.sha !== this.sha(existing)) return json(409, { message: 'does not match' });
      this.files.delete(repoPath);
      this.commits.push(body.message);
      return json(200, {});
    }
    return json(405, {});
  };
}

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

let gh: FakeGitHub;
let storage: ReturnType<typeof memoryStorage>;
const make = () =>
  new HostedSource({ repo: REPO, branch: 'main', contentDir: 'docs', base: '/site/' }, { fetch: gh.fetch, storage });

beforeEach(() => {
  gh = new FakeGitHub();
  storage = memoryStorage();
  gh.files.set('docs/README.md', '# Home\n');
  gh.files.set('docs/guide/Ghi chú.md', '# Xin chào\r\n');
  gh.files.set('docs/guide/diagram.png', 'png');
  gh.files.set('src/app.ts', 'code');
  gh.files.set('docs/.hidden/x.md', 'hidden');
});

describe('not connected (static site)', () => {
  it('reads the tree and files from the static copy and cannot write', async () => {
    const ds = make();
    expect(ds.canWrite).toBe(false);
    expect(await ds.listTree()).toEqual([{ name: 'static.md', path: 'static.md', type: 'file' }]);
    expect((await ds.readFile('static.md')).content).toBe('# From the static copy\n');
    expect(gh.requests.every((r) => !r.url.startsWith('/repos'))).toBe(true);
  });

  it('builds github.com edit links inside the content folder', () => {
    expect(make().editUrl('guide/Ghi chú.md')).toBe(
      `https://github.com/${REPO}/edit/main/docs/guide/Ghi%20ch%C3%BA.md`,
    );
  });

  it('serves images from the static copy', () => {
    expect(make().assetUrl('guide/a b.png')).toBe('/site/content/guide/a%20b.png');
  });
});

describe('connect', () => {
  it('keeps a token that can push, in session storage', async () => {
    const ds = make();
    await ds.connect('good-token');
    expect(ds.canWrite).toBe(true);
    expect(make().canWrite).toBe(true); // survives a page reload
    ds.disconnect();
    expect(make().canWrite).toBe(false);
  });

  it('rejects bad tokens and read-only tokens', async () => {
    await expect(make().connect('wrong')).rejects.toThrow(/rejected/);
    gh.canPush = false;
    await expect(make().connect('good-token')).rejects.toThrow(/not write/);
    expect(storage.getItem('mdv.github-token')).toBeNull();
  });
});

describe('connected (GitHub API)', () => {
  let ds: HostedSource;
  beforeEach(async () => {
    ds = make();
    await ds.connect('good-token');
  });

  it('lists only visible markdown under the content folder', async () => {
    expect(await ds.listTree()).toEqual([
      {
        name: 'guide',
        path: 'guide',
        type: 'dir',
        children: [{ name: 'Ghi chú.md', path: 'guide/Ghi chú.md', type: 'file' }],
      },
      { name: 'README.md', path: 'README.md', type: 'file' },
    ]);
  });

  it('reads unicode files with their sha as version, normalising line endings', async () => {
    const file = await ds.readFile('guide/Ghi chú.md');
    expect(file.content).toBe('# Xin chào\n');
    expect(file.version).toBe(gh.sha('# Xin chào\r\n'));
  });

  it('saves as a commit and returns the new sha', async () => {
    const file = await ds.readFile('README.md');
    const res = await ds.save('README.md', '# Home — edited\n', file.version);
    expect(gh.files.get('docs/README.md')).toBe('# Home — edited\n');
    expect(res.version).toBe(gh.sha('# Home — edited\n'));
    expect(gh.commits).toEqual(['Update README.md']);
  });

  it('turns a stale sha into a ConflictError carrying the current sha', async () => {
    const file = await ds.readFile('README.md');
    gh.files.set('docs/README.md', '# Someone else\n');
    const err = await ds.save('README.md', 'mine', file.version).catch((e) => e);
    expect(err).toBeInstanceOf(ConflictError);
    expect(err.currentVersion).toBe(gh.sha('# Someone else\n'));

    await ds.save('README.md', 'mine', err.currentVersion); // "overwrite with mine"
    expect(gh.files.get('docs/README.md')).toBe('mine');
  });

  it('creates new files but never overwrites', async () => {
    await ds.create('notes/new.md', '# New\n');
    expect(gh.files.get('docs/notes/new.md')).toBe('# New\n');
    await expect(ds.create('README.md', 'x')).rejects.toMatchObject({ status: 409 });
  });

  it('renames with create + delete', async () => {
    await ds.rename('README.md', 'archive/README.md');
    expect(gh.files.has('docs/README.md')).toBe(false);
    expect(gh.files.get('docs/archive/README.md')).toBe('# Home\n');
  });

  it('deletes with a commit', async () => {
    await ds.remove('README.md');
    expect(gh.files.has('docs/README.md')).toBe(false);
    expect(gh.commits).toEqual(['Delete README.md']);
  });

  it('uploads images as commits without overwriting, and serves them straight from the repo', async () => {
    const png = new Blob([Uint8Array.from([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' });
    expect(await ds.uploadImage('guide/images/shot.png', png)).toBe('guide/images/shot.png');
    expect(await ds.uploadImage('guide/images/shot.png', png)).toBe('guide/images/shot-1.png');
    expect(gh.commits).toEqual(['Add image guide/images/shot.png', 'Add image guide/images/shot-1.png']);
    expect(ds.assetUrl('guide/images/shot.png')).toBe(
      `https://raw.githubusercontent.com/${REPO}/main/docs/guide/images/shot.png`,
    );
  });

  it('forgets a revoked token', async () => {
    gh.validToken = 'rotated';
    await expect(ds.readFile('README.md')).rejects.toBeInstanceOf(ApiError);
    expect(ds.canWrite).toBe(false);
  });
});

describe('treeFromPaths', () => {
  it('nests, sorts folders first in natural order, and skips hidden/non-markdown', () => {
    const tree = treeFromPaths(['b.md', 'a/step 10.md', 'a/step 2.md', 'a/x.png', '.git/c.md', 'node_modules/d.md']);
    expect(tree).toEqual([
      {
        name: 'a',
        path: 'a',
        type: 'dir',
        children: [
          { name: 'step 2.md', path: 'a/step 2.md', type: 'file' },
          { name: 'step 10.md', path: 'a/step 10.md', type: 'file' },
        ],
      },
      { name: 'b.md', path: 'b.md', type: 'file' },
    ]);
  });
});

describe('base64', () => {
  it('round-trips Vietnamese and emoji', () => {
    const text = 'Tiếng Việt có dấu 🚀';
    expect(decodeBase64Utf8(encodeBase64Utf8(text))).toBe(text);
    expect(encodeBase64Utf8(text)).toBe(Buffer.from(text).toString('base64'));
  });
});
