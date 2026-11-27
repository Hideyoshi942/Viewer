import {
  canEditFile,
  getFormat,
  isSupportedFile,
  stripDisplayExtension,
  SUPPORTED_ACCEPT_ATTR,
  type FileFormat,
  type FormatCategory,
} from '../shared/formats';
import { type FileContent, type FsEvent, type TreeNode } from '../shared/types';
import './style.css';
import { renderChanges } from './changes';
import { CommandPalette, type PaletteCommand } from './command-palette';
import { ApiError, ConflictError, LocalApi, type DataSource } from './data';
import {
  canPickDirectory,
  DeviceFolderSource,
  forgetSnapshots,
  pickDirectory,
  recallSnapshots,
  rememberSnapshots,
  snapshotFromFiles,
  type Snapshot,
} from './device-folder';
import type { ContentEditor } from './editor';
import { renderSearchResults, renderToc } from './extras';
import { HostedSource } from './hosted';
import { iconEl } from './icons';
import { uploadImages } from './images';
import { fileHref, folderHref, parseFolderRoute, parseRoute } from './links';
import {
  AppearanceStudio,
  applyPrefs,
  loadPrefs,
  loadSidebarCollapsed,
  saveSidebarCollapsed,
  updateThemeColor,
} from './reader-prefs';
import { collectCategories, defaultFile, flattenFiles, Sidebar } from './sidebar';
import { renderFolderView } from './viewers/folder-view';
import { renderFileView, type ViewerHandle } from './viewers/index';

const hosted = import.meta.env.VITE_HOSTED
  ? new HostedSource({
      repo: import.meta.env.VITE_REPO ?? '',
      branch: import.meta.env.VITE_BRANCH || 'main',
      contentDir: import.meta.env.VITE_CONTENT_DIR ?? '',
      base: import.meta.env.BASE_URL,
    })
  : null;

const homeSource: DataSource = hosted ?? new LocalApi();
let ds: DataSource = homeSource;
let unsubscribe: (() => void) | undefined;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const layout = $<HTMLElement>('layout');
const content = $<HTMLElement>('content');
const breadcrumb = $<HTMLElement>('breadcrumb');
const formatBadge = $<HTMLElement>('format-badge');
const actions = $<HTMLElement>('actions');
const editorPane = $<HTMLElement>('editor-pane');
const filterInput = $<HTMLInputElement>('filter');
const formatFilters = $<HTMLElement>('format-filters');
const newFileButton = $<HTMLButtonElement>('new-file');
const conflictDialog = $<HTMLDialogElement>('conflict-dialog');
const toastEl = $<HTMLElement>('toast');
const banner = $<HTMLElement>('banner');
const toc = $<HTMLElement>('toc');
const tocToggle = $<HTMLButtonElement>('toc-toggle');
const searchResults = $<HTMLElement>('search-results');
const installButton = $<HTMLButtonElement>('install-app');
const changesDialog = $<HTMLDialogElement>('changes-dialog');
const readProgress = $<HTMLElement>('read-progress');
const focusToggle = $<HTMLButtonElement>('focus-toggle');
const focusExit = $<HTMLButtonElement>('focus-exit');

// Hydrate SVG icons into static shell buttons
document.querySelector('.brand-mark')?.append(iconEl('brand', 18));
document.querySelector('.search-icon')?.append(iconEl('search', 14));
$('open-folder').append(iconEl('openFolder', 15));
$('new-file').append(iconEl('plus', 15));
$('sidebar-collapse').append(iconEl('sidebar', 15));
$('sidebar-close').append(iconEl('close', 15));
$('menu-toggle').append(iconEl('sidebar', 16));
$('cmd-open-top').append(iconEl('search', 15));
$('focus-toggle').append(iconEl('focus', 15));
$('toc-toggle').append(iconEl('toc', 15));
$('open-folder-top').append(iconEl('openFolder', 15));
$('cmd-search-icon').append(iconEl('search', 16));
$('drop-overlay-icon').append(iconEl('upload', 40));

// Apply initial sidebar collapsed state
if (loadSidebarCollapsed()) layout.classList.add('sidebar-collapsed');

const sidebar = new Sidebar($('tree'));
let tree: TreeNode[] = [];
let current: FileContent | null = null;
let currentFormat: FileFormat | null = null;
let activeViewer: ViewerHandle | null = null;
let editor: ContentEditor | null = null;
type EditMode = 'visual' | 'source';
let editMode: EditMode = loadEditMode();
let carriedChanges = false;
let saving = false;
let loadToken = 0;
let editAfterLoad = '';
let conflictVersion = '';
let busy = false;
let recheckAfterBusy = false;
let activeCategory: FormatCategory | 'all' = 'all';

const RECENT_KEY = 'mdv.recent';

