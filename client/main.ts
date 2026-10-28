import { MARKDOWN_EXT, type FileContent, type FsEvent, type TreeNode } from '../shared/types';
import './style.css';
import { ApiError, ConflictError, LocalApi, type DataSource } from './data';
import type { ContentEditor } from './editor';
import { renderChanges } from './changes';
import { applyTheme, loadTheme, nextTheme, renderSearchResults, renderToc } from './extras';
import { uploadImages } from './images';
import { fileHref, parseRoute } from './links';
import { renderMarkdown } from './render';
import { HostedSource } from './hosted';
import { defaultFile, Sidebar } from './sidebar';

// The GitHub Pages build sets VITE_HOSTED; `npm run dev` / `npm start` use the local server.
const hosted = import.meta.env.VITE_HOSTED
  ? new HostedSource({
      repo: import.meta.env.VITE_REPO ?? '',
      branch: import.meta.env.VITE_BRANCH || 'main',
      contentDir: import.meta.env.VITE_CONTENT_DIR ?? '',
      base: import.meta.env.BASE_URL,
    })
  : null;
const ds: DataSource = hosted ?? new LocalApi();

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const layout = $<HTMLElement>('layout');
const content = $<HTMLElement>('content');
const breadcrumb = $<HTMLElement>('breadcrumb');
const actions = $<HTMLElement>('actions');
const editorPane = $<HTMLElement>('editor-pane');
const filterInput = $<HTMLInputElement>('filter');
const newFileButton = $<HTMLButtonElement>('new-file');
const conflictDialog = $<HTMLDialogElement>('conflict-dialog');
const toastEl = $<HTMLElement>('toast');
const banner = $<HTMLElement>('banner');
const toc = $<HTMLElement>('toc');
const searchResults = $<HTMLElement>('search-results');
const themeToggle = $<HTMLButtonElement>('theme-toggle');
const changesDialog = $<HTMLDialogElement>('changes-dialog');

let theme = loadTheme();
applyTheme(theme, themeToggle);

const sidebar = new Sidebar($('tree'));
let tree: TreeNode[] = [];
/** The open file as last loaded from / saved to the data source. */
let current: FileContent | null = null;
let editor: ContentEditor | null = null;
type EditMode = 'visual' | 'source';
let editMode: EditMode = loadEditMode();
/** Edits carried over when switching between visual and source mode (the new editor starts "unchanged"). */
let carriedChanges = false;
let saving = false;
let loadToken = 0;
/** Open this path straight in the editor once it loads (used after "New file"). */
let editAfterLoad = '';
let conflictVersion = '';
/** A save/rename/delete is running; live events for the open file wait until it finishes. */
let busy = false;
let recheckAfterBusy = false;

const isDirty = () => editor !== null && (carriedChanges || editor.isChanged());
const assetUrl = (p: string) => ds.assetUrl(p);

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
    // not persisted; fine
  }
}

// ---------- Small UI helpers ----------

let toastTimer: ReturnType<typeof setTimeout> | undefined;
function toast(message: string, kind: 'info' | 'error' = 'info') {
  toastEl.textContent = message;
  toastEl.className = `toast ${kind}`;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), kind === 'error' ? 6000 : 3000);
}

function showMessage(title: string, detail = '') {
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

/** Run a write operation with live-event checks for the open file paused. */
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

function button(label: string, onClick: () => void, opts: { kind?: 'primary' | 'danger'; className?: string; disabled?: boolean } = {}) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.className = ['btn', opts.kind ?? '', opts.className ?? ''].join(' ').trim();
  b.disabled = opts.disabled ?? false;
  b.addEventListener('click', onClick);
  return b;
}

function renderBreadcrumb(path: string) {
  breadcrumb.replaceChildren(
    ...path.split('/').map((part, i, all) => {
      const span = document.createElement('span');
      span.textContent = i === all.length - 1 ? part.replace(MARKDOWN_EXT, '') : part;
      return span;
    }),
  );
}

