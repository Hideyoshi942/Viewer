import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app';
import { config } from './config';
import { EventHub } from './events';
import { SearchIndex } from './search';
import { watchRoot } from './watcher';

if (!fs.existsSync(config.rootDir) || !fs.statSync(config.rootDir).isDirectory()) {
  console.error(`Root folder not found: ${config.rootDir}`);
  process.exit(1);
}

const projectDir = path.resolve(import.meta.dirname, '..');
const loopback = ['127.0.0.1', 'localhost', '::1'].includes(config.host);
const events = new EventHub();
const search = new SearchIndex(config.rootDir);
watchRoot(config.rootDir, (event) => {
  search.invalidate();
  events.broadcast(event);
});

const app = createApp(config.rootDir, {
  // Only pin the Host header when bound to loopback; binding wider is an explicit opt-in.
  allowedHosts: loopback ? [`127.0.0.1:${config.port}`, `localhost:${config.port}`, `[::1]:${config.port}`] : undefined,
  events,
  search,
});

if (config.dev) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    configFile: path.join(projectDir, 'vite.config.ts'),
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const dist = path.join(projectDir, 'dist/client');
  if (!fs.existsSync(path.join(dist, 'index.html'))) {
    console.error('Client not built. Run `npm run build` first, or use `npm run dev`.');
    process.exit(1);
  }
  app.use(express.static(dist));
}

app.listen(config.port, config.host, () => {
  console.log(`Serving ${config.rootDir}`);
  console.log(`Open http://${config.host}:${config.port}`);
});
