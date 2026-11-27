import { describe, expect, it } from 'vitest';
import { parseDelimited, serializeCsv } from '../shared/csv';

describe('shared/csv', () => {
  it('parses RFC-4180 CSV with quoted commas, escaped quotes, and embedded newlines', () => {
    const input = 'Name,Role,Note\r\n"Alice, A.","Admin","Line 1\n""Line 2"""\r\nBob,User,Simple\r\n';
    const res = parseDelimited(input, ',');
    expect(res.headers).toEqual(['Name', 'Role', 'Note']);
    expect(res.rows).toEqual([
      ['Alice, A.', 'Admin', 'Line 1\n"Line 2"'],
      ['Bob', 'User', 'Simple'],
    ]);
  });

  it('auto-detects TSV when tab-delimited', () => {
    const res = parseDelimited('Col1\tCol2\nA\tB\n');
    expect(res.delimiter).toBe('\t');
    expect(res.rows).toEqual([['A', 'B']]);
  });

  it('serializes back to valid CSV', () => {
    const csv = serializeCsv(['A', 'B'], [['hello, world', 'say "hi"']]);
    expect(csv).toBe('A,B\n"hello, world","say ""hi"""');
  });
});
