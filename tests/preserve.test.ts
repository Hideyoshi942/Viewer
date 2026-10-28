import { describe, expect, it } from 'vitest';
import { preserveUntouched } from '../shared/preserve';

// What Milkdown does to this file on load: bullets → "-", table delimiter → "| - |".
const original = '# Plain\n\nJust text.\n\n* one\n* two\n\n| A | B |\n|---|---|\n| 1 | 2 |\n';
const loaded = '# Plain\n\nJust text.\n\n- one\n- two\n\n| A | B |\n| - | - |\n| 1 | 2 |\n';

describe('preserveUntouched', () => {
  it('returns the original byte-for-byte when nothing was edited', () => {
    expect(preserveUntouched(original, loaded, loaded)).toBe(original);
  });

  it('changes only the edited line', () => {
    const current = loaded.replace('Just text.', 'Just text. Added.');
    expect(preserveUntouched(original, loaded, current)).toBe(original.replace('Just text.', 'Just text. Added.'));
  });

  it('keeps the table delimiter when a cell is edited', () => {
    const current = loaded.replace('| 1 | 2 |', '| 1 | 22 |');
    expect(preserveUntouched(original, loaded, current)).toBe(original.replace('| 1 | 2 |', '| 1 | 22 |'));
  });

  it('uses the editor formatting only inside a reformatted block that was edited', () => {
    const current = loaded.replace('- two', '- two!');
    const result = preserveUntouched(original, loaded, current);
    expect(result).toContain('- one\n- two!'); // the edited list block
    expect(result).toContain('|---|---|'); // untouched elsewhere
  });

  it('keeps inserted and deleted lines in the right place', () => {
    const inserted = loaded.replace('Just text.\n', 'Just text.\n\nNew paragraph.\n');
    expect(preserveUntouched(original, loaded, inserted)).toBe(
      original.replace('Just text.\n', 'Just text.\n\nNew paragraph.\n'),
    );

    const deleted = loaded.replace('# Plain\n\n', '');
    expect(preserveUntouched(original, loaded, deleted)).toBe(original.replace('# Plain\n\n', ''));
  });

  it('keeps syntax the editor dropped (reference links) when that part is untouched', () => {
    const orig = '# Refs\n\nSee [docs][d].\n\nOther.\n\n[d]: https://x.y\n';
    const load = '# Refs\n\nSee [docs](https://x.y).\n\nOther.\n';
    const curr = load.replace('Other.', 'Other, edited.');
    expect(preserveUntouched(orig, load, curr)).toBe(orig.replace('Other.', 'Other, edited.'));
  });

  it('appends at the end', () => {
    const current = `${loaded}\nThe end.\n`;
    expect(preserveUntouched(original, loaded, current)).toBe(`${original}\nThe end.\n`);
  });
});
