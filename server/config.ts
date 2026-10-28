import path from 'node:path';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));

export const config = {
  rootDir: path.resolve(positional[0] ?? process.env.ROOT_DIR ?? 'docs'),
  host: process.env.HOST ?? '127.0.0.1',
  port: Number(process.env.PORT ?? 4000),
  dev: args.includes('--dev'),
};
