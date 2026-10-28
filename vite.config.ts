import { defineConfig, type Plugin } from 'vite';

// Production builds get a Content-Security-Policy <meta> (GitHub Pages can't send headers).
// Dev is left alone because Vite's HMR needs websockets and inline scripts.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // CodeMirror/ProseMirror inject <style> elements
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.github.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const cspMeta: Plugin = {
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`),
};

export default defineConfig({
  root: 'client',
  plugins: [cspMeta],
  // The big chunks are the two editors, which are only loaded when someone clicks Edit.
  build: { outDir: '../dist/client', emptyOutDir: true, chunkSizeWarningLimit: 700 },
});
