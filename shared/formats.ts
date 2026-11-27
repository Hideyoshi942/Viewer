export type FileKind =
  | 'markdown'
  | 'code'
  | 'text'
  | 'json'
  | 'yaml'
  | 'csv'
  | 'html'
  | 'svg'
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'image'
  | 'audio'
  | 'video';

export type FormatCategory = 'markdown' | 'code' | 'data' | 'document' | 'media';

export type FileFormat = {
  kind: FileKind;
  category: FormatCategory;
  label: string;
  ext: string;
  mime: string;
  isText: boolean;
  canEdit: boolean;
  isAsset: boolean;
  hljsLang?: string;
  cmLang?: 'markdown' | 'javascript' | 'json' | 'html' | 'css' | 'xml' | 'yaml' | 'python' | 'sql';
};

type FormatDef = Omit<FileFormat, 'ext'>;

const MD_DEF: FormatDef = {
  kind: 'markdown',
  category: 'markdown',
  label: 'Markdown',
  mime: 'text/markdown',
  isText: true,
  canEdit: true,
  isAsset: false,
  cmLang: 'markdown',
};

const EXT_MAP: Record<string, FormatDef> = {
  // Markdown
  md: MD_DEF,
  markdown: MD_DEF,
  mdx: { ...MD_DEF, label: 'MDX' },

  // Structured Data
  json: { kind: 'json', category: 'data', label: 'JSON', mime: 'application/json', isText: true, canEdit: true, isAsset: false, hljsLang: 'json', cmLang: 'json' },
  jsonc: { kind: 'json', category: 'data', label: 'JSONC', mime: 'application/json', isText: true, canEdit: true, isAsset: false, hljsLang: 'json', cmLang: 'json' },
  jsonl: { kind: 'json', category: 'data', label: 'JSONL', mime: 'application/x-ndjson', isText: true, canEdit: true, isAsset: false, hljsLang: 'json', cmLang: 'json' },
  ndjson: { kind: 'json', category: 'data', label: 'NDJSON', mime: 'application/x-ndjson', isText: true, canEdit: true, isAsset: false, hljsLang: 'json', cmLang: 'json' },
  yaml: { kind: 'yaml', category: 'data', label: 'YAML', mime: 'application/yaml', isText: true, canEdit: true, isAsset: false, hljsLang: 'yaml', cmLang: 'yaml' },
  yml: { kind: 'yaml', category: 'data', label: 'YAML', mime: 'application/yaml', isText: true, canEdit: true, isAsset: false, hljsLang: 'yaml', cmLang: 'yaml' },
  csv: { kind: 'csv', category: 'data', label: 'CSV', mime: 'text/csv', isText: true, canEdit: true, isAsset: false },
  tsv: { kind: 'csv', category: 'data', label: 'TSV', mime: 'text/tab-separated-values', isText: true, canEdit: true, isAsset: false },

  // Web & Vector
  html: { kind: 'html', category: 'code', label: 'HTML', mime: 'text/html', isText: true, canEdit: true, isAsset: false, hljsLang: 'xml', cmLang: 'html' },
  htm: { kind: 'html', category: 'code', label: 'HTML', mime: 'text/html', isText: true, canEdit: true, isAsset: false, hljsLang: 'xml', cmLang: 'html' },
  svg: { kind: 'svg', category: 'media', label: 'SVG', mime: 'image/svg+xml', isText: true, canEdit: true, isAsset: true, hljsLang: 'xml', cmLang: 'xml' },

  // Code: JS / TS
  ts: { kind: 'code', category: 'code', label: 'TypeScript', mime: 'text/typescript', isText: true, canEdit: true, isAsset: false, hljsLang: 'typescript', cmLang: 'javascript' },
  tsx: { kind: 'code', category: 'code', label: 'TSX', mime: 'text/typescript', isText: true, canEdit: true, isAsset: false, hljsLang: 'typescript', cmLang: 'javascript' },
  mts: { kind: 'code', category: 'code', label: 'TypeScript', mime: 'text/typescript', isText: true, canEdit: true, isAsset: false, hljsLang: 'typescript', cmLang: 'javascript' },
  cts: { kind: 'code', category: 'code', label: 'TypeScript', mime: 'text/typescript', isText: true, canEdit: true, isAsset: false, hljsLang: 'typescript', cmLang: 'javascript' },
  js: { kind: 'code', category: 'code', label: 'JavaScript', mime: 'text/javascript', isText: true, canEdit: true, isAsset: false, hljsLang: 'javascript', cmLang: 'javascript' },
  jsx: { kind: 'code', category: 'code', label: 'JSX', mime: 'text/javascript', isText: true, canEdit: true, isAsset: false, hljsLang: 'javascript', cmLang: 'javascript' },
  mjs: { kind: 'code', category: 'code', label: 'JavaScript', mime: 'text/javascript', isText: true, canEdit: true, isAsset: false, hljsLang: 'javascript', cmLang: 'javascript' },
  cjs: { kind: 'code', category: 'code', label: 'JavaScript', mime: 'text/javascript', isText: true, canEdit: true, isAsset: false, hljsLang: 'javascript', cmLang: 'javascript' },

  // Code: Styles & Web Frameworks
  css: { kind: 'code', category: 'code', label: 'CSS', mime: 'text/css', isText: true, canEdit: true, isAsset: false, hljsLang: 'css', cmLang: 'css' },
  scss: { kind: 'code', category: 'code', label: 'SCSS', mime: 'text/x-scss', isText: true, canEdit: true, isAsset: false, hljsLang: 'scss', cmLang: 'css' },
  sass: { kind: 'code', category: 'code', label: 'Sass', mime: 'text/x-sass', isText: true, canEdit: true, isAsset: false, hljsLang: 'scss', cmLang: 'css' },
  less: { kind: 'code', category: 'code', label: 'Less', mime: 'text/x-less', isText: true, canEdit: true, isAsset: false, hljsLang: 'less', cmLang: 'css' },
  vue: { kind: 'code', category: 'code', label: 'Vue', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'xml', cmLang: 'html' },
  svelte: { kind: 'code', category: 'code', label: 'Svelte', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'xml', cmLang: 'html' },

  // Code: Backend & Systems
  py: { kind: 'code', category: 'code', label: 'Python', mime: 'text/x-python', isText: true, canEdit: true, isAsset: false, hljsLang: 'python', cmLang: 'python' },
  pyw: { kind: 'code', category: 'code', label: 'Python', mime: 'text/x-python', isText: true, canEdit: true, isAsset: false, hljsLang: 'python', cmLang: 'python' },
  java: { kind: 'code', category: 'code', label: 'Java', mime: 'text/x-java-source', isText: true, canEdit: true, isAsset: false, hljsLang: 'java' },
  kt: { kind: 'code', category: 'code', label: 'Kotlin', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'kotlin' },
  kts: { kind: 'code', category: 'code', label: 'Kotlin', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'kotlin' },
  go: { kind: 'code', category: 'code', label: 'Go', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'go' },
  rs: { kind: 'code', category: 'code', label: 'Rust', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'rust' },
  c: { kind: 'code', category: 'code', label: 'C', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'c' },
  h: { kind: 'code', category: 'code', label: 'C Header', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'c' },
  cpp: { kind: 'code', category: 'code', label: 'C++', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'cpp' },
  cc: { kind: 'code', category: 'code', label: 'C++', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'cpp' },
  cxx: { kind: 'code', category: 'code', label: 'C++', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'cpp' },
  hpp: { kind: 'code', category: 'code', label: 'C++ Header', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'cpp' },
  cs: { kind: 'code', category: 'code', label: 'C#', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'csharp' },
  rb: { kind: 'code', category: 'code', label: 'Ruby', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'ruby' },
  php: { kind: 'code', category: 'code', label: 'PHP', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'php' },
  swift: { kind: 'code', category: 'code', label: 'Swift', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'swift' },
  scala: { kind: 'code', category: 'code', label: 'Scala', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'scala' },
  r: { kind: 'code', category: 'code', label: 'R', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'r' },
  lua: { kind: 'code', category: 'code', label: 'Lua', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'lua' },
  dart: { kind: 'code', category: 'code', label: 'Dart', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'dart' },
  ex: { kind: 'code', category: 'code', label: 'Elixir', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'elixir' },
  exs: { kind: 'code', category: 'code', label: 'Elixir', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'elixir' },

  // Code: Shell, SQL, Config, Markup
  sh: { kind: 'code', category: 'code', label: 'Shell', mime: 'text/x-sh', isText: true, canEdit: true, isAsset: false, hljsLang: 'bash' },
  bash: { kind: 'code', category: 'code', label: 'Bash', mime: 'text/x-sh', isText: true, canEdit: true, isAsset: false, hljsLang: 'bash' },
  zsh: { kind: 'code', category: 'code', label: 'Zsh', mime: 'text/x-sh', isText: true, canEdit: true, isAsset: false, hljsLang: 'bash' },
  fish: { kind: 'code', category: 'code', label: 'Fish', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'bash' },
  ps1: { kind: 'code', category: 'code', label: 'PowerShell', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'powershell' },
  bat: { kind: 'code', category: 'code', label: 'Batch', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'dos' },
  cmd: { kind: 'code', category: 'code', label: 'Batch', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'dos' },
  sql: { kind: 'code', category: 'code', label: 'SQL', mime: 'application/sql', isText: true, canEdit: true, isAsset: false, hljsLang: 'sql', cmLang: 'sql' },
  graphql: { kind: 'code', category: 'code', label: 'GraphQL', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'graphql' },
  gql: { kind: 'code', category: 'code', label: 'GraphQL', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'graphql' },
  xml: { kind: 'code', category: 'code', label: 'XML', mime: 'application/xml', isText: true, canEdit: true, isAsset: false, hljsLang: 'xml', cmLang: 'xml' },
  xsl: { kind: 'code', category: 'code', label: 'XSL', mime: 'application/xml', isText: true, canEdit: true, isAsset: false, hljsLang: 'xml', cmLang: 'xml' },
  plist: { kind: 'code', category: 'code', label: 'Plist', mime: 'application/xml', isText: true, canEdit: true, isAsset: false, hljsLang: 'xml', cmLang: 'xml' },
  toml: { kind: 'code', category: 'code', label: 'TOML', mime: 'application/toml', isText: true, canEdit: true, isAsset: false, hljsLang: 'ini' },
  ini: { kind: 'code', category: 'code', label: 'INI', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'ini' },
  cfg: { kind: 'code', category: 'code', label: 'Config', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'ini' },
  conf: { kind: 'code', category: 'code', label: 'Config', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'nginx' },
  properties: { kind: 'code', category: 'code', label: 'Properties', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'properties' },
  tf: { kind: 'code', category: 'code', label: 'Terraform', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'hcl' },
  hcl: { kind: 'code', category: 'code', label: 'HCL', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'hcl' },
  proto: { kind: 'code', category: 'code', label: 'Protobuf', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'protobuf' },
  diff: { kind: 'code', category: 'code', label: 'Diff', mime: 'text/x-diff', isText: true, canEdit: true, isAsset: false, hljsLang: 'diff' },
  patch: { kind: 'code', category: 'code', label: 'Patch', mime: 'text/x-diff', isText: true, canEdit: true, isAsset: false, hljsLang: 'diff' },
  dockerfile: { kind: 'code', category: 'code', label: 'Dockerfile', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'dockerfile' },
  tex: { kind: 'text', category: 'document', label: 'LaTeX', mime: 'text/x-tex', isText: true, canEdit: true, isAsset: false, hljsLang: 'latex' },
  rst: { kind: 'text', category: 'document', label: 'reST', mime: 'text/x-rst', isText: true, canEdit: true, isAsset: false },
  adoc: { kind: 'text', category: 'document', label: 'AsciiDoc', mime: 'text/asciidoc', isText: true, canEdit: true, isAsset: false },
  txt: { kind: 'text', category: 'document', label: 'Text', mime: 'text/plain', isText: true, canEdit: true, isAsset: false },
  log: { kind: 'text', category: 'code', label: 'Log', mime: 'text/plain', isText: true, canEdit: true, isAsset: false },

  // Rich Documents (Read-Only)
  pdf: { kind: 'pdf', category: 'document', label: 'PDF', mime: 'application/pdf', isText: false, canEdit: false, isAsset: true },
  docx: { kind: 'docx', category: 'document', label: 'Word', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', isText: false, canEdit: false, isAsset: true },
  xlsx: { kind: 'xlsx', category: 'data', label: 'Excel', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', isText: false, canEdit: false, isAsset: true },

  // Raster Images (Read-Only)
  png: { kind: 'image', category: 'media', label: 'PNG', mime: 'image/png', isText: false, canEdit: false, isAsset: true },
  jpg: { kind: 'image', category: 'media', label: 'JPEG', mime: 'image/jpeg', isText: false, canEdit: false, isAsset: true },
  jpeg: { kind: 'image', category: 'media', label: 'JPEG', mime: 'image/jpeg', isText: false, canEdit: false, isAsset: true },
  gif: { kind: 'image', category: 'media', label: 'GIF', mime: 'image/gif', isText: false, canEdit: false, isAsset: true },
  webp: { kind: 'image', category: 'media', label: 'WebP', mime: 'image/webp', isText: false, canEdit: false, isAsset: true },
  avif: { kind: 'image', category: 'media', label: 'AVIF', mime: 'image/avif', isText: false, canEdit: false, isAsset: true },
  bmp: { kind: 'image', category: 'media', label: 'BMP', mime: 'image/bmp', isText: false, canEdit: false, isAsset: true },
  ico: { kind: 'image', category: 'media', label: 'ICO', mime: 'image/x-icon', isText: false, canEdit: false, isAsset: true },

  // Audio (Read-Only)
  mp3: { kind: 'audio', category: 'media', label: 'MP3', mime: 'audio/mpeg', isText: false, canEdit: false, isAsset: true },
  wav: { kind: 'audio', category: 'media', label: 'WAV', mime: 'audio/wav', isText: false, canEdit: false, isAsset: true },
  ogg: { kind: 'audio', category: 'media', label: 'OGG', mime: 'audio/ogg', isText: false, canEdit: false, isAsset: true },
  m4a: { kind: 'audio', category: 'media', label: 'M4A', mime: 'audio/mp4', isText: false, canEdit: false, isAsset: true },
  flac: { kind: 'audio', category: 'media', label: 'FLAC', mime: 'audio/flac', isText: false, canEdit: false, isAsset: true },
  aac: { kind: 'audio', category: 'media', label: 'AAC', mime: 'audio/aac', isText: false, canEdit: false, isAsset: true },
  opus: { kind: 'audio', category: 'media', label: 'Opus', mime: 'audio/opus', isText: false, canEdit: false, isAsset: true },

  // Video (Read-Only)
  mp4: { kind: 'video', category: 'media', label: 'MP4', mime: 'video/mp4', isText: false, canEdit: false, isAsset: true },
  webm: { kind: 'video', category: 'media', label: 'WebM', mime: 'video/webm', isText: false, canEdit: false, isAsset: true },
  ogv: { kind: 'video', category: 'media', label: 'OGV', mime: 'video/ogg', isText: false, canEdit: false, isAsset: true },
  mov: { kind: 'video', category: 'media', label: 'MOV', mime: 'video/quicktime', isText: false, canEdit: false, isAsset: true },
  m4v: { kind: 'video', category: 'media', label: 'M4V', mime: 'video/mp4', isText: false, canEdit: false, isAsset: true },
};

const SPECIAL_NAMES: Record<string, FormatDef> = {
  dockerfile: EXT_MAP.dockerfile,
  makefile: { kind: 'code', category: 'code', label: 'Makefile', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'makefile' },
  jenkinsfile: { kind: 'code', category: 'code', label: 'Jenkinsfile', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'groovy' },
  procfile: { kind: 'code', category: 'code', label: 'Procfile', mime: 'text/plain', isText: true, canEdit: true, isAsset: false, hljsLang: 'yaml' },
  license: { kind: 'text', category: 'document', label: 'License', mime: 'text/plain', isText: true, canEdit: true, isAsset: false },
  changelog: { kind: 'text', category: 'document', label: 'Changelog', mime: 'text/plain', isText: true, canEdit: true, isAsset: false },
};

export function getFormat(filePath: string): FileFormat | null {
  const base = filePath.split('/').pop()?.split('\\').pop() ?? '';
  if (!base) return null;
  const lower = base.toLowerCase();
  if (lower in SPECIAL_NAMES) {
    return { ...SPECIAL_NAMES[lower], ext: lower };
  }
  const dot = lower.lastIndexOf('.');
  if (dot <= 0) return null;
  const ext = lower.slice(dot + 1);
  const def = EXT_MAP[ext];
  return def ? { ...def, ext } : null;
}

export const isSupportedFile = (path: string): boolean => getFormat(path) !== null;
export const isMarkdownFile = (path: string): boolean => getFormat(path)?.kind === 'markdown';
export const isTextFile = (path: string): boolean => getFormat(path)?.isText === true;
export const canEditFile = (path: string): boolean => getFormat(path)?.canEdit === true;
export const isBinaryFile = (path: string): boolean => {
  const fmt = getFormat(path);
  return fmt !== null && !fmt.isText;
};
export const isAssetServable = (path: string): boolean => getFormat(path)?.isAsset === true;
export const isSearchableFile = (path: string): boolean => isTextFile(path);

/** Strip `.md`/`.markdown` for cleaner reading titles; keep extensions on other formats (e.g. `config.json`). */
export function stripDisplayExtension(name: string): string {
  return name.replace(/\.(md|markdown)$/i, '');
}

export const SUPPORTED_ACCEPT_ATTR = [
  '.zip',
  'application/zip',
  ...Object.keys(EXT_MAP).map((ext) => `.${ext}`),
].join(',');
