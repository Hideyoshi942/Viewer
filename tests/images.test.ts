import { describe, expect, it } from 'vitest';
import { imageFileName, isImageFile } from '../client/images';

const file = (name: string, type: string) => new File(['x'], name, { type });
const now = new Date('2026-10-28T09:30:15Z');

describe('imageFileName', () => {
  it('slugs real names, folding Vietnamese', () => {
    expect(imageFileName(file('Ảnh chụp màn hình.PNG', 'image/png'), now)).toBe('anh-chup-man-hinh.png');
    expect(imageFileName(file('diagram v2.jpeg', 'image/jpeg'), now)).toBe('diagram-v2.jpg');
  });

  it('timestamps pasted screenshots, which browsers all call image.png', () => {
    expect(imageFileName(file('image.png', 'image/png'), now)).toBe('pasted-20261028-093015.png');
    expect(imageFileName(file('', 'image/webp'), now)).toBe('pasted-20261028-093015.webp');
  });

  it('cannot produce path tricks', () => {
    expect(imageFileName(file('../../etc/x.png', 'image/png'), now)).toBe('etc-x.png');
    expect(imageFileName(file('.hidden.png', 'image/png'), now)).toBe('hidden.png');
  });
});

describe('isImageFile', () => {
  it('accepts images by type or extension only', () => {
    expect(isImageFile(file('a.png', 'image/png'))).toBe(true);
    expect(isImageFile(file('a.svg', ''))).toBe(true);
    expect(isImageFile(file('a.pdf', 'application/pdf'))).toBe(false);
  });
});