function recordRecent(path: string): void {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    const next = [path, ...prev.filter((p) => p !== path)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

const isDirty = () => editor !== null && (carriedChanges || editor.isChanged());
const assetUrl = (p: string) => ds.assetUrl(p);

const appearance = new AppearanceStudio($<HTMLButtonElement>('appearance-toggle'), loadPrefs(), () => {
  if (current && !editor && currentFormat?.kind === 'markdown') {
    void renderCurrentFile();
  }
});

function loadEditMode(): EditMode {
  try {
    return localStorage.getItem('mdv.editMode') === 'source' ? 'source' : 'visual';
  } catch {
    return 'visual';
  }
}

function saveEditMode(mode: EditMode) {
  try {
    localStorage.setItem('mdv.editMode', mode);
  } catch {
    // not persisted
  }
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
function toast(message: string, kind: 'info' | 'error' = 'info') {
  toastEl.textContent = message;
  toastEl.className = `toast ${kind}`;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), kind === 'error' ? 6000 : 3000);
}

function showMessage(title: string, detail = '') {
  activeViewer?.destroy?.();
  activeViewer = null;
  const box = document.createElement('div');
  box.className = 'message';
  const h = document.createElement('h2');
  h.textContent = title;
  const p = document.createElement('p');
  p.textContent = detail;
  box.append(h, p);
  content.replaceChildren(box);
}

function showBanner(message: string, buttons: HTMLButtonElement[] = []) {
  const text = document.createElement('span');
  text.textContent = message;
  const dismiss = button('Dismiss', hideBanner);
  banner.replaceChildren(text, ...buttons, dismiss);
  banner.hidden = false;
}

function hideBanner() {
  banner.hidden = true;
}

async function whileBusy<T>(fn: () => Promise<T>): Promise<T> {
  busy = true;
  try {
    return await fn();
  } finally {
    busy = false;
    if (recheckAfterBusy) {
      recheckAfterBusy = false;
      if (current) void checkCurrentOnDisk(current.path);
    }
  }
}

function button(
  label: string,
  onClick: () => void,
  opts: { kind?: 'primary' | 'danger'; className?: string; disabled?: boolean } = {},
) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.className = ['btn', opts.kind ?? '', opts.className ?? ''].join(' ').trim();
  b.disabled = opts.disabled ?? false;
  b.addEventListener('click', onClick);
  return b;
}

function renderBreadcrumb(path: string, isFolder = false) {
  const parts = path ? path.split('/') : [];
  const items: HTMLElement[] = [];

  const home = document.createElement('a');
  home.className = 'breadcrumb-link';
  home.href = folderHref('');
  home.textContent = 'Workspace';
  items.push(home);

  parts.forEach((part, i) => {
    const sep = document.createElement('span');
    sep.className = 'breadcrumb-sep';
    sep.textContent = '/';
    items.push(sep);

    const isLast = i === parts.length - 1;
    if (!isLast || isFolder) {
      const a = document.createElement('a');
      a.className = isLast ? 'breadcrumb-current' : 'breadcrumb-link';
      a.href = folderHref(parts.slice(0, i + 1).join('/'));
      a.textContent = part;
      items.push(a);
    } else {
      const span = document.createElement('span');
      span.className = 'breadcrumb-current';
      span.textContent = stripDisplayExtension(part);
      items.push(span);
    }
  });

  breadcrumb.replaceChildren(...items);
}

function setFormatBadge(fmt: FileFormat | null, text?: string) {
  if (!fmt) {
    formatBadge.hidden = true;
    return;
  }
  formatBadge.hidden = false;
  formatBadge.dataset.cat = fmt.category;
  formatBadge.textContent = text ?? fmt.label;
}

function renderFormatFilters() {
  const cats = collectCategories(tree);
  if (cats.length <= 1) {
    formatFilters.replaceChildren();
    return;
  }
  const labels: Record<FormatCategory | 'all', string> = {
    all: 'All',
    markdown: 'MD',
    code: 'Code',
    data: 'Data',
    document: 'Docs',
    media: 'Media',
  };
  const chips: HTMLButtonElement[] = [];
  for (const cat of ['all', ...cats] as const) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `fmt-chip${activeCategory === cat ? ' active' : ''}`;
    b.textContent = labels[cat];
    b.addEventListener('click', () => {
      activeCategory = cat;
      sidebar.setCategoryFilter(cat);
      renderFormatFilters();
    });
    chips.push(b);
  }
  formatFilters.replaceChildren(...chips);
}

function renderActions() {
  const items: HTMLElement[] = [];
  if (current && ds.canWrite) {
    if (editor) {
      const status = document.createElement('span');
      status.className = 'save-status';
      status.textContent = saving ? 'Saving…' : isDirty() ? 'Unsaved changes' : 'Saved';
      items.push(status);

      if (currentFormat?.kind === 'markdown') {
        items.push(button(editMode === 'visual' ? 'Markdown' : 'Visual', () => void switchEditMode()));
      }
      if (editMode === 'source' && hasLivePreview(currentFormat)) {
        items.push(button('Preview', () => layout.classList.toggle('show-preview'), { className: 'only-narrow' }));
      }
      items.push(
        button('Changes', showChanges, { disabled: !isDirty() }),
        button('Done', () => exitEdit()),
        button('Save', () => void save(), { kind: 'primary', disabled: saving || !isDirty() }),
      );
    } else {
      if (canEditFile(current.path)) {
        items.push(button('Edit', enterEdit, { kind: 'primary' }));
      }
      items.push(
        button('Rename', () => openRenameDialog()),
        button('Delete', () => openDeleteDialog(), { kind: 'danger' }),
      );
    }
  } else if (current && hosted && ds === hosted && hosted.config.repo && canEditFile(current.path)) {
    const link = document.createElement('a');
    link.className = 'btn';
    link.href = hosted.editUrl(current.path);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Edit on GitHub';
    items.push(link);
  }
  actions.replaceChildren(...items);
}

