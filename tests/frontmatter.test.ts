import { describe, expect, it } from 'vitest';
import { frontMatterInner, frontMatterTitle, joinFrontMatter, splitFrontMatter } from '../shared/frontmatter';
import { contentSignature, survivesRoundTrip } from '../shared/roundtrip';
import { titleOf } from '../shared/search';

describe('splitFrontMatter', () => {
  it('splits a YAML block and joins it back byte-for-byte', () => {
    const text = '---\ntitle: "Hello"\ntags: [a, b]\n---\n\n# Body\n';
    const { frontMatter, body } = splitFrontMatter(text);
    expect(frontMatter).toBe('---\ntitle: "Hello"\ntags: [a, b]\n---\n\n'); // blank line kept with it
    expect(body).toBe('# Body\n');
    expect(joinFrontMatter(frontMatter, body)).toBe(text);
  });

  it('handles TOML (+++) and a file that is only front matter', () => {
    expect(splitFrontMatter('+++\ntitle = "x"\n+++\nbody').frontMatter).toBe('+++\ntitle = "x"\n+++\n');
    expect(splitFrontMatter('---\na: 1\n---').body).toBe('');
  });

  it.each([
    ['no front matter', '# Title\n---\nnot front matter\n---\n'],
    ['a horizontal rule at the top with no closing fence', '---\n\nJust text after a rule\n'],
    ['indented fence', ' ---\na: 1\n---\n'],
  ])('leaves text alone: %s', (_, text) => {
    expect(splitFrontMatter(text)).toEqual({ frontMatter: '', body: text });
  });

  it('gives the inner YAML and the title', () => {
    const fm = '---\ntitle: \'Ghi chú\'\ndate: 2026-10-28\n---\n';
    expect(frontMatterInner(fm)).toBe("title: 'Ghi chú'\ndate: 2026-10-28");
    expect(frontMatterTitle(fm)).toBe('Ghi chú');
  });

  it('titleOf prefers the front matter title, then the first H1', () => {
    expect(titleOf('a.md', '---\ntitle: From YAML\n---\n# From H1\n')).toBe('From YAML');
    expect(titleOf('a.md', '---\ntags: x\n---\n# From H1\n')).toBe('From H1');
  });
});

describe('round-trip signature', () => {
  it('ignores formatting the visual editor may change', () => {
    const original = '* one\n* two\n\n1. a\n1. b\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\nTom &amp; Jerry\n';
    const reserialised = '- one\n- two\n\n1. a\n2. b\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\nTom & Jerry\n';
    expect(survivesRoundTrip(original, reserialised)).toBe(true);
  });

  it('notices lost or changed text', () => {
    expect(survivesRoundTrip('<div class="note">Hi</div>', 'Hi')).toBe(false);
    expect(survivesRoundTrip('[[Wiki link]]', '\\[\\[Wiki link\\]\\]')).toBe(true); // escaped but same text
    expect(survivesRoundTrip('a b c', 'a c')).toBe(false);
  });

  it('keeps letters, digits and Vietnamese text in the signature', () => {
    expect(contentSignature('# Tiếng Việt 2026')).toBe('TiếngViệt2026');
  });
});
