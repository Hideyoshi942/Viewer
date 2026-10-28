export type TreeNode = {
  name: string;
  /** Path relative to the root folder, always with `/` separators. */
  path: string;
  type: 'dir' | 'file';
  children?: TreeNode[];
};

export type FileContent = {
  path: string;
  content: string;
  /**
   * Opaque version tag, sent back on save to detect conflicting edits.
   * Local server: `<mtimeMs>-<size>`. GitHub: the blob sha.
   */
  version: string;
};

export type SaveResult = { path: string; version: string };

export type FsEvent = {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
};

export type SearchHit = { path: string; title: string; snippet: string };

export const MARKDOWN_EXT = /\.(md|markdown)$/i;
export const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)$/i;

/** Hidden folder inside the root that holds backups and the trash. */
export const META_DIR = '.mdviewer';