function hasLivePreview(fmt: FileFormat | null): boolean {
  if (!fmt) return false;
  return ['markdown', 'html', 'svg', 'json', 'yaml', 'csv'].includes(fmt.kind);
}

function scrollToAnchor(anchor: string) {
  const target = anchor ? document.getElementById(anchor) : null;
  if (target) target.scrollIntoView();
  else if (!editor) window.scrollTo(0, 0);
}

function syncTocState() {
  const hasToc = !toc.hidden && !editor;
  layout.classList.toggle('has-toc', hasToc);
  tocToggle.hidden = !hasToc;
  if (!hasToc) layout.classList.remove('toc-open');
}

// ---------- Viewing ----------

async function renderCurrentFile(anchor = '') {
  if (!current || !currentFormat) return;
  if (editor && editMode === 'visual') return;

  activeViewer?.destroy?.();
  activeViewer = null;

  const text = editor ? editor.value : current.content;
  const allFiles = flattenFiles(tree);
  const idx = allFiles.indexOf(current.path);
  const neighbors =
    !editor && idx >= 0
      ? { prev: idx > 0 ? allFiles[idx - 1] : null, next: idx < allFiles.length - 1 ? allFiles[idx + 1] : null }
      : undefined;

  activeViewer = await renderFileView(
    {
      container: content,
      path: current.path,
      format: currentFormat,
      ds,
      tree,
      textContent: text,
      size: current.size,
      onTocReady: () => {
        if (editor) toc.hidden = true;
        else renderToc(toc, content, current!.path);
        syncTocState();
      },
      onMetaText: (extra) => setFormatBadge(currentFormat, extra),
      onToast: toast,
    },
    neighbors,
  );

  const h1 = content.querySelector('h1')?.textContent;
  document.title = `${h1 || stripDisplayExtension(current.path.split('/').pop()!)} — Folio`;
  if (currentFormat.kind !== 'markdown' && currentFormat.kind !== 'docx') {
    toc.hidden = true;
    syncTocState();
  }
  scrollToAnchor(anchor);
}

async function refreshTree() {
  tree = await ds.listTree();
  sidebar.setTree(tree);
  renderFormatFilters();
}

async function route() {
  layout.classList.remove('nav-open', 'toc-open');

  const folderPath = parseFolderRoute(location.hash);
  if (folderPath !== null) {
    if (editor && !exitEdit()) {
      if (current) history.replaceState(null, '', fileHref(current.path));
      return;
    }
    activeViewer?.destroy?.();
    activeViewer = null;
    current = null;
    currentFormat = null;
    hideBanner();
    sidebar.setActive('');
    renderBreadcrumb(folderPath, true);
    setFormatBadge(null);
    toc.hidden = true;
    syncTocState();
    renderActions();
    renderFolderView(content, tree, folderPath, ds, showOpenDialog);
    document.title = `${folderPath || 'Workspace'} — Folio`;
    window.scrollTo(0, 0);
    return;
  }

  const parsed = parseRoute(location.hash);
  if (!parsed) return;

  if (current && parsed.path === current.path) {
    scrollToAnchor(parsed.anchor);
    return;
  }
  if (editor && !exitEdit()) {
    if (current) history.replaceState(null, '', fileHref(current.path));
    return;
  }

  const token = ++loadToken;
  current = null;
  currentFormat = getFormat(parsed.path);
  hideBanner();
  sidebar.setActive(parsed.path);
  renderBreadcrumb(parsed.path);
  setFormatBadge(currentFormat);
  renderActions();

  if (!currentFormat) {
    toc.hidden = true;
    syncTocState();
    showMessage('Unsupported file format', parsed.path);
    return;
  }

  recordRecent(parsed.path);

  try {
    if (currentFormat.isText) {
      const file = await ds.readFile(parsed.path);
      if (token !== loadToken) return;
      current = file;
      await renderCurrentFile(parsed.anchor);
      if (editAfterLoad === file.path) {
        editAfterLoad = '';
        enterEdit();
      }
    } else {
      const meta = await ds.readMeta?.(parsed.path);
      if (token !== loadToken) return;
      current = { path: parsed.path, content: '', version: '', size: meta?.size };
      await renderCurrentFile(parsed.anchor);
    }
  } catch (err) {
    if (token !== loadToken) return;
    toc.hidden = true;
    syncTocState();
    showMessage('Could not open file', `${parsed.path}: ${(err as Error).message}`);
  }
  renderActions();
}

