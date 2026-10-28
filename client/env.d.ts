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
