/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set by `npm run build:static` (GitHub Pages build). */
  readonly VITE_HOSTED?: string;
  readonly VITE_REPO?: string;
  readonly VITE_BRANCH?: string;
  readonly VITE_CONTENT_DIR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'mammoth/mammoth.browser' {
  export function convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string; messages: unknown[] }>;
}

declare module '*.mjs?url' {
  const src: string;
  export default src;
}

declare module 'read-excel-file/browser' {
  export function readSheetNames(file: Blob | File | ArrayBuffer): Promise<string[]>;
  export default function readXlsxFile(file: Blob | File | ArrayBuffer, options?: { sheet?: string | number }): Promise<unknown[][]>;
}