// ---------- Editing ----------

let previewTimer: ReturnType<typeof setTimeout> | undefined;
let lastDirty = false;
let opening = false;

function onEditorChange() {
  if (editMode === 'source' && hasLivePreview(currentFormat)) {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => void renderCurrentFile(), 180);
  }
  if (isDirty() !== lastDirty) {
    lastDirty = isDirty();
    renderActions();
  }
}

async function openEditor(text: string) {
  if (!current || !currentFormat || opening) return;
  opening = true;
  try {
    activeViewer?.destroy?.();
    activeViewer = null;
    if (currentFormat.kind !== 'markdown') editMode = 'source';

    layout.classList.add('editing');
    toc.hidden = true;
    syncTocState();
    layout.classList.toggle('visual', editMode === 'visual');
    layout.classList.toggle('source', editMode === 'source');
    layout.classList.toggle('source-only', editMode === 'source' && !hasLivePreview(currentFormat));

    const filePath = current.path;
    const opts = {
      onChange: onEditorChange,
      uploadImages: (files: File[]) => uploadImages(ds, filePath, files),
      onError: (err: Error) => toast(`Image upload failed: ${err.message}`, 'error'),
      cmLang: currentFormat.cmLang,
      allowImageUpload: currentFormat.kind === 'markdown',
    };

    if (editMode === 'visual' && currentFormat.kind === 'markdown') {
      const { VisualEditor } = await import('./visual-editor');
      editor = await VisualEditor.create(editorPane, text, { ...opts, filePath, assetUrl });
    } else {
      const { SourceEditor } = await import('./editor');
      editor = await SourceEditor.create(editorPane, text, opts);
    }

    lastDirty = isDirty();
    if (editMode === 'source' && hasLivePreview(currentFormat)) {
      await renderCurrentFile();
    }
    if (editor.lossless === false) {
      showBanner(
        "Parts of this file use syntax Visual mode can't show exactly. Lines you don't edit are saved unchanged; to edit those parts, use Markdown.",
        [button('Edit in Markdown', () => void switchEditMode(false), { kind: 'primary' })],
      );
    }
    editor.focus();
  } catch (err) {
    layout.classList.remove('editing', 'visual', 'source', 'source-only');
    toast(`Could not open the editor: ${(err as Error).message}`, 'error');
  } finally {
    opening = false;
    renderActions();
  }
}

function enterEdit() {
  if (!current || editor || !ds.canWrite || !canEditFile(current.path)) return;
  carriedChanges = false;
  editMode = currentFormat?.kind === 'markdown' ? loadEditMode() : 'source';
  void openEditor(current.content);
}

async function switchEditMode(remember = true) {
  if (!editor || !current || currentFormat?.kind !== 'markdown') return;
  carriedChanges = isDirty();
  const text = carriedChanges ? editor.value : current.content;
  editor.destroy();
  editor = null;
  editMode = editMode === 'visual' ? 'source' : 'visual';
  if (remember) saveEditMode(editMode);
  hideBanner();
  layout.classList.remove('show-preview');
  await openEditor(text);
}

function exitEdit(force = false): boolean {
  if (!editor) return true;
  if (!force && isDirty() && !confirm('Discard unsaved changes?')) return false;
  clearTimeout(previewTimer);
  editor.destroy();
  editor = null;
  carriedChanges = false;
  editMode = loadEditMode();
  layout.classList.remove('editing', 'visual', 'source', 'source-only', 'show-preview');
  hideBanner();
  void renderCurrentFile();
  renderActions();
  return true;
}

async function save() {
  if (!editor || !current || saving || !isDirty()) return;
  saving = true;
  renderActions();
  const text = editor.value;
  try {
    const result = await whileBusy(() => ds.save(current!.path, text, current!.version));
    current = { ...current, content: text, version: result.version };
    editor?.markSaved(text);
    carriedChanges = false;
    hideBanner();
    toast(ds.savedHint ?? 'Saved');
  } catch (err) {
    if (err instanceof ConflictError) {
      conflictVersion = err.currentVersion;
      conflictDialog.returnValue = '';
      conflictDialog.showModal();
    } else {
      toast(`Save failed: ${(err as Error).message}`, 'error');
    }
  } finally {
    saving = false;
    lastDirty = isDirty();
    renderActions();
  }
}

async function reloadCurrent() {
  if (!current) return;
  try {
    current = await ds.readFile(current.path);
    editor?.setValue(current.content);
    carriedChanges = false;
    await renderCurrentFile();
  } catch (err) {
    toast(`Reload failed: ${(err as Error).message}`, 'error');
  }
  lastDirty = isDirty();
  renderActions();
}

function showChanges() {
  if (!editor || !current) return;
  const stats = renderChanges($('changes-body'), current.content, editor.value);
  $('changes-stats').textContent = `+${stats.added} −${stats.removed}`;
  changesDialog.returnValue = '';
  changesDialog.showModal();
}

