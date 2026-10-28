import { structuredPatch } from 'diff';

export type ChangeStats = { added: number; removed: number };

/**
 * Fill `el` with a line diff of what saving would change: only the changed hunks, with two
 * lines of context each, built as DOM nodes (file text is never parsed as HTML).
 */
export function renderChanges(el: HTMLElement, before: string, after: string): ChangeStats {
  const { hunks } = structuredPatch('before', 'after', before, after, '', '', { context: 2 });
  const stats: ChangeStats = { added: 0, removed: 0 };

  if (hunks.length === 0) {
    const p = document.createElement('p');
    p.className = 'diff-empty';
    p.textContent = 'No changes.';
    el.replaceChildren(p);
    return stats;
  }

  const blocks = hunks.map((hunk) => {
    const block = document.createElement('div');
    block.className = 'diff-hunk';
    const header = document.createElement('div');
    header.className = 'diff-hunk-header';
    header.textContent = `Line ${hunk.newStart}`;
    block.append(header);

    let oldLine = hunk.oldStart;
    let newLine = hunk.newStart;
    for (const raw of hunk.lines) {
      const sign = raw[0];
      if (sign === '\\') continue; // "\ No newline at end of file"
      const row = document.createElement('div');
      const num = document.createElement('span');
      num.className = 'diff-num';
      const text = document.createElement('span');
      text.className = 'diff-text';
      text.textContent = raw.slice(1) || ' ';

      if (sign === '+') {
        row.className = 'diff-line add';
        num.textContent = String(newLine++);
        stats.added++;
      } else if (sign === '-') {
        row.className = 'diff-line del';
        num.textContent = String(oldLine++);
        stats.removed++;
      } else {
        row.className = 'diff-line';
        num.textContent = String(newLine);
        oldLine++;
        newLine++;
      }
      row.append(num, text);
      block.append(row);
    }
    return block;
  });

  el.replaceChildren(...blocks);
  return stats;
}
