/** Absolute URL, protocol-relative URL, mailto:, data:, etc. */
export function isExternal(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
}

/**
 * Resolve `href` against the folder of `fromFile` (both relative to the root folder).
 * A leading `/` means "from the root folder". Returns null if the result escapes the root.
 */
export function resolveRelative(fromFile: string, href: string): string | null {
  const out = href.startsWith('/') ? [] : fromFile.split('/').slice(0, -1);
  for (const seg of href.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      if (out.length === 0) return null;
      out.pop();
    } else {
      out.push(seg);
    }
  }
  return out.length > 0 ? out.join('/') : null;
}

export function splitOnce(value: string, sep: string): [string, string] {
  const i = value.indexOf(sep);
  return i === -1 ? [value, ''] : [value.slice(0, i), value.slice(i + 1)];
}

export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** In-app URL for a file: `#/folder/file.md` plus an optional heading anchor. */
export function fileHref(path: string, anchor = ''): string {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `#/${encoded}${anchor ? `#${encodeURIComponent(anchor)}` : ''}`;
}

/** In-app URL for a folder overview dashboard: `#/@folder` or `#/@folder/sub/dir`. */
export function folderHref(path = ''): string {
  if (!path) return '#/@folder';
  return `#/@folder/${path.split('/').map(encodeURIComponent).join('/')}`;
}

export function parseFolderRoute(hash: string): string | null {
  if (hash === '#/@folder') return '';
  if (hash.startsWith('#/@folder/')) {
    return hash.slice('#/@folder/'.length).split('/').map(safeDecode).join('/');
  }
  return null;
}

/** Inverse of fileHref, given `location.hash`. */
export function parseRoute(hash: string): { path: string; anchor: string } | null {
  if (!hash.startsWith('#/')) return null;
  const [path, anchor] = splitOnce(hash.slice(2), '#');
  if (!path) return null;
  return { path: path.split('/').map(safeDecode).join('/'), anchor: safeDecode(anchor) };
}