changesDialog.addEventListener('close', () => {
  if (changesDialog.returnValue === 'save') void save();
  else editor?.focus();
});

conflictDialog.addEventListener('close', async () => {
  if (!current || !editor) return;
  switch (conflictDialog.returnValue) {
    case 'overwrite':
      current = { ...current, version: conflictVersion };
      await save();
      break;
    case 'copy':
      await navigator.clipboard.writeText(editor.value).catch(() => toast('Could not copy to clipboard', 'error'));
      await reloadCurrent();
      break;
    case 'reload':
      await reloadCurrent();
      break;
  }
});

// ---------- File Operations (Dialogs) ----------

const newFileDialog = $<HTMLDialogElement>('new-file-dialog');
const newFilePathInput = $<HTMLInputElement>('new-file-path');
const newFilePresets = $<HTMLElement>('new-file-presets');
const renameDialog = $<HTMLDialogElement>('rename-dialog');
const renamePathInput = $<HTMLInputElement>('rename-path');
const deleteDialog = $<HTMLDialogElement>('delete-dialog');

for (const ext of ['.md', '.txt', '.json', '.yaml', '.csv', '.html', '.ts', '.sql']) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'preset-chip';
  chip.textContent = ext;
  chip.addEventListener('click', () => {
    const val = newFilePathInput.value.trim() || 'untitled.md';
    newFilePathInput.value = val.replace(/\.[^./]+$/, '') + ext;
    newFilePathInput.focus();
  });
  newFilePresets.append(chip);
}

