import { frontMatterTitle, splitFrontMatter } from './frontmatter';
import type { SearchHit } from './types';

/** Lowercase and strip diacritics so "tieng viet" matches "Tiếng Việt". */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // combining marks (accents)
    .replace(/đ/g, 'd');
}

/** Fold character by character, remembering where each folded char came from in the original. */
function foldWithMap(text: string): { folded: string; map: number[] } {
  let folded = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    for (const ch of fold(text[i])) {
      folded += ch;
      map.push(i);
    }
  }
  return { folded, map };
}

/** Front matter `title:`, else the first H1, else the file name. */
export function titleOf(path: string, content: string): string {
  const { frontMatter, body } = splitFrontMatter(content);
  return (
    frontMatterTitle(frontMatter) ||
    /^#\s+(.+)$/m.exec(body)?.[1].trim() ||
    path.split('/').pop()!.replace(/\.(md|markdown)$/i, '')
  );
}

export type SearchDoc = { path: string; content: string };

const SNIPPET_RADIUS = 60;

/**
 * Every whitespace-separated term must appear in the file (content or path).
 * Title matches rank first, then by number of hits.
 */
export function searchDocs(docs: SearchDoc[], query: string, limit = 30): SearchHit[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { hit: SearchHit; score: number }[] = [];
  for (const doc of docs) {
    const title = titleOf(doc.path, doc.content);
    const { folded, map } = foldWithMap(doc.content);
    const foldedPath = fold(doc.path);
    if (!terms.every((t) => folded.includes(t) || foldedPath.includes(t))) continue;

    const foldedTitle = fold(title);
    let score = terms.filter((t) => foldedTitle.includes(t)).length * 100;
    for (const t of terms) score += Math.min(folded.split(t).length - 1, 20);

    const first = folded.indexOf(terms[0]);
    scored.push({ hit: { path: doc.path, title, snippet: first === -1 ? '' : snippetAt(doc.content, map[first]) }, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.hit.path.localeCompare(b.hit.path))
    .slice(0, limit)
    .map((s) => s.hit);
}

function snippetAt(content: string, index: number): string {
  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = Math.min(content.length, index + SNIPPET_RADIUS);
  const text = content
    .slice(start, end)
    .replace(/[#>*_`|[\]]+/g, ' ') // drop most markdown syntax
    .replace(/\s+/g, ' ')
    .trim();
  return `${start > 0 ? '…' : ''}${text}${end < content.length ? '…' : ''}`;
}

/** [start, end) ranges in `text` where any of the query terms occur, for highlighting. */
export function matchRanges(text: string, query: string): [number, number][] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  const { folded, map } = foldWithMap(text);
  const ranges: [number, number][] = [];
  for (const t of terms) {
    for (let i = folded.indexOf(t); i !== -1; i = folded.indexOf(t, i + t.length)) {
      ranges.push([map[i], map[i + t.length - 1] + 1]);
    }
  }
  return ranges.sort((a, b) => a[0] - b[0]);
}
