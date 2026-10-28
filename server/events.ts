import type { Response } from 'express';
import type { FsEvent } from '../shared/types';

/** Fan-out of filesystem events to connected browsers over Server-Sent Events. */
export class EventHub {
  private clients = new Set<Response>();

  /** Hand an open SSE response to the hub; it is dropped when the connection closes. */
  attach(res: Response) {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders();
    res.write('retry: 2000\n\n');
    this.clients.add(res);

    // Comment lines keep proxies and idle timeouts from closing the stream.
    const heartbeat = setInterval(() => res.write(': ping\n\n'), 25_000);
    res.on('close', () => {
      clearInterval(heartbeat);
      this.clients.delete(res);
    });
  }

  broadcast(event: FsEvent) {
    const data = `event: fs\ndata: ${JSON.stringify(event)}\n\n`;
    for (const client of this.clients) client.write(data);
  }

  get size() {
    return this.clients.size;
  }
}