function starterContent(path: string): string {
  const fmt = getFormat(path);
  const title = stripDisplayExtension(path.split('/').pop()!);
  switch (fmt?.kind) {
    case 'markdown':
      return `# ${title}\n\n`;
    case 'json':
      return '{\n  \n}\n';
    case 'html':
      return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>${title}</title>\n</head>\n<body>\n  <h1>${title}</h1>\n</body>\n</html>\n`;
    case 'csv':
      return 'Name,Value\n';
    default:
      return '';
  }
}

function openNewFileDialog() {
  const dir = current?.path.includes('/') ? current.path.slice(0, current.path.lastIndexOf('/')) : '';
  newFilePathInput.value = dir ? `${dir}/untitled.md` : 'untitled.md';
  newFileDialog.returnValue = '';
  newFileDialog.showModal();
  newFilePathInput.focus();
}

newFileDialog.addEventListener('close', async () => {
  if (newFileDialog.returnValue !== 'create') return;
  const raw = newFilePathInput.value.trim().replace(/\\/g, '/').replace(/^\/+/, '');
  if (!raw) return;
  const path = isSupportedFile(raw) ? raw : `${raw}.md`;
  try {
    const result = await ds.create(path, starterContent(path));
    await refreshTree();
    editAfterLoad = result.path;
    location.hash = fileHref(result.path);
  } catch (err) {
    toast(`Could not create file: ${(err as Error).message}`, 'error');
  }
});

function openRenameDialog() {
  if (!current) return;
  renamePathInput.value = current.path;
  renameDialog.returnValue = '';
  renameDialog.showModal();
  renamePathInput.focus();
}

renameDialog.addEventListener('close', async () => {
  if (renameDialog.returnValue !== 'rename' || !current) return;
  const to = renamePathInput.value.trim().replace(/\\/g, '/').replace(/^\/+/, '');
  if (!to || to === current.path) return;
  try {
    const from = current.path;
    await whileBusy(async () => {
      const result = await ds.rename(from, to);
      current = null;
      await refreshTree();
      location.replace(fileHref(result.path));
    });
  } catch (err) {
    toast(`Could not rename: ${(err as Error).message}`, 'error');
  }
});

function openDeleteDialog() {
  if (!current) return;
  $('delete-message').textContent = `Delete "${current.path}"? ${ds.deleteHint}`;
  deleteDialog.returnValue = '';
  deleteDialog.showModal();
}

deleteDialog.addEventListener('close', async () => {
  if (deleteDialog.returnValue !== 'delete' || !current) return;
  try {
    const path = current.path;
    await whileBusy(async () => {
      await ds.remove(path);
      current = null;
      await refreshTree();
    });
    const next = defaultFile(tree);
    if (next) {
      location.replace(fileHref(next));
    } else {
      location.replace(folderHref(''));
    }
    toast('File deleted');
  } catch (err) {
    toast(`Could not delete: ${(err as Error).message}`, 'error');
  }
});

// Light-dismiss backdrop for all dialogs
for (const dlg of document.querySelectorAll<HTMLDialogElement>('dialog.dialog')) {
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close('cancel');
  });
}

// ---------- Live Sync ----------

let treeTimer: ReturnType<typeof setTimeout> | undefined;

function onFsEvent(event: FsEvent) {
  clearTimeout(treeTimer);
  treeTimer = setTimeout(() => void refreshTree().catch(() => {}), 200);
  if (current && event.path === current.path) void checkCurrentOnDisk(current.path);
}

async function checkCurrentOnDisk(path: string) {
  if (busy) {
    recheckAfterBusy = true;
    return;
  }
  if (!currentFormat?.isText) return;

  let file: FileContent;
  try {
    file = await ds.readFile(path);
  } catch (err) {
    if (current?.path !== path || !(err instanceof ApiError && err.status === 404)) return;
    if (editor) {
      showBanner('This file was deleted or moved outside Folio. Copy your changes before leaving.');
    } else {
      current = null;
      toc.hidden = true;
      syncTocState();
      showMessage('File removed', `${path} was deleted or moved outside Folio.`);
      renderActions();
    }
    return;
  }

  if (busy || current?.path !== path || file.version === current.version) return;

  if (!isDirty()) {
    const changed = file.content !== current.content;
    const scroll = window.scrollY;
    current = file;
    if (editor && changed) editor.setValue(file.content);
    await renderCurrentFile();
    window.scrollTo(0, scroll);
    lastDirty = isDirty();
    renderActions();
    if (changed) toast('Reloaded: the file changed on disk');
    return;
  }

  if (editor && file.content === editor.value) {
    current = file;
    editor.markSaved(file.content);
    carriedChanges = false;
    lastDirty = isDirty();
    renderActions();
    return;
  }

  showBanner('This file changed on disk while you were editing.', [
    button('Load theirs', () => {
      hideBanner();
      void reloadCurrent();
    }),
  ]);
}

// ---------- GitHub Account ----------

const account = $<HTMLElement>('account');
const connectDialog = $<HTMLDialogElement>('connect-dialog');
const connectToken = $<HTMLInputElement>('connect-token');
const connectError = $<HTMLElement>('connect-error');
const connectSubmit = $<HTMLButtonElement>('connect-submit');

function renderAccount() {
  sidebar.setRootRemover(ds instanceof DeviceFolderSource ? (name) => void closeOneFolder(name) : null);
  if (ds instanceof DeviceFolderSource) {
    const device = ds;
    const label = document.createElement('span');
    const folders = device.snapshots.length;
    label.textContent = `${device.name} · ${device.fileCount} files · read-only`;
    label.title = ['Opened from this device; nothing was uploaded', ...device.snapshots.map((s) => s.name)].join('\n');
    account.replaceChildren(
      label,
      button(folders > 1 ? 'Close all' : 'Close', () => void closeDeviceFolder(), { className: 'small' }),
    );
    account.hidden = false;
    return;
  }
  if (!hosted?.config.repo) {
    account.hidden = true;
    return;
  }
  account.hidden = false;
  const label = document.createElement('span');
  if (hosted.connected) {
    label.textContent = `Editing ${hosted.config.repo}`;
    account.replaceChildren(
      label,
      button('Disconnect', () => {
        if (isDirty() && !confirm('Discard unsaved changes?')) return;
        hosted.disconnect();
        location.reload();
      }, { className: 'small' }),
    );
  } else {
    account.replaceChildren(
      button('Connect GitHub to edit', () => {
        $('connect-repo').textContent = hosted.config.repo;
        connectError.hidden = true;
        connectToken.value = '';
        connectDialog.showModal();
      }, { className: 'small' }),
    );
  }
}

$('connect-form').addEventListener('submit', async (e) => {
  if ((e as SubmitEvent).submitter?.getAttribute('value') !== 'connect' || !hosted) return;
  e.preventDefault();
  const token = connectToken.value.trim();
  if (!token) return;
  connectSubmit.disabled = true;
  try {
    await hosted.connect(token);
    location.reload();
  } catch (err) {
    connectError.textContent = (err as Error).message;
    connectError.hidden = false;
  } finally {
    connectSubmit.disabled = false;
  }
});

// ---------- Switching Folders & Drag-and-Drop ----------

async function useSource(next: DataSource): Promise<boolean> {
  if (editor && !exitEdit()) return false;
  unsubscribe?.();
  if (ds instanceof DeviceFolderSource && ds !== next) ds.close();
  ds = next;
  unsubscribe = ds.subscribe?.(onFsEvent);
  current = null;
  hideBanner();
  filterInput.value = '';
  sidebar.setFilter('');
  activeCategory = 'all';
  sidebar.setCategoryFilter('all');
  searchResults.hidden = true;
  newFileButton.hidden = !ds.canWrite;
  renderAccount();
  await refreshTree();
  const first = defaultFile(tree);
  if (!first) {
    location.replace(folderHref(''));
    return true;
  }
  const href = fileHref(first);
  if (location.hash === href) await route();
  else location.replace(href);
  return true;
}

async function openSnapshot(snapshot: Snapshot | null) {
  if (!snapshot) return;
  if (!snapshot.files.some((f) => isSupportedFile(f.path))) {
    toast('No supported files found in what you picked.', 'error');
    return;
  }
  let source: DeviceFolderSource;
  let name: string;
  if (ds instanceof DeviceFolderSource) {
    source = ds;
    name = await source.add(snapshot);
    renderAccount();
    await refreshTree();
    const first = defaultFile(tree.filter((n) => n.path === name));
    if (first) location.hash = fileHref(first).slice(1);
  } else {
    source = await DeviceFolderSource.create([snapshot]);
    name = source.snapshots[0].name;
    if (!(await useSource(source))) return;
  }
  const remembered = await rememberSnapshots(source.snapshots);
  toast(
    remembered
      ? `Added “${name}”: ${snapshot.files.length} files. Nothing was uploaded.`
      : `Added “${name}”. It won't be remembered after you close this page.`,
  );
}