function renderActions() {
  const items: HTMLElement[] = [];
  if (current && ds.canWrite) {
    if (editor) {
      const status = document.createElement('span');
      status.className = 'save-status';
      status.textContent = saving ? 'Saving…' : isDirty() ? 'Unsaved changes' : 'Saved';
      items.push(
        status,
        button(editMode === 'visual' ? 'Markdown' : 'Visual', () => void switchEditMode()),
        ...(editMode === 'source'
          ? [button('Preview', () => layout.classList.toggle('show-preview'), { className: 'only-narrow' })]
          : []),
        button('Changes', showChanges, { disabled: !isDirty() }),
        button('Done', () => exitEdit()),
        button('Save', () => void save(), { kind: 'primary', disabled: saving || !isDirty() }),
      );
    } else {
      items.push(
        button('Edit', enterEdit, { kind: 'primary' }),
        button('Rename', () => void renameCurrent()),
        button('Delete', () => void deleteCurrent(), { kind: 'danger' }),
      );
    }
  } else if (current && hosted?.config.repo) {
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

/** Normalise what the user typed as a path: trim, `/` separators, no leading slash, `.md` suffix. */
function cleanPathInput(input: string): string {
  const p = input.trim().replace(/\\/g, '/').replace(/^\/+/, '');
  return MARKDOWN_EXT.test(p) ? p : `${p}.md`;
}

function scrollToAnchor(anchor: string) {
  const target = anchor ? document.getElementById(anchor) : null;
  if (target) target.scrollIntoView();
  else if (!editor) window.scrollTo(0, 0);
}

// ---------- Viewing ----------

function showCurrent(anchor = '') {
  if (!current) return;
  // In visual mode the editor itself is the rendered page; there's no separate preview.
  if (editor && editMode === 'visual') return;
  renderMarkdown(content, editor ? editor.value : current.content, current.path, assetUrl);
  const h1 = content.querySelector('h1')?.textContent;
  document.title = `${h1 || current.path.split('/').pop()} — MD Viewer`;
  if (editor) toc.hidden = true;
  else renderToc(toc, content, current.path);
  layout.classList.toggle('has-toc', !toc.hidden);
  scrollToAnchor(anchor);
}

async function refreshTree() {
  tree = await ds.listTree();
  sidebar.setTree(tree);
}

async function route() {
  layout.classList.remove('nav-open');
  const parsed = parseRoute(location.hash);
  if (!parsed) return;

  if (current && parsed.path === current.path) {
    scrollToAnchor(parsed.anchor);
    return;
  }
  if (editor && !exitEdit()) {
    // User chose to keep editing: put the URL back without adding a history entry.
    if (current) history.replaceState(null, '', fileHref(current.path));
    return;
  }

  const token = ++loadToken;
  current = null;
  hideBanner();
  sidebar.setActive(parsed.path);
  renderBreadcrumb(parsed.path);
  renderActions();

  try {
    const file = await ds.readFile(parsed.path);
    if (token !== loadToken) return;
    current = file;
    showCurrent(parsed.anchor);
    if (editAfterLoad === file.path) {
      editAfterLoad = '';
      enterEdit();
    }
  } catch (err) {
    if (token !== loadToken) return;
    showMessage('Could not open file', `${parsed.path}: ${(err as Error).message}`);
  }
  renderActions();
}

// ---------- Editing ----------

let previewTimer: ReturnType<typeof setTimeout> | undefined;
let lastDirty = false;

let opening = false;

function onEditorChange() {
  if (editMode === 'source') {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => showCurrent(), 150);
  }
  if (isDirty() !== lastDirty) {
    lastDirty = isDirty();
    renderActions();
  }
}

async function openEditor(text: string) {
  if (!current || opening) return;
  opening = true;
  try {
    layout.classList.add('editing');
    layout.classList.remove('has-toc');
    toc.hidden = true;
    layout.classList.toggle('visual', editMode === 'visual');
    layout.classList.toggle('source', editMode === 'source');
    // Editors are loaded on first use so people who only read don't download them.
    const filePath = current.path;
    const opts = {
      onChange: onEditorChange,
      uploadImages: (files: File[]) => uploadImages(ds, filePath, files),
      onError: (err: Error) => toast(`Image upload failed: ${err.message}`, 'error'),
    };
    if (editMode === 'visual') {
      const { VisualEditor } = await import('./visual-editor');
      editor = await VisualEditor.create(editorPane, text, { ...opts, filePath, assetUrl });
    } else {
      const { SourceEditor } = await import('./editor');
      editor = new SourceEditor(editorPane, text, opts);
    }
    lastDirty = isDirty();
    if (editMode === 'source') showCurrent();
    if (editor.lossless === false) {
      showBanner(
        "Parts of this file use syntax Visual mode can't show exactly. Lines you don't edit are saved unchanged; to edit those parts, use Markdown.",
        [button('Edit in Markdown', () => void switchEditMode(false), { kind: 'primary' })],
      );
    }
    editor.focus();
  } catch (err) {
    layout.classList.remove('editing', 'visual', 'source');
    toast(`Could not open the editor: ${(err as Error).message}`, 'error');
  } finally {
    opening = false;
    renderActions();
  }
}

function enterEdit() {
  if (!current || editor || !ds.canWrite) return;
  carriedChanges = false;
  void openEditor(current.content);
}

/**
 * Swap visual ⇄ markdown source, keeping whatever has been typed so far.
 * `remember: false` is for a one-off switch (the lossy-file warning) that shouldn't change the default.
 */
async function switchEditMode(remember = true) {
  if (!editor || !current) return;
  // Untouched → start from the file itself, not from the visual editor's re-serialised copy
  // (which may already have lost syntax it can't represent).
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

/** Leave edit mode. Returns false if the user chose to keep unsaved changes. */
function exitEdit(force = false): boolean {
  if (!editor) return true;
  if (!force && isDirty() && !confirm('Discard unsaved changes?')) return false;
  clearTimeout(previewTimer);
  editor.destroy();
  editor = null;
  carriedChanges = false;
  editMode = loadEditMode(); // undo a one-off switch
  layout.classList.remove('editing', 'visual', 'source', 'show-preview');
  hideBanner();
  showCurrent();
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
    // Anything typed while the request was in flight stays "unsaved".
    editor?.markSaved(text);
    carriedChanges = false;
    hideBanner();
    if (ds.savedHint) toast(ds.savedHint);
  } catch (err) {
    if (err instanceof ConflictError) {
      conflictVersion = err.currentVersion;
      // Esc closes without setting returnValue, so clear the previous choice first.
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

/** Replace what's open (and in the editor) with the latest version from the data source. */
async function reloadCurrent() {
  if (!current) return;
  try {
    current = await ds.readFile(current.path);
    editor?.setValue(current.content);
    carriedChanges = false;
    showCurrent();
  } catch (err) {
    toast(`Reload failed: ${(err as Error).message}`, 'error');
  }
  lastDirty = isDirty();
  renderActions();
}

/** Show exactly what saving would write, compared with the file as loaded. */
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

// ---------- File operations ----------

async function newFile() {
  const dir = current?.path.includes('/') ? current.path.slice(0, current.path.lastIndexOf('/')) : '';
  const input = prompt('New file path (use / for subfolders):', dir ? `${dir}/untitled.md` : 'untitled.md');
  if (!input?.trim()) return;
  const path = cleanPathInput(input);
  const title = path.split('/').pop()!.replace(MARKDOWN_EXT, '');
  try {
    const result = await ds.create(path, `# ${title}\n\n`);
    await refreshTree();
    editAfterLoad = result.path;
    location.hash = fileHref(result.path);
  } catch (err) {
    toast(`Could not create file: ${(err as Error).message}`, 'error');
  }
}

async function renameCurrent() {
  if (!current) return;
  const input = prompt('Rename or move to (use / for subfolders):', current.path);
  if (!input?.trim() || cleanPathInput(input) === current.path) return;
  try {
    const from = current.path;
    await whileBusy(async () => {
      const result = await ds.rename(from, cleanPathInput(input));
      current = null;
      await refreshTree();
      location.replace(fileHref(result.path));
    });
  } catch (err) {
    toast(`Could not rename: ${(err as Error).message}`, 'error');
  }
}

async function deleteCurrent() {
  if (!current) return;
  if (!confirm(`Delete "${current.path}"?\n\n${ds.deleteHint}`)) return;
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
      history.replaceState(null, '', location.pathname);
      breadcrumb.replaceChildren();
      showMessage('No markdown files', 'The folder is empty now.');
      renderActions();
    }
    toast('File deleted');
  } catch (err) {
    toast(`Could not delete: ${(err as Error).message}`, 'error');
  }
}

// ---------- Live sync (local server only) ----------

let treeTimer: ReturnType<typeof setTimeout> | undefined;

function onFsEvent(event: FsEvent) {
  // Several events usually arrive together (e.g. a git pull); refresh the tree once.
  clearTimeout(treeTimer);
  treeTimer = setTimeout(() => void refreshTree().catch(() => {}), 200);
  if (current && event.path === current.path) void checkCurrentOnDisk(current.path);
}

/** The open file may have changed outside the app: reload it, or warn if that would lose edits. */
async function checkCurrentOnDisk(path: string) {
  if (busy) {
    recheckAfterBusy = true;
    return;
  }

  let file: FileContent;
  try {
    file = await ds.readFile(path);
  } catch (err) {
    if (current?.path !== path || !(err instanceof ApiError && err.status === 404)) return;
    if (editor) {
      showBanner('This file was deleted or moved outside MD Viewer. Copy your changes before leaving.');
    } else {
      current = null;
      showMessage('File removed', `${path} was deleted or moved outside MD Viewer.`);
      renderActions();
    }
    return;
  }

  if (busy || current?.path !== path || file.version === current.version) return;

  if (!isDirty()) {
    // Nothing of ours would be lost: take the new version.
    const changed = file.content !== current.content;
    const scroll = window.scrollY;
    current = file;
    if (editor && changed) editor.setValue(file.content);
    showCurrent();
    window.scrollTo(0, scroll);
    lastDirty = isDirty();
    renderActions();
    if (changed) toast('Reloaded: the file changed on disk');
    return;
  }

  if (editor && file.content === editor.value) {
    // Disk already has exactly what's on screen (e.g. our own save landed late).
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

// ---------- GitHub connection (hosted mode only) ----------

const account = $<HTMLElement>('account');
const connectDialog = $<HTMLDialogElement>('connect-dialog');
const connectToken = $<HTMLInputElement>('connect-token');
const connectError = $<HTMLElement>('connect-error');
const connectSubmit = $<HTMLButtonElement>('connect-submit');

function renderAccount() {
  if (!hosted?.config.repo) return;
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
  e.preventDefault(); // keep the dialog open until the token checks out
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

// ---------- Wiring ----------

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

themeToggle.addEventListener('click', () => {
  theme = nextTheme(theme);
  applyTheme(theme, themeToggle);
  if (current && !editor) showCurrent(); // re-draw diagrams in the new colours
});
newFileButton.hidden = !ds.canWrite;
newFileButton.addEventListener('click', () => void newFile());

$('menu-toggle').addEventListener('click', () => layout.classList.toggle('nav-open'));
$('backdrop').addEventListener('click', () => layout.classList.remove('nav-open'));

window.addEventListener('hashchange', () => void route());
ds.subscribe?.(onFsEvent);
renderAccount();

window.addEventListener('keydown', (e) => {
  if (editor && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    void save();
  }
});

window.addEventListener('beforeunload', (e) => {
  if (isDirty()) e.preventDefault();
});

async function start() {
  try {
    await refreshTree();
    if (!parseRoute(location.hash)) {
      const first = defaultFile(tree);
      if (!first) {
        showMessage('No markdown files', 'The configured folder has no .md files yet.');
        return;
      }
      location.replace(fileHref(first));
    }
    await route();
  } catch (err) {
    showMessage('Could not load the folder', (err as Error).message);
  }
}

void start();
