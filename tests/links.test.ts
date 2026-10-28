import { describe, expect, it } from 'vitest';
import { fileHref, isExternal, parseRoute, resolveRelative } from '../client/links';

describe('resolveRelative', () => {
  it.each([
    ['guide/intro.md', 'next.md', 'guide/next.md'],
    ['guide/intro.md', './img/a.png', 'guide/img/a.png'],
    ['guide/intro.md', '../README.md', 'README.md'],
    ['guide/deep/a.md', '../../b.md', 'b.md'],
    ['guide/intro.md', '/other/x.md', 'other/x.md'],
    ['README.md', 'guide/intro.md', 'guide/intro.md'],
  ])('%s + %s → %s', (from, href, expected) => {
    expect(resolveRelative(from, href)).toBe(expected);
  });

  it('returns null when the link escapes the root', () => {
    expect(resolveRelative('README.md', '../outside.md')).toBeNull();
    expect(resolveRelative('a/b.md', '../../x.md')).toBeNull();
  });
});

describe('isExternal', () => {
  it.each(['https://x.com', 'mailto:a@b.c', '//cdn.x/y', 'data:image/png;base64,AA'])('%s is external', (h) => {
    expect(isExternal(h)).toBe(true);
  });

  it.each(['a.md', '../b.md', '/c.md', 'img/x:y.png'])('%s is internal', (h) => {
    expect(isExternal(h)).toBe(false);
  });
});

describe('fileHref / parseRoute', () => {
  it('round-trips unicode, spaces and anchors', () => {
    const href = fileHref('Tiếng Việt/ghi chú #1.md', 'phần-2');
    expect(parseRoute(href)).toEqual({ path: 'Tiếng Việt/ghi chú #1.md', anchor: 'phần-2' });
  });

  it('ignores hashes that are not routes', () => {
    expect(parseRoute('')).toBeNull();
    expect(parseRoute('#section')).toBeNull();
    expect(parseRoute('#/')).toBeNull();
  });
});