async function closeDeviceFolder() {
  if (await useSource(homeSource)) await forgetSnapshots();
}

async function closeOneFolder(name: string) {
  if (!(ds instanceof DeviceFolderSource)) return;
  const source = ds;
  if (source.snapshots.length <= 1) return closeDeviceFolder();
  source.removeFolder(name);
  renderAccount();
  await refreshTree();
  if (current?.path.startsWith(`${name}/`)) {
    current = null;
    const first = defaultFile(tree);
    if (first) location.replace(fileHref(first));
  }
  await rememberSnapshots(source.snapshots);
  toast(`Closed “${name}”.`);
}

const openDialog = $<HTMLDialogElement>('open-dialog');
const folderInput = $<HTMLInputElement>('folder-input');
const filesInput = $<HTMLInputElement>('files-input');
filesInput.accept = SUPPORTED_ACCEPT_ATTR;

function showOpenDialog() {
  layout.classList.remove('nav-open', 'toc-open');
  openDialog.showModal();
}

$('open-folder').addEventListener('click', showOpenDialog);
$('open-folder-top').addEventListener('click', showOpenDialog);

$('open-choose-folder').addEventListener('click', async () => {
  openDialog.close();
  if (canPickDirectory()) {
    try {
      await openSnapshot(await pickDirectory());
    } catch (err) {
      toast(`Could not read the folder: ${(err as Error).message}`, 'error');
    }
  } else {
    folderInput.click();
  }
});

$('open-choose-files').addEventListener('click', () => {
  openDialog.close();
  filesInput.click();
});

for (const input of [folderInput, filesInput]) {
  input.addEventListener('change', async () => {
    const files = [...(input.files ?? [])];
    input.value = '';
    if (files.length === 0) return;
    try {
      await openSnapshot(await snapshotFromFiles(files));
    } catch (err) {
      toast(`Could not read the files: ${(err as Error).message}`, 'error');
    }
  });
}

// Global Drag & Drop
const dropOverlay = $<HTMLElement>('drop-overlay');
let dragDepth = 0;

window.addEventListener('dragenter', (e) => {
  if (!e.dataTransfer?.types.includes('Files') || editor) return;
  e.preventDefault();
  dragDepth++;
  dropOverlay.hidden = false;
});
window.addEventListener('dragover', (e) => {
  if (!e.dataTransfer?.types.includes('Files') || editor) return;
  e.preventDefault();
});
window.addEventListener('dragleave', () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) dropOverlay.hidden = true;
});
window.addEventListener('drop', async (e) => {
  if (!e.dataTransfer?.files.length || editor) return;
  e.preventDefault();
  dragDepth = 0;
  dropOverlay.hidden = true;
  try {
    await openSnapshot(await snapshotFromFiles([...e.dataTransfer.files]));
  } catch (err) {
    toast(`Could not open dropped files: ${(err as Error).message}`, 'error');
  }
});

// ---------- Command Palette & Keyboard Shortcuts ----------

const palette = new CommandPalette(
  $<HTMLDialogElement>('command-dialog'),
  $<HTMLInputElement>('cmd-input'),
  $('cmd-list'),
  () => flattenFiles(tree),
  (): PaletteCommand[] => [
    { id: 'home', label: 'Workspace Overview', hint: 'Browse folder grid', icon: 'home', run: () => (location.hash = folderHref('')) },
    { id: 'open', label: 'Open local folder, .zip, or files…', icon: 'openFolder', run: showOpenDialog },
    { id: 'sidebar', label: 'Toggle Sidebar', hint: '[', icon: 'sidebar', run: toggleDesktopSidebar },
    { id: 'focus', label: 'Toggle Focus Mode', hint: 'F', icon: 'focus', run: toggleFocusMode },
    {
      id: 'theme-light',
      label: 'Theme: Atelier Light',
      icon: 'sun',
      run: () => {
        appearance.current.theme = 'light';
        applyPrefs(appearance.current);
      },
    },
    {
      id: 'theme-sepia',
      label: 'Theme: Archival Sepia',
      icon: 'book',
      run: () => {
        appearance.current.theme = 'sepia';
        applyPrefs(appearance.current);
      },
    },
    {
      id: 'theme-dark',
      label: 'Theme: Obsidian Dark',
      icon: 'moon',
      run: () => {
        appearance.current.theme = 'dark';
        applyPrefs(appearance.current);
      },
    },
    ...(ds.canWrite ? [{ id: 'new', label: 'Create New File…', icon: 'plus' as const, run: openNewFileDialog }] : []),
  ],
  (href) => {
    location.hash = href;
  },
  (q) => ds.search(q),
);

