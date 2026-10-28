import { unzipSync } from 'fflate';
import { searchDocs } from '../shared/search';
import { isIgnoredSegment, treeFromPaths } from '../shared/tree';
import { IMAGE_EXT, MARKDOWN_EXT, type FileContent, type SearchHit, type TreeNode } from '../shared/types';
import { ApiError, type DataSource } from './data';

/** A folder picked on this device: every markdown file and image in it, kept in the browser. */
export type Snapshot = { name: string; files: { path: string; blob: Blob }[] };

const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml', // <img> refuses an SVG blob without this type
  avif: 'image/avif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
};

/** Same visibility rules as the server tree, plus macOS zip junk. */
function wanted(path: string): boolean {
  const parts = path.split('/');
  if (parts.some((p) => isIgnoredSegment(p) || p === '__MACOSX')) return false;
  return MARKDOWN_EXT.test(path) || IMAGE_EXT.test(path);
}

/** Drop a top folder shared by every path ("notes/a.md", "notes/b/c.md" → "a.md", "b/c.md"). */
function stripCommonFolder(entries: Snapshot['files'], fallbackName: string): Snapshot {
  const first = entries[0]?.path.split('/')[0];
  const shared = entries.length > 0 && entries.every((e) => e.path.includes('/') && e.path.split('/')[0] === first);
  return {
    name: shared ? first : fallbackName,
    files: shared ? entries.map((e) => ({ ...e, path: e.path.slice(first.length + 1) })) : entries,
  };
}

function finish(entries: Snapshot['files'], fallbackName: string): Snapshot {
  const clean = entries.map((e) => ({ ...e, path: e.path.replace(/\\/g, '/').replace(/^\/+/, '') }));
  const snap = stripCommonFolder(clean, fallbackName);
  return { ...snap, files: snap.files.filter((e) => wanted(e.path)) };
}

export function snapshotFromZip(name: string, data: Uint8Array): Snapshot {
  const unzipped = unzipSync(data, { filter: (f) => !f.name.endsWith('/') && wanted(f.name) });
  const entries = Object.entries(unzipped).map(([path, bytes]) => {
    const ext = path.split('.').pop()!.toLowerCase();
    return { path, blob: new Blob([bytes], { type: IMAGE_TYPES[ext] ?? 'text/markdown' }) };
  });
  return finish(entries, name.replace(/\.zip$/i, ''));
}

/** Files from <input type=file> (a folder via webkitdirectory, several files, or one .zip). */
export async function snapshotFromFiles(list: File[]): Promise<Snapshot> {
  if (list.length === 1 && /\.zip$/i.test(list[0].name)) {
    return snapshotFromZip(list[0].name, new Uint8Array(await list[0].arrayBuffer()));
  }
  const entries = list.map((f) => ({ path: f.webkitRelativePath || f.name, blob: f as Blob }));
  return finish(entries, list.length === 1 ? list[0].name.replace(MARKDOWN_EXT, '') : 'Opened files');
}

// ---------- Folder picker (File System Access API: desktop Chrome/Edge, some Android) ----------

type DirHandle = { name: string; kind: 'directory'; entries(): AsyncIterable<[string, DirHandle | FileHandle]> };
type FileHandle = { name: string; kind: 'file'; getFile(): Promise<File> };

export const canPickDirectory = () => typeof (window as { showDirectoryPicker?: unknown }).showDirectoryPicker === 'function';

/** Resolves to null if the user cancels. */
export async function pickDirectory(): Promise<Snapshot | null> {
  let dir: DirHandle;
  try {
    dir = await (window as unknown as { showDirectoryPicker(o: object): Promise<DirHandle> }).showDirectoryPicker({ mode: 'read' });
  } catch {
    return null; // cancelled
  }
  const entries: Snapshot['files'] = [];
  const walk = async (handle: DirHandle, prefix: string) => {
    for await (const [name, child] of handle.entries()) {
      if (isIgnoredSegment(name)) continue;
      const path = prefix ? `${prefix}/${name}` : name;
      if (child.kind === 'directory') await walk(child, path);
      else if (wanted(path)) entries.push({ path, blob: await child.getFile() });
    }
  };
  await walk(dir, '');
  return { name: dir.name, files: entries };
}

// ---------- Remember the last opened folder (IndexedDB can hold Blobs) ----------

const DB_NAME = 'mdv';
const STORE = 'device-folder';
const KEY = 'current';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = tx.onabort = () => reject(tx.error ?? req.error);
    });
  } finally {
    db.close();
  }
}

