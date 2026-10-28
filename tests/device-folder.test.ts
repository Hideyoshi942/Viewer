import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { DeviceFolderSource, snapshotFromFiles, snapshotFromZip } from '../client/device-folder';

const file = (relPath: string, content: string, type = 'text/markdown') => {
  const f = new File([content], relPath.split('/').pop()!, { type });
  // What <input webkitdirectory> provides.
  Object.defineProperty(f, 'webkitRelativePath', { value: relPath });
  return f;
};

describe('snapshotFromFiles (folder picked with <input webkitdirectory>)', () => {
  it('keeps the structure under the picked folder, md and images only, no hidden/junk', async () => {
    const snap = await snapshotFromFiles([
      file('Notes/README.md', '# Home'),
      file('Notes/guide/Ghi chú.md', '# Xin chào'),
      file('Notes/guide/img/a.png', 'png', 'image/png'),
      file('Notes/guide/data.csv', 'a,b'),
      file('Notes/.obsidian/workspace.md', 'hidden'),
      file('Notes/node_modules/x/readme.md', 'ignored'),
    ]);
    expect(snap.name).toBe('Notes');
    expect(snap.files.map((f) => f.path).sort()).toEqual(['README.md', 'guide/Ghi chú.md', 'guide/img/a.png']);
  });

  it('accepts loose .md files picked one by one', async () => {
    const plain = (name: string) => new File(['# x'], name, { type: 'text/markdown' });
    const snap = await snapshotFromFiles([plain('a.md'), plain('b.md')]);
    expect(snap.files.map((f) => f.path)).toEqual(['a.md', 'b.md']);
  });
});

describe('snapshotFromZip', () => {
  const zip = zipSync({
    'my-notes/README.md': strToU8('# Home\r\n\r\n![d](img/d.svg)'),
    'my-notes/sub/deep/x.md': strToU8('# Deep'),
    'my-notes/img/d.svg': strToU8('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    '__MACOSX/my-notes/._README.md': strToU8('junk'),
    'my-notes/.DS_Store': strToU8('junk'),
  });

  it('unzips nested folders, drops the shared top folder and macOS junk', () => {
    const snap = snapshotFromZip('my-notes.zip', zip);
    expect(snap.name).toBe('my-notes');
    expect(snap.files.map((f) => f.path).sort()).toEqual(['README.md', 'img/d.svg', 'sub/deep/x.md']);
  });

  it('gives SVGs the image/svg+xml type so <img> will show them', () => {
    const svg = snapshotFromZip('my-notes.zip', zip).files.find((f) => f.path.endsWith('.svg'))!;
    expect(svg.blob.type).toBe('image/svg+xml');
  });

  it('works through snapshotFromFiles when a single .zip is picked', async () => {
    const snap = await snapshotFromFiles([new File([zip], 'my-notes.zip', { type: 'application/zip' })]);
    expect(snap.files).toHaveLength(3);
  });
});

describe('DeviceFolderSource', () => {
  it('serves the tree, files (\\n line endings), search and image URLs; refuses writes', async () => {
    const source = await DeviceFolderSource.create([
      snapshotFromZip(
        'n.zip',
        zipSync({
          'n/README.md': strToU8('# Trang chủ\r\n\r\nHướng dẫn cài đặt.'),
          'n/guide/a.md': strToU8('# A'),
          'n/guide/p.png': strToU8('png'),
        }),
      ),
    ]);

    expect(source.fileCount).toBe(2);
    expect(source.canWrite).toBe(false);
    expect(source.name).toBe('n');
    const tree = await source.listTree();
    expect(tree.map((n) => n.name)).toEqual(['n']); // the picked folder itself is the top-level folder
    expect(tree[0].children!.map((n) => n.name)).toEqual(['guide', 'README.md']);
    expect((await source.readFile('n/README.md')).content).toBe('# Trang chủ\n\nHướng dẫn cài đặt.');
    await expect(source.readFile('README.md')).rejects.toMatchObject({ status: 404 });
    expect((await source.search('huong dan')).map((h) => h.path)).toEqual(['n/README.md']);
    expect(source.assetUrl('n/guide/p.png')).toMatch(/^blob:/);
    expect(source.assetUrl('n/guide/p.png')).toBe(source.assetUrl('n/guide/p.png')); // cached
    await expect(source.save('n/README.md', 'x', '')).rejects.toMatchObject({ status: 405 });
    source.close();
  });

  it('adds each further folder as its own top-level folder, renaming clashes', async () => {
    const md = (text: string) => new Blob([text], { type: 'text/markdown' });
    const source = await DeviceFolderSource.create([{ name: 'notes', files: [{ path: 'a.md', blob: md('# A') }] }]);

    expect(await source.add({ name: 'docs', files: [{ path: 'sub/b.md', blob: md('# B') }] })).toBe('docs');
    expect(await source.add({ name: 'notes', files: [{ path: 'a.md', blob: md('# A2') }] })).toBe('notes (2)');

    expect((await source.listTree()).map((n) => n.name)).toEqual(['docs', 'notes', 'notes (2)']);
    expect((await source.readFile('notes/a.md')).content).toBe('# A');
    expect((await source.readFile('notes (2)/a.md')).content).toBe('# A2');
    expect((await source.readFile('docs/sub/b.md')).content).toBe('# B');
    expect(source.snapshots.map((s) => s.name)).toEqual(['notes', 'docs', 'notes (2)']);
    expect(source.name).toBe('notes + 2 more');
    expect(source.fileCount).toBe(3);

    source.removeFolder('notes');
    expect((await source.listTree()).map((n) => n.name)).toEqual(['docs', 'notes (2)']);
    await expect(source.readFile('notes/a.md')).rejects.toMatchObject({ status: 404 });
    expect((await source.readFile('notes (2)/a.md')).content).toBe('# A2');
    expect(source.snapshots.map((s) => s.name)).toEqual(['docs', 'notes (2)']);
    expect(source.fileCount).toBe(2);
  });
});
