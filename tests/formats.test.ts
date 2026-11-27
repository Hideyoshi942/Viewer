import { describe, expect, it } from 'vitest';
import {
  canEditFile,
  getFormat,
  isAssetServable,
  isBinaryFile,
  isMarkdownFile,
  isSupportedFile,
  isTextFile,
} from '../shared/formats';

describe('shared/formats', () => {
  it('recognises markdown, code, data, documents, and media', () => {
    expect(getFormat('notes/README.MD')?.kind).toBe('markdown');
    expect(getFormat('src/app.ts')?.kind).toBe('code');
    expect(getFormat('config/settings.json')?.kind).toBe('json');
    expect(getFormat('deploy.yaml')?.kind).toBe('yaml');
    expect(getFormat('data/users.csv')?.kind).toBe('csv');
    expect(getFormat('web/index.html')?.kind).toBe('html');
    expect(getFormat('img/diagram.svg')?.kind).toBe('svg');
    expect(getFormat('docs/manual.pdf')?.kind).toBe('pdf');
    expect(getFormat('docs/spec.docx')?.kind).toBe('docx');
    expect(getFormat('docs/budget.xlsx')?.kind).toBe('xlsx');
    expect(getFormat('media/shot.png')?.kind).toBe('image');
    expect(getFormat('media/clip.mp3')?.kind).toBe('audio');
    expect(getFormat('media/demo.mp4')?.kind).toBe('video');
  });

  it('recognises special extensionless files', () => {
    expect(getFormat('Dockerfile')?.kind).toBe('code');
    expect(getFormat('sub/Makefile')?.kind).toBe('code');
    expect(getFormat('LICENSE')?.kind).toBe('text');
  });

  it('rejects unsupported binary/executable extensions', () => {
    expect(isSupportedFile('bin/app.exe')).toBe(false);
    expect(isSupportedFile('lib/native.dll')).toBe(false);
    expect(isSupportedFile('raw/blob.bin')).toBe(false);
    expect(getFormat('unknown')).toBeNull();
  });

  it('classifies text, editable, binary, and asset-servable files accurately', () => {
    expect(isMarkdownFile('a.md')).toBe(true);
    expect(isTextFile('a.json')).toBe(true);
    expect(canEditFile('a.ts')).toBe(true);
    expect(isBinaryFile('a.pdf')).toBe(true);
    expect(canEditFile('a.pdf')).toBe(false);
    expect(isAssetServable('a.pdf')).toBe(true);
    expect(isAssetServable('a.svg')).toBe(true);
    expect(isAssetServable('a.md')).toBe(false);
  });
});
