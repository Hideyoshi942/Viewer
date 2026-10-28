import type { FileContent, FsEvent, SaveResult, SearchHit, TreeNode } from '../shared/types';

/** Where the app reads and writes content. Local server now; GitHub Pages + GitHub API later. */
export interface DataSource {
  readonly canWrite: boolean;
  /** Shown in the delete confirmation so the user knows how to get a file back. */
  readonly deleteHint: string;
  /** Optional note shown after a successful save. */
  readonly savedHint?: string;
  listTree(): Promise<TreeNode[]>;
  readFile(path: string): Promise<FileContent>;
  assetUrl(path: string): string;
  save(path: string, content: string, baseVersion: string): Promise<SaveResult>;
  create(path: string, content: string): Promise<SaveResult>;
  rename(from: string, to: string): Promise<SaveResult>;
  remove(path: string): Promise<void>;
  /** Store an image; never overwrites. Resolves to the path actually used (relative to the root). */
  uploadImage(path: string, file: Blob): Promise<string>;
  /** Full-text search across all files (diacritics-insensitive). */
  search(query: string): Promise<SearchHit[]>;
  /** Live change notifications, when the source supports them. Returns an unsubscribe function. */
  subscribe?(onEvent: (event: FsEvent) => void): () => void;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** The file changed since it was loaded; `currentVersion` lets the user overwrite anyway. */
export class ConflictError extends Error {
  constructor(public currentVersion: string) {
    super('File was changed by someone else');
  }
}

async function call<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 409 && typeof data.currentVersion === 'string') throw new ConflictError(data.currentVersion);
    throw new ApiError(res.status, data.error ?? res.statusText);
  }
  return data as T;
}

const q = (path: string) => `?path=${encodeURIComponent(path)}`;

export class LocalApi implements DataSource {
  readonly canWrite = true;
  readonly deleteHint = 'It is moved to .mdviewer/trash inside your folder.';

  listTree() {
    return call<TreeNode[]>('GET', '/api/tree');
  }

  readFile(path: string) {
    return call<FileContent>('GET', `/api/file${q(path)}`);
  }

  assetUrl(path: string) {
    return `/api/asset${q(path)}`;
  }

  save(path: string, content: string, baseVersion: string) {
    return call<SaveResult>('PUT', `/api/file${q(path)}`, { content, baseVersion });
  }

  create(path: string, content: string) {
    return call<SaveResult>('POST', `/api/file${q(path)}`, { content });
  }

  rename(from: string, to: string) {
    return call<SaveResult>('POST', '/api/rename', { from, to });
  }

  remove(path: string) {
    return call<void>('DELETE', `/api/file${q(path)}`);
  }

  async uploadImage(path: string, file: Blob) {
    const res = await fetch(`/api/asset${q(path)}`, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.error ?? res.statusText);
    return (data as { path: string }).path;
  }

  search(query: string) {
    return call<SearchHit[]>('GET', `/api/search?q=${encodeURIComponent(query)}`);
  }

  subscribe(onEvent: (event: FsEvent) => void) {
    // EventSource reconnects on its own if the server restarts.
    const source = new EventSource('/api/events');
    source.addEventListener('fs', (e) => onEvent(JSON.parse((e as MessageEvent).data)));
    return () => source.close();
  }
}
