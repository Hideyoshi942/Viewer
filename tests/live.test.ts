import type { FSWatcher } from 'chokidar';
import fs from 'node:fs/promises';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import type { FsEvent } from '../shared/types';
import { createApp } from '../server/app';
import { EventHub } from '../server/events';
import { watchRoot } from '../server/watcher';

let tmp: string;
let watcher: FSWatcher;
let server: Server;
let baseUrl: string;
let hub: EventHub;

beforeEach(async () => {
  tmp = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'mdv-live-')));
  await fs.writeFile(path.join(tmp, 'a.md'), '# A');
  hub = new EventHub();
  watcher = watchRoot(tmp, (e) => hub.broadcast(e));
  await new Promise<void>((resolve) => watcher.on('ready', () => resolve()));
  server = createApp(tmp, { events: hub }).listen(0);
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  await watcher.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(tmp, { recursive: true, force: true });
});

/** Open the SSE stream and collect `fs` events until `done` says stop (or time runs out). */
async function collect(trigger: () => Promise<void>, done: (events: FsEvent[]) => boolean): Promise<FsEvent[]> {
  const controller = new AbortController();
  const res = await fetch(`${baseUrl}/api/events`, { signal: controller.signal });
  expect(res.headers.get('content-type')).toContain('text/event-stream');
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  const events: FsEvent[] = [];
  const timeout = setTimeout(() => controller.abort(), 5000);

  await trigger();
  let buffer = '';
  try {
    while (!done(events)) {
      const { value, done: ended } = await reader.read();
      if (ended) break;
      buffer += value;
      for (const match of buffer.matchAll(/event: fs\ndata: (.+)\n\n/g)) events.push(JSON.parse(match[1]));
      buffer = buffer.replace(/[\s\S]*\n\n/, '');
    }
  } catch {
    // aborted by timeout; assertions below report what arrived
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
  return events;
}

it('pushes add, change and unlink events for markdown files', async () => {
  const events = await collect(
    async () => {
      await fs.mkdir(path.join(tmp, 'sub'));
      await fs.writeFile(path.join(tmp, 'sub', 'new.md'), '# New');
      await new Promise((r) => setTimeout(r, 400));
      await fs.writeFile(path.join(tmp, 'a.md'), '# A changed');
      await new Promise((r) => setTimeout(r, 400));
      await fs.rm(path.join(tmp, 'a.md'));
    },
    (evs) => evs.some((e) => e.type === 'unlink'),
  );

  expect(events).toContainEqual({ type: 'add', path: 'sub/new.md' });
  expect(events).toContainEqual({ type: 'change', path: 'a.md' });
  expect(events).toContainEqual({ type: 'unlink', path: 'a.md' });
});

it('ignores non-markdown files and the hidden .mdviewer folder', async () => {
  const events = await collect(
    async () => {
      await fs.writeFile(path.join(tmp, 'notes.txt'), 'x');
      await fs.mkdir(path.join(tmp, '.mdviewer/backup'), { recursive: true });
      await fs.writeFile(path.join(tmp, '.mdviewer/backup/a.md'), 'x');
      await new Promise((r) => setTimeout(r, 300));
      await fs.writeFile(path.join(tmp, 'marker.md'), 'x');
    },
    (evs) => evs.some((e) => e.path === 'marker.md'),
  );

  expect(events.map((e) => e.path)).toEqual(['marker.md']);
});
