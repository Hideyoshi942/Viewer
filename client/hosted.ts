import { searchDocs, type SearchDoc } from '../shared/search';
import { treeFromPaths } from '../shared/tree';
import type { FileContent, SaveResult, SearchHit, TreeNode } from '../shared/types';
import { decodeBase64Utf8, encodeBase64Bytes, encodeBase64Utf8 } from './base64';
import { ApiError, ConflictError, type DataSource } from './data';

export type HostedConfig = {
  /** `owner/name`. Empty = plain static site, no GitHub editing. */
  repo: string;
  branch: string;
  /** Folder inside the repo that holds the markdown (e.g. `docs`), '' for the repo root. */
  contentDir: string;
  /** Where the static site is served from, ending in `/` (Vite's BASE_URL). */
  base: string;
};

type Deps = { fetch: typeof fetch; storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null };

const API = 'https://api.github.com';
const TOKEN_KEY = 'mdv.github-token';

const encodePath = (p: string) => p.split('/').map(encodeURIComponent).join('/');

function browserStorage(): Deps['storage'] {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * GitHub Pages mode.
 * - Not connected: reads the static copy the deploy workflow built (tree.json + content/).
 * - Connected (fine-grained token in sessionStorage): reads and writes the repo through the
 *   GitHub API, so what you see is always the latest commit, and every save is a commit.
 */
export class HostedSource implements DataSource {
  readonly deleteHint = 'This makes a commit that removes it; it can be restored from the git history.';
  readonly savedHint = 'Committed. The public site updates in about a minute.';
  private token: string | null;
  private deps: Deps;
  private searchIndex: Promise<SearchDoc[]> | null = null;

  constructor(
    readonly config: HostedConfig,
    deps: Partial<Deps> = {},
  ) {
    this.deps = { fetch: deps.fetch ?? fetch.bind(globalThis), storage: deps.storage ?? browserStorage() };
    this.token = this.deps.storage?.getItem(TOKEN_KEY) ?? null;
  }

  get canWrite() {
    return this.token !== null && this.config.repo !== '';
  }

  get connected() {
    return this.canWrite;
  }

  /** Check the token can push to the repo, then remember it for this browser tab. */
  async connect(token: string): Promise<void> {
    const res = await this.deps.fetch(`${API}/repos/${this.config.repo}`, { headers: this.headers(token) });
    if (res.status === 401) throw new ApiError(401, 'GitHub rejected this token.');
    if (!res.ok) throw new ApiError(res.status, `Cannot access ${this.config.repo} with this token.`);
    const repo = await res.json();
    if (!repo.permissions?.push) {
      throw new ApiError(403, `This token can read ${this.config.repo} but not write to it (needs Contents: read and write).`);
    }
    this.token = token;
    this.deps.storage?.setItem(TOKEN_KEY, token);
  }

  disconnect() {
    this.token = null;
    this.deps.storage?.removeItem(TOKEN_KEY);
  }

  /** github.com's own editor for a file — the fallback when not connected. */
  editUrl(path: string): string {
    return `https://github.com/${this.config.repo}/edit/${encodePath(this.config.branch)}/${encodePath(this.repoPath(path))}`;
  }

  // ---------- DataSource ----------

  async listTree(): Promise<TreeNode[]> {
    if (!this.canWrite) return this.getStatic<TreeNode[]>('tree.json', 'json');

    const tree = await this.gh<{ tree: { path: string; type: string }[]; truncated: boolean }>(
      'GET',
      `/repos/${this.config.repo}/git/trees/${encodeURIComponent(this.config.branch)}?recursive=1`,
    );
    // Huge repos get a truncated listing; the static tree is better than half a tree.
    if (tree.truncated) return this.getStatic<TreeNode[]>('tree.json', 'json');
    const prefix = this.config.contentDir ? `${this.config.contentDir}/` : '';
    const paths = tree.tree
      .filter((e) => e.type === 'blob' && e.path.startsWith(prefix))
      .map((e) => e.path.slice(prefix.length));
    return treeFromPaths(paths);
  }

  async readFile(path: string): Promise<FileContent> {
    if (!this.canWrite) {
      const content = await this.getStatic<string>(`content/${encodePath(path)}`, 'text');
      return { path, content: normalize(content), version: '' };
    }
    const file = await this.gh<{ content: string; encoding: string; sha: string }>(
      'GET',
      `${this.contentsPath(path)}?ref=${encodeURIComponent(this.config.branch)}`,
    );
    // Files over 1 MB come back without inline content; fetch the blob instead.
    const base64 =
      file.encoding === 'base64'
        ? file.content
        : (await this.gh<{ content: string }>('GET', `/repos/${this.config.repo}/git/blobs/${file.sha}`)).content;
    return { path, content: normalize(decodeBase64Utf8(base64)), version: file.sha };
  }

  assetUrl(path: string): string {
    // Connected: straight from the repo, so images uploaded a moment ago show before the redeploy.
    if (this.canWrite) {
      return `https://raw.githubusercontent.com/${this.config.repo}/${encodePath(this.config.branch)}/${encodePath(this.repoPath(path))}`;
    }
    return `${this.config.base}content/${encodePath(path)}`;
  }

  async uploadImage(path: string, file: Blob): Promise<string> {
    const content = encodeBase64Bytes(new Uint8Array(await file.arrayBuffer()));
    const dot = path.lastIndexOf('.');
    for (let n = 0; n < 50; n++) {
      const candidate = n === 0 ? path : `${path.slice(0, dot)}-${n}${path.slice(dot)}`;
      try {
        await this.gh('PUT', this.contentsPath(candidate), {
          message: `Add image ${candidate}`,
          content,
          branch: this.config.branch,
        });
        return candidate;
      } catch (err) {
        // 422 = a file with that name exists (no sha sent); try the next name.
        if (!(err instanceof ApiError && err.status === 422)) throw err;
      }
    }
    throw new ApiError(409, 'Too many files with that name');
  }

  async save(path: string, content: string, baseVersion: string): Promise<SaveResult> {
    try {
      const res = await this.putContents(path, content, `Update ${path}`, baseVersion);
      return { path, version: res.content.sha };
    } catch (err) {
      // GitHub answers 409 when `sha` is no longer the file's current blob.
      if (err instanceof ApiError && err.status === 409) throw new ConflictError(await this.currentSha(path));
      throw err;
    }
  }

  async create(path: string, content: string): Promise<SaveResult> {
    try {
      const res = await this.putContents(path, content, `Create ${path}`);
      return { path, version: res.content.sha };
    } catch (err) {
      // Without a sha GitHub refuses (422) to overwrite an existing file.
      if (err instanceof ApiError && err.status === 422) throw new ApiError(409, 'A file with that name already exists');
      throw err;
    }
  }

  /** The contents API has no rename: create the new file, then delete the old one (two commits). */
  async rename(from: string, to: string): Promise<SaveResult> {
    const file = await this.readFile(from);
    const created = await this.create(to, file.content);
    await this.deleteContents(from, file.version, `Rename ${from} to ${to}`);
    return created;
  }

  async remove(path: string): Promise<void> {
    await this.deleteContents(path, await this.currentSha(path), `Delete ${path}`);
  }

  /**
   * Searches the index built with the site (search-index.json). After edits through the API it
   * can lag behind until the next deploy finishes — good enough for finding a page.
   */
  async search(query: string): Promise<SearchHit[]> {
    this.searchIndex ??= this.getStatic<SearchDoc[]>('search-index.json', 'json').catch((err) => {
      this.searchIndex = null;
      throw err;
    });
    return searchDocs(await this.searchIndex, query);
  }

  // ---------- GitHub API plumbing ----------

  private repoPath(path: string) {
    return this.config.contentDir ? `${this.config.contentDir}/${path}` : path;
  }

  private contentsPath(path: string) {
    return `/repos/${this.config.repo}/contents/${encodePath(this.repoPath(path))}`;
  }

  private headers(token = this.token): HeadersInit {
    return {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async gh<T>(method: string, url: string, body?: unknown): Promise<T> {
    const res = await this.deps.fetch(`${API}${url}`, {
      method,
      headers: { ...this.headers(), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        this.disconnect();
        throw new ApiError(401, 'GitHub token expired or was revoked. Connect again.');
      }
      throw new ApiError(res.status, data.message ?? res.statusText);
    }
    return data as T;
  }

  private putContents(path: string, content: string, message: string, sha?: string) {
    return this.gh<{ content: { sha: string } }>('PUT', this.contentsPath(path), {
      message,
      content: encodeBase64Utf8(content),
      branch: this.config.branch,
      ...(sha ? { sha } : {}),
    });
  }

  private deleteContents(path: string, sha: string, message: string) {
    return this.gh<unknown>('DELETE', this.contentsPath(path), { message, sha, branch: this.config.branch });
  }

  private async currentSha(path: string): Promise<string> {
    const file = await this.gh<{ sha: string }>(
      'GET',
      `${this.contentsPath(path)}?ref=${encodeURIComponent(this.config.branch)}`,
    );
    return file.sha;
  }

  private async getStatic<T>(file: string, as: 'json' | 'text'): Promise<T> {
    const res = await this.deps.fetch(`${this.config.base}${file}`);
    if (!res.ok) throw new ApiError(res.status, res.status === 404 ? 'File not found' : res.statusText);
    return (as === 'json' ? res.json() : res.text()) as Promise<T>;
  }
}

/** Same contract as the local server: content always uses `\n`. */
function normalize(text: string): string {
  return text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}