/** False if the browser refused (private mode, quota): the folders still work until the page closes. */
export async function rememberSnapshots(snapshots: Snapshot[]): Promise<boolean> {
  try {
    await withStore('readwrite', (s) => s.put(snapshots, KEY));
    return true;
  } catch {
    return false;
  }
}

export async function recallSnapshots(): Promise<Snapshot[]> {
  try {
    const stored = await withStore<Snapshot | Snapshot[] | undefined>('readonly', (s) => s.get(KEY));
    if (!stored) return [];
    return Array.isArray(stored) ? stored : [stored]; // older versions kept a single folder
  } catch {
    return [];
  }
}

export async function forgetSnapshots(): Promise<void> {
  try {
    await withStore('readwrite', (s) => s.delete(KEY));
  } catch {
    // nothing stored
  }
}

// ---------- The data source ----------

const readOnly = (..._args: unknown[]): Promise<never> =>
  Promise.reject(new ApiError(405, 'This folder was opened from your device and is read-only.'));

/** "notes" → "notes (2)" when a folder of that name is already open. */
function uniqueName(name: string, taken: Set<string>): string {
  const base = name.replace(/[\\/]/g, '-').trim() || 'Folder';
  let candidate = base;
  for (let n = 2; taken.has(candidate); n++) candidate = `${base} (${n})`;
  return candidate;
}

/**
 * Read-only DataSource over one or more Snapshots. Each folder shows up as its own
 * top-level folder ("notes/a.md"), so adding another folder adds a new root beside it.
 * Images are served as blob: URLs.
 */
export class DeviceFolderSource implements DataSource {
  readonly canWrite = false;
  readonly deleteHint = '';
  /** The open folders, as stored (each name is unique and is the top-level folder in the tree). */
  readonly snapshots: Snapshot[] = [];
  private texts = new Map<string, string>();
  private images = new Map<string, Blob>();
  private urls = new Map<string, string>();

  static async create(snapshots: Snapshot[]): Promise<DeviceFolderSource> {
    const source = new DeviceFolderSource();
    for (const snapshot of snapshots) await source.add(snapshot);
    return source;
  }

  /** Mount another folder as a new top-level folder; returns the name it got. */
  async add(snapshot: Snapshot): Promise<string> {
    const name = uniqueName(snapshot.name, new Set(this.snapshots.map((s) => s.name)));
    for (const { path, blob } of snapshot.files) {
      const full = `${name}/${path}`;
      if (MARKDOWN_EXT.test(path)) this.texts.set(full, (await blob.text()).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n'));
      else this.images.set(full, blob);
    }
    this.snapshots.push({ ...snapshot, name });
    return name;
  }

  /** Unmount one top-level folder. */
  removeFolder(name: string) {
    const prefix = `${name}/`;
    for (const path of [...this.texts.keys()]) if (path.startsWith(prefix)) this.texts.delete(path);
    for (const path of [...this.images.keys()]) if (path.startsWith(prefix)) this.images.delete(path);
    for (const [path, url] of [...this.urls]) {
      if (!path.startsWith(prefix)) continue;
      URL.revokeObjectURL(url);
      this.urls.delete(path);
    }
    const index = this.snapshots.findIndex((s) => s.name === name);
    if (index >= 0) this.snapshots.splice(index, 1);
  }

  /** "notes" or "notes + 2 more". */
  get name() {
    const [first, ...rest] = this.snapshots.map((s) => s.name);
    return rest.length ? `${first} + ${rest.length} more` : (first ?? '');
  }

  get fileCount() {
    return this.texts.size;
  }

  async listTree(): Promise<TreeNode[]> {
    return treeFromPaths([...this.texts.keys()]);
  }

  async readFile(path: string): Promise<FileContent> {
    const content = this.texts.get(path);
    if (content === undefined) throw new ApiError(404, 'File not found');
    return { path, content, version: '' };
  }

  assetUrl(path: string): string {
    let url = this.urls.get(path);
    const blob = this.images.get(path);
    if (!url && blob) {
      url = URL.createObjectURL(blob);
      this.urls.set(path, url);
    }
    return url ?? 'data:,';
  }

  async search(query: string): Promise<SearchHit[]> {
    return searchDocs([...this.texts].map(([path, content]) => ({ path, content })), query);
  }

  save = readOnly;
  create = readOnly;
  rename = readOnly;
  remove = readOnly;
  uploadImage = readOnly;

  /** Free the image blob URLs. */
  close() {
    for (const url of this.urls.values()) URL.revokeObjectURL(url);
    this.urls.clear();
  }
}
