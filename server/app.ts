import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import fs from 'node:fs/promises';
import { IMAGE_EXT } from '../shared/types';
import type { EventHub } from './events';
import { createMarkdown, readMarkdown, renameMarkdown, saveImage, saveMarkdown, trashMarkdown } from './files';
import { HttpError, resolveExisting } from './paths';
import { SearchIndex } from './search';
import { buildTree } from './tree';

export type AppOptions = {
  /** When set, API requests whose Host header isn't listed are refused (blocks DNS rebinding). */
  allowedHosts?: string[];
  /** Live change notifications; /api/events is only served when this is given. */
  events?: EventHub;
  /** Shared so the file watcher can invalidate it; a private one is made if omitted. */
  search?: SearchIndex;
};

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new HttpError(400, `"${field}" must be a string`);
  return value;
}

/** Host part of an Origin header; '' for "null" or anything unparsable. */
function hostOf(origin: string): string {
  try {
    return new URL(origin).host;
  } catch {
    return '';
  }
}

/**
 * Writes must be JSON (a cross-site form or text/plain POST can't send that without a CORS
 * preflight we never answer) and, if the browser sends an Origin, it must be our own.
 */
const guardWrites: RequestHandler = (req, _res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  const origin = req.headers.origin;
  if (origin !== undefined && hostOf(origin) !== req.headers.host) {
    return next(new HttpError(403, 'Cross-origin request refused'));
  }
  // Image uploads send the raw image; like JSON, an image/* type can't be sent cross-site without a preflight.
  const imageUpload = req.path === '/asset' && req.is('image/*');
  if (req.method !== 'DELETE' && !req.is('application/json') && !imageUpload) {
    return next(new HttpError(415, 'Expected application/json'));
  }
  next();
};

export function createApp(root: string, options: AppOptions = {}) {
  const app = express();
  const allowedHosts = options.allowedHosts ? new Set(options.allowedHosts) : null;
  const search = options.search ?? new SearchIndex(root);

  app.use('/api', (req, _res, next) => {
    if (allowedHosts && !allowedHosts.has(req.headers.host ?? '')) {
      return next(new HttpError(403, 'Host not allowed'));
    }
    next();
  });
  app.use('/api', guardWrites);
  app.use('/api', express.json({ limit: '10mb' }));

  app.get('/api/tree', async (_req, res) => {
    res.json(await buildTree(root));
  });

  app.get('/api/search', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 200) : '';
    res.json(q.trim() ? await search.search(q) : []);
  });

  // Our own writes make search results stale even when no watcher is running.
  // Invalidate after the write finishes, so a search racing the write can't cache old content.
  app.use('/api', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') res.on('finish', () => search.invalidate());
    next();
  });

  app.get('/api/file', async (req, res) => {
    res.json(await readMarkdown(root, req.query.path));
  });

  app.put('/api/file', async (req, res) => {
    const content = requireString(req.body?.content, 'content');
    const baseVersion = requireString(req.body?.baseVersion, 'baseVersion');
    res.json(await saveMarkdown(root, req.query.path, content, baseVersion));
  });

  app.post('/api/file', async (req, res) => {
    const content = requireString(req.body?.content ?? '', 'content');
    res.status(201).json(await createMarkdown(root, req.query.path, content));
  });

  app.delete('/api/file', async (req, res) => {
    await trashMarkdown(root, req.query.path);
    res.status(204).end();
  });

  app.post('/api/rename', async (req, res) => {
    res.json(await renameMarkdown(root, req.body?.from, req.body?.to));
  });

  if (options.events) {
    const events = options.events;
    app.get('/api/events', (_req, res) => events.attach(res));
  }

  app.post('/api/asset', express.raw({ type: 'image/*', limit: '15mb' }), async (req, res) => {
    if (!Buffer.isBuffer(req.body)) throw new HttpError(415, 'Expected an image');
    res.status(201).json(await saveImage(root, req.query.path, req.body));
  });

  app.get('/api/asset', async (req, res) => {
    const full = await resolveExisting(root, req.query.path);
    if (!IMAGE_EXT.test(full) || !(await fs.stat(full)).isFile()) {
      throw new HttpError(400, 'Not an image');
    }
    // SVGs can carry scripts; this stops them running if the asset URL is opened directly.
    res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    res.set('X-Content-Type-Options', 'nosniff');
    res.sendFile(full);
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message, ...err.extra });
    } else if (err?.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Invalid JSON body' });
    } else if (err?.type === 'entity.too.large') {
      res.status(413).json({ error: 'File too large' });
    } else if (err?.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  app.use(onError);

  return app;
}
