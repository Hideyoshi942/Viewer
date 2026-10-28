import { fold } from '../shared/search';
import { IMAGE_EXT } from '../shared/types';
import type { DataSource } from './data';

const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
};

export const isImageFile = (file: File) => file.type in EXT_BY_TYPE || IMAGE_EXT.test(file.name);

/** A safe, readable file name: "Ảnh chụp màn hình.PNG" → "anh-chup-man-hinh.png"; clipboard images get a timestamp. */
export function imageFileName(file: File, now = new Date()): string {
  const ext = EXT_BY_TYPE[file.type] ?? file.name.split('.').pop()?.toLowerCase() ?? 'png';
  const stem = fold(file.name.replace(/\.[^.]+$/, ''))
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
  // Browsers name every pasted screenshot "image.png"; that's useless as a name.
  if (stem && stem !== 'image') return `${stem}.${ext}`;
  const stamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-');
  return `pasted-${stamp}.${ext}`;
}

/**
 * Upload images into an `images/` folder next to the markdown file.
 * Returns markdown-ready paths relative to that file (e.g. `images/diagram.png`).
 */
export async function uploadImages(ds: DataSource, mdPath: string, files: File[]): Promise<{ src: string; alt: string }[]> {
  const dir = mdPath.includes('/') ? mdPath.slice(0, mdPath.lastIndexOf('/')) : '';
  const results = [];
  for (const file of files.filter(isImageFile)) {
    const name = imageFileName(file);
    const saved = await ds.uploadImage(dir ? `${dir}/images/${name}` : `images/${name}`, file);
    const relative = dir ? saved.slice(dir.length + 1) : saved;
    results.push({
      src: relative.split('/').map(encodeURIComponent).join('/'),
      alt: name.replace(/\.[^.]+$/, ''),
    });
  }
  return results;
}

/** Open the OS file picker for images. */
export function pickImages(): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.addEventListener('change', () => resolve([...(input.files ?? [])]));
    input.addEventListener('cancel', () => resolve([]));
    input.click();
  });
}
