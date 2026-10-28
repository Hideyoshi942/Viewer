import { diffArrays } from 'diff';

/**
 * The visual editor re-serialises the whole document, so saving would rewrite lines nobody
 * touched (`*` bullets → `-`, table pipes, reference links…). This puts the user's edits back
 * onto the original text instead, so only edited lines change on disk.
 *
 * - `original`: the file as loaded.
 * - `loaded`:   the editor's serialisation right after loading it (same content, its formatting).
 * - `current`:  the editor's serialisation now.
 *
 * `original` and `loaded` are aligned into chunks (equal lines, or a block the serialiser
 * reformatted). Each chunk the user didn't touch is written back from `original`; touched chunks
 * use the editor's version.
 */
export function preserveUntouched(original: string, loaded: string, current: string): string {
  if (current === loaded) return original;
  const A = original.split('\n');
  const B = loaded.split('\n');
  const C = current.split('\n');

  // 1. Align original ↔ loaded.
  type Chunk = { a: string[]; b: string[] };
  const chunks: Chunk[] = [];
  let pending: Chunk | null = null;
  for (const part of diffArrays(A, B)) {
    if (!part.added && !part.removed) {
      if (pending) chunks.push(pending);
      pending = null;
      for (const line of part.value) chunks.push({ a: [line], b: [line] });
    } else {
      pending ??= { a: [], b: [] };
      (part.removed ? pending.a : pending.b).push(...part.value);
    }
  }
  if (pending) chunks.push(pending);

  // 2. What the user did, in terms of `loaded` lines: which survive, what got inserted where.
  const kept: boolean[] = new Array(B.length).fill(true);
  const inserts = new Map<number, string[]>(); // before loaded-line index
  let bi = 0;
  for (const part of diffArrays(B, C)) {
    if (part.added) inserts.set(bi, [...(inserts.get(bi) ?? []), ...part.value]);
    else if (part.removed) for (let k = 0; k < part.value.length; k++) kept[bi++] = false;
    else bi += part.value.length;
  }

  // 3. Rebuild: untouched chunks from the original, touched ones from the editor.
  const out: string[] = [];
  const emitted = new Set<number>();
  const emitInsert = (at: number) => {
    if (emitted.has(at)) return;
    emitted.add(at);
    out.push(...(inserts.get(at) ?? []));
  };

  let start = 0;
  for (const chunk of chunks) {
    const end = start + chunk.b.length;
    emitInsert(start);
    let touched = false;
    for (let k = start; k < end; k++) {
      if (!kept[k] || (k > start && inserts.has(k))) touched = true;
    }
    if (!touched) {
      out.push(...chunk.a);
    } else {
      for (let k = start; k < end; k++) {
        if (k > start) emitInsert(k);
        if (kept[k]) out.push(B[k]);
      }
    }
    start = end;
  }
  emitInsert(B.length);
  return out.join('\n');
}
