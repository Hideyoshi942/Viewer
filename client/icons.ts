import type { FileKind } from '../shared/formats';

export type IconName =
  | 'brand'
  | 'folder'
  | 'folderOpen'
  | 'home'
  | 'search'
  | 'plus'
  | 'openFolder'
  | 'sidebar'
  | 'close'
  | 'toc'
  | 'focus'
  | 'focusExit'
  | 'appearance'
  | 'edit'
  | 'trash'
  | 'rename'
  | 'download'
  | 'copy'
  | 'check'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'grid'
  | 'list'
  | 'sun'
  | 'moon'
  | 'book'
  | 'contrast'
  | 'printer'
  | 'expand'
  | 'rotate'
  | 'zoomIn'
  | 'zoomOut'
  | 'wrap'
  | 'audio'
  | 'video'
  | 'image'
  | 'code'
  | 'data'
  | 'doc'
  | 'markdown'
  | 'table'
  | 'pdf'
  | 'html'
  | 'note'
  | 'tip'
  | 'important'
  | 'warning'
  | 'caution'
  | 'upload'
  | 'external';

const PATHS: Record<IconName, string> = {
  brand: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/><path d="M8.5 7.5h7"/><path d="M8.5 11.5h5"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4.2l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  folderOpen: '<path d="M3 7a2 2 0 0 1 2-2h4.2l2 2H19a2 2 0 0 1 2 2v1H7.5a2 2 0 0 0-1.9 1.4L3.6 18"/><path d="M4.2 19h14.4a2 2 0 0 0 1.9-1.4l1.4-4.6A1.5 1.5 0 0 0 20.5 11H7.5a1.5 1.5 0 0 0-1.4 1z"/>',
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  openFolder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2"/><path d="M3 17V9"/><path d="m12 13 0 8"/><path d="m9 16 3-3 3 3"/>',
  sidebar: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  toc: '<path d="M4 6h16"/><path d="M4 12h11"/><path d="M4 18h14"/>',
  focus: '<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>',
  focusExit: '<path d="M9 4v5H4"/><path d="M15 4v5h5"/><path d="M9 20v-5H4"/><path d="M15 20v-5h5"/>',
  appearance: '<path d="M4 18 9.5 6 15 18"/><path d="M5.8 14h7.4"/><path d="M17.5 11v7"/><path d="M14.5 14.5h6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>',
  rename: '<path d="M4 7h11"/><path d="M4 12h7"/><path d="M4 17h7"/><path d="m15 14 4-4 2 2-4 4-3 1z"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  book: '<path d="M2 6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4a2 2 0 0 1-2-2z"/><path d="M22 6a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6a2 2 0 0 0 2-2z"/>',
  contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" stroke="none"/>',
  printer: '<path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="7" rx="1"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>',
  expand: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/><path d="M11 8v6"/><path d="M8 11h6"/>',
  zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/><path d="M8 11h6"/>',
  wrap: '<path d="M3 6h18"/><path d="M3 12h13a3 3 0 0 1 0 6h-4"/><path d="m14 15-3 3 3 3"/><path d="M3 18h5"/>',
  audio: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m16 10 6-3v10l-6-3z"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 15-5-5L5 20"/>',
  code: '<path d="m8 8-5 4 5 4"/><path d="m16 8 5 4-5 4"/><path d="m14 4-4 16"/>',
  data: '<path d="M7 4H5a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2"/><path d="M17 4h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/>',
  markdown: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 15V9l3 3 3-3v6"/><path d="m17 9 0 6"/><path d="m15 13 2 2 2-2"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M9 4v16"/><path d="M15 4v16"/>',
  pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 15h2a1.5 1.5 0 0 0 0-3H8v5"/>',
  html: '<circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8"/><path d="M3.6 15h16.8"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>',
  note: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.5" r="0.7" fill="currentColor"/>',
  tip: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.7.5 1.2 1.2 1.3 2.1h4.4c.1-.9.6-1.6 1.3-2.1A6 6 0 0 0 12 3z"/>',
  important: '<path d="M12 2l2.4 5.2L20 8l-4 4 .9 5.5L12 15l-4.9 2.5L8 12 4 8l5.6-.8z"/>',
  warning: '<path d="M12 3 2 20h20z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.7" fill="currentColor"/>',
  caution: '<path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z"/><path d="M12 8v5"/><circle cx="12" cy="16.5" r="0.7" fill="currentColor"/>',
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 20h16"/>',
  external: '<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
};

export function iconSvg(name: IconName, size = 16, className = ''): string {
  const cls = className ? ` class="icon ${className}"` : ' class="icon"';
  return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]}</svg>`;
}

export function iconEl(name: IconName, size = 16, className = ''): SVGSVGElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = iconSvg(name, size, className);
  return tpl.content.firstElementChild as SVGSVGElement;
}

export function formatIconName(kind: FileKind): IconName {
  switch (kind) {
    case 'markdown':
      return 'markdown';
    case 'code':
      return 'code';
    case 'json':
    case 'yaml':
      return 'data';
    case 'csv':
    case 'xlsx':
      return 'table';
    case 'html':
      return 'html';
    case 'svg':
    case 'image':
      return 'image';
    case 'pdf':
      return 'pdf';
    case 'docx':
    case 'text':
      return 'doc';
    case 'audio':
      return 'audio';
    case 'video':
      return 'video';
  }
}
