import type { FileFormat } from '../../shared/formats';
import type { TreeNode } from '../../shared/types';
import type { DataSource } from '../data';

export type ViewerHandle = {
  destroy?(): void;
};

export type ViewerContext = {
  container: HTMLElement;
  path: string;
  format: FileFormat;
  ds: DataSource;
  tree: TreeNode[];
  textContent?: string;
  size?: number;
  onTocReady?: (headings?: HTMLElement[]) => void;
  onMetaText?: (extra: string) => void;
  onToast?: (message: string, kind?: 'info' | 'error') => void;
};

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(text: string, filename: string, mime = 'text/plain;charset=utf-8'): void {
  downloadBlob(new Blob([text], { type: mime }), filename);
}