$('cmd-trigger').addEventListener('click', () => palette.open());
$('cmd-open-top').addEventListener('click', () => palette.open());

function toggleDesktopSidebar() {
  const collapsed = layout.classList.toggle('sidebar-collapsed');
  saveSidebarCollapsed(collapsed);
}

function toggleFocusMode() {
  const on = layout.classList.toggle('focus-mode');
  focusExit.hidden = !on;
}

$('sidebar-collapse').addEventListener('click', toggleDesktopSidebar);
focusToggle.addEventListener('click', toggleFocusMode);
focusExit.addEventListener('click', toggleFocusMode);

// Sidebar drag-resizer
const resizer = $('sidebar-resizer');
resizer.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  resizer.classList.add('is-resizing');
  const onMove = (ev: PointerEvent) => {
    const w = Math.max(220, Math.min(440, ev.clientX));
    document.documentElement.style.setProperty('--sidebar-w', `${w}px`);
  };
  const onUp = () => {
    resizer.classList.remove('is-resizing');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
});

// Reading progress rail
window.addEventListener(
  'scroll',
  () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    readProgress.style.transform = `scaleX(${pct})`;
  },
  { passive: true },
);

// ---------- Search & Mobile Navigation ----------

let searchTimer: ReturnType<typeof setTimeout> | undefined;
let searchToken = 0;

filterInput.addEventListener('input', () => {
  const query = filterInput.value;
  sidebar.setFilter(query);
  clearTimeout(searchTimer);
  const token = ++searchToken;
  if (query.trim().length < 2) {
    searchResults.hidden = true;
    return;
  }
  searchTimer = setTimeout(async () => {
    try {
      const hits = await ds.search(query);
      if (token === searchToken) renderSearchResults(searchResults, hits, query);
    } catch {
      if (token === searchToken) searchResults.hidden = true;
    }
  }, 250);
});

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  updateThemeColor();
  if (appearance.current.theme === 'auto' && current && !editor && currentFormat?.kind === 'markdown') {
    void renderCurrentFile();
  }
});

newFileButton.hidden = !ds.canWrite;
newFileButton.addEventListener('click', openNewFileDialog);

$('menu-toggle').addEventListener('click', () => {
  if (window.innerWidth > 800) {
    toggleDesktopSidebar();
    return;
  }
  layout.classList.remove('toc-open');
  layout.classList.toggle('nav-open');
});
$('sidebar-close').addEventListener('click', () => layout.classList.remove('nav-open'));
tocToggle.addEventListener('click', () => {
  layout.classList.remove('nav-open');
  layout.classList.toggle('toc-open');
});
$('backdrop').addEventListener('click', () => layout.classList.remove('nav-open', 'toc-open'));

$('tree').addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a.row.file')) layout.classList.remove('nav-open');
});
searchResults.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a.hit')) layout.classList.remove('nav-open');
});
toc.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('a') || target.closest('[data-close-toc]')) {
    layout.classList.remove('toc-open');
  }
});

// ---------- PWA ----------

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e as BeforeInstallPromptEvent;
  installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  await deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === 'accepted') {
    installButton.hidden = true;
    deferredInstallPrompt = null;
  }
});
window.addEventListener('appinstalled', () => {
  installButton.hidden = true;
  deferredInstallPrompt = null;
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}

window.addEventListener('hashchange', () => void route());
unsubscribe = ds.subscribe?.(onFsEvent);
renderAccount();

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    palette.open();
    return;
  }
  if (editor && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    void save();
    return;
  }
  if (e.key === 'Escape' && layout.classList.contains('focus-mode')) {
    toggleFocusMode();
    return;
  }
  const tag = (e.target as HTMLElement)?.tagName;
  if (editor || tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
  if (e.key === '[') toggleDesktopSidebar();
  else if (e.key.toLowerCase() === 'f') toggleFocusMode();
});

window.addEventListener('beforeunload', (e) => {
  if (isDirty()) e.preventDefault();
});

function treeHasFile(nodes: TreeNode[], path: string): boolean {
  return nodes.some((n) => (n.type === 'file' ? n.path === path : treeHasFile(n.children ?? [], path)));
}

async function start() {
  const remembered = await recallSnapshots();
  if (remembered.length) {
    try {
      ds = await DeviceFolderSource.create(remembered);
      unsubscribe?.();
      unsubscribe = undefined;
      newFileButton.hidden = true;
      renderAccount();
    } catch {
      ds = homeSource;
    }
  }
  try {
    await refreshTree();
    const isFolder = parseFolderRoute(location.hash) !== null;
    const requested = parseRoute(location.hash);
    if (!isFolder && (!requested || (remembered.length && !treeHasFile(tree, requested.path)))) {
      const first = defaultFile(tree);
      if (!first) {
        location.replace(folderHref(''));
      } else {
        location.replace(fileHref(first));
      }
    }
    await route();
  } catch (err) {
    showMessage('Could not load the folder', (err as Error).message);
  }
}

void start();
