# MD Viewer — Project Plan

**Status (2026-10-28):** Phases 1–5 plus the hardening in §9 built and tested (131 automated tests and browser checks at phone, tablet and desktop widths). Not yet deployed to a real GitHub repo. The GitHub API path was tested against a mock.

A local website that reads a folder of Markdown files (including nested subfolders), shows them as a navigable site, and lets the user edit and save files back to disk.

## 1. Goals

- Point the app at any root folder; it lists every `.md` file in a folder tree.
- Click a file → rendered Markdown (headings, tables, code highlighting, images, links between files).
- Edit a file in the browser and **save it back to disk**.
- Changes made outside the app (VS Code, git pull) show up without restarting.

Out of scope for v1: multi-user, login, cloud hosting, file-level git history.

## 2. Decisions (with rationale)

| Topic | Decision | Why |
|---|---|---|
| Backend | Node.js 20 + Express | Needs filesystem access; small, well-known stack |
| Frontend | Vite + vanilla TypeScript (no framework) | Only 3 views (tree, viewer, editor); a framework adds weight without benefit |
| Markdown render | `markdown-it` + `highlight.js` + `DOMPurify` | GFM tables/task lists, code highlighting, sanitized output |
| Editor | **Visual (default):** Milkdown WYSIWYG, edit the rendered page directly. **Markdown:** CodeMirror 6 + live preview, one click away | User asked to edit "as the preview", not raw text. Source mode stays for raw HTML/front matter. Visual saves re-apply only the edited lines onto the original (§9), so opening and saving never reformats untouched text |
| File watching | `chokidar` → push changes to the browser via Server-Sent Events | Simpler than WebSocket; one-way updates are enough |
| "Saving" meaning | Edit in browser → write to the `.md` file on disk | Interpreted "tích hợp lưu lại" as edit + save; also covers create/rename/delete |
| Safe writes | Write to temp file then rename (atomic); previous version kept in `.mdviewer/backup/`, deletes moved to `.mdviewer/trash/` | No half-written files if the process dies mid-save. One hidden folder instead of `.bak` files scattered next to notes |
| Conflict handling | Client sends the `version` it loaded (local: `mtime-size`, GitHub: blob sha); `409` if the file changed since | Prevents overwriting edits made in another editor. One opaque version string works for both backends |
| Network exposure | Bind to `127.0.0.1` by default | The app can write files; must not be open to the LAN unless the user opts in |
| Config | Folder as CLI arg (`npm start -- D:\notes`) or `ROOT_DIR` env var; `PORT`, `HOST` env vars | One folder per running instance; no `.env` loader needed for 3 settings |
| Deployment | Two modes sharing one client: **local** (Express, above) and **hosted** (static build deployed to GitHub Pages by GitHub Actions) | GitHub Actions only runs jobs; it cannot host a server that writes files. Pages hosts the static output |
| Saving in hosted mode | Commit straight to the repo via GitHub Contents API, using a fine-grained token (this repo only, `contents: write`) the user pastes once; kept in the browser's `sessionStorage` | No backend needed; every save is a git commit (free history); the push re-triggers the deploy |
| Data access in client | `DataSource` interface with 3 implementations: `LocalApi`, `StaticSite` (reads `tree.json` + raw files), `GitHubApi` (writes) | Viewer/editor code stays identical across modes |

## 3. Architecture

```
Browser (Vite SPA)
 ├─ Sidebar: folder tree (collapsible, search by filename)
 ├─ Viewer: rendered markdown + table of contents
 └─ Editor: CodeMirror | live preview, Save (Ctrl+S)
        │  REST + SSE
Express server
 ├─ /api/tree           GET     folder tree (only .md files + folders that contain them)
 ├─ /api/file?path=     GET     raw content + mtime
 ├─ /api/file?path=     PUT     save { content, baseMtime } → 200 | 409 conflict
 ├─ /api/file?path=     POST    create new file
 ├─ /api/file/rename    POST    { from, to }
 ├─ /api/file?path=     DELETE  move to .trash/ inside root (recoverable)
 ├─ /api/asset?path=    GET     images referenced by markdown
 └─ /api/events         GET     SSE stream: add / change / unlink
        │
Filesystem: ROOT_DIR/**/*.md
```

Every path from the client goes through one `resolveSafe(relPath)` helper: resolve against `ROOT_DIR`, reject if the result is outside it, reject non-`.md` for writes.

## 4. Project structure

```
md-viewer/
├─ server/
│  ├─ index.ts          # express app, static hosting of built client
│  ├─ config.ts         # ROOT_DIR, HOST, PORT
│  ├─ paths.ts          # resolveSafe()
│  ├─ tree.ts           # build folder tree
│  ├─ files.ts          # read / atomic write / create / rename / trash
│  └─ watcher.ts        # chokidar → SSE
├─ client/
│  ├─ index.html
│  ├─ main.ts           # router (#/path/to/file.md)
│  ├─ tree.ts           # sidebar
│  ├─ render.ts         # markdown-it + highlight + sanitize + link rewrite
│  └─ editor.ts         # CodeMirror, save, dirty-state, conflict dialog
├─ tests/
├─ package.json
└─ README.md
```

## 5. Phases & tasks

### Phase 1 — Read-only viewer (≈2 days)
1. Scaffold project (Node + Vite + TS, one `npm run dev` for both).
2. `resolveSafe()` + unit tests (`../`, absolute paths, symlinks out of root).
3. `/api/tree`: recursive scan, ignore `node_modules`, `.git`, hidden folders; sort folders first, then A–Z.
4. `/api/file` GET.
5. Sidebar tree with expand/collapse, remembered state, filename filter.
6. Renderer: GFM, code highlighting, sanitized HTML.
7. Relative links: `[x](../other.md)` navigates in-app; `![](img.png)` loads via `/api/asset`.
8. Hash routing so each file has a shareable/bookmarkable URL.

**Done when:** pointing at a real nested notes folder, every file opens and inter-file links/images work.

### Phase 2 — Edit & save (≈2 days)
1. Edit button → split view (CodeMirror | live preview).
2. `PUT /api/file` with atomic write + `.bak`.
3. `mtime` conflict check → dialog: *Overwrite* / *Reload theirs* / *Copy mine to clipboard*.
4. Dirty indicator, `Ctrl+S`, warn on leaving with unsaved changes.
5. Create file / new folder, rename, delete (→ `.trash/`).

**Done when:** edit → save → file on disk matches; editing the same file in VS Code then saving in the app shows the conflict dialog.

### Phase 3 — Live sync (≈1 day)
1. chokidar watcher → SSE `/api/events`.
2. Tree updates on add/delete; open file reloads on external change (or shows conflict banner if the user has unsaved edits).

### Phase 4 — GitHub Actions + Pages deploy (≈2 days)
1. Refactor client to the `DataSource` interface (`LocalApi` / `StaticSite` / `GitHubApi`).
2. `scripts/build-static.ts`: scan `CONTENT_DIR` (default `docs/`) → emit `dist/tree.json`, copy `.md` files and images into `dist/content/`, set mode flag `hosted`.
3. Workflow `.github/workflows/deploy.yml` (see §6): on push to `main` touching `docs/**` or app code → build → deploy to Pages.
4. Hosted save: "Connect GitHub" dialog for the token → `PUT /repos/{owner}/{repo}/contents/{path}` with the file's `sha`. GitHub returns `409` if the sha is stale → same conflict dialog as local mode. Create/rename/delete map to Contents API calls too.
5. After a save, show "Saved — site updates in ~1 min" (Pages redeploy), and update the open view immediately from the editor content.
6. Fallback for users without a token: "Edit on GitHub" link to `github.com/{owner}/{repo}/edit/main/{path}`.

**Done when:** pushing a new `.md` to `docs/` shows it on the Pages URL after the workflow finishes; editing a file on the Pages site creates a commit and the site rebuilds.

### Phase 5 — Polish (≈1–2 days)
1. Table of contents from headings; scroll spy.
2. Full-text search across all files (in-memory index, rebuilt on watcher events).
3. Light/dark theme.
4. Mermaid diagrams (lazy-loaded).
5. README: install, run, config, security note.

**Total: ~8–9 working days for one developer.**

## 6. GitHub Actions workflow

Repo setup: Settings → Pages → Source = **GitHub Actions**. Markdown lives in `docs/` of the same repo.

```yaml
# .github/workflows/deploy.yml
name: Deploy MD site
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true   # rapid saves → only the latest build deploys

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run build:static
        env:
          CONTENT_DIR: docs
          REPO: ${{ github.repository }}
          BASE_PATH: /${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Notes:
- Vite `base` must be `BASE_PATH` (Pages serves under `/<repo>/`); hash routing avoids 404s on refresh.
- Pages on a **private** repo needs a paid plan, and the site is public unless using Enterprise access control — don't put private notes there.
- The token never goes into the workflow or the repo; it's only held in the editing user's browser session.

## 7. Testing

- Unit: `resolveSafe`, tree builder, atomic write, conflict check (Vitest).
- API: supertest against a temp folder fixture with nested dirs, unicode filenames (Vietnamese diacritics), spaces in names.
- Manual: a real notes folder with 500+ files to check tree/search speed.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Path traversal → reading/writing files outside root | Single `resolveSafe()` used by every route + tests |
| XSS from markdown content | DOMPurify on rendered HTML |
| Lost edits | `mtime` conflict check, `.bak`, trash instead of hard delete |
| Large folders slow the tree | Ignore list; lazy-load subfolders if > 2,000 files |
| Windows path quirks (`\` vs `/`, case-insensitive) | Normalize to `/` in API, compare paths case-insensitively on win32 |
| GitHub token leaked via XSS on the Pages site | DOMPurify + strict CSP; token in `sessionStorage` (cleared on tab close); fine-grained, one repo, short expiry |
| Each save = one commit + one deploy (noisy history, ~1 min lag) | `concurrency` cancels stale builds; optional "batch save" later |

## 9. Hardening done after v1 (2026-10-28)

| Change | Why |
|---|---|
| Front matter split off, shown as "Properties", re-attached verbatim | The viewer rendered YAML as `<hr>` + `<h2>`, and the visual editor would rewrite it |
| Visual saves go through `preserveUntouched` (diff loaded vs current serialisation, re-apply onto the original) | Untouched lines stay byte-identical; no more `*`→`-` or table-pipe churn, and syntax the editor can't represent survives as long as that part isn't edited |
| Round-trip check on opening Visual mode → banner offering Markdown | Tells the user up front when a file has parts Visual mode would rewrite if edited |
| "Changes" dialog (line diff, Save from there) | See exactly what a save writes |
| Image paste / drop / picker → `images/` next to the note; never overwrites; on Pages, committed via the API and shown from raw.githubusercontent.com until the next deploy | Adding screenshots needed manual file copying |

## 10. Later (not v1)

- File history/diff view (GitHub commits API in hosted mode, git in local mode).
- OAuth login (GitHub App + small serverless token exchange) instead of pasting a token.
- Auth-protected hosting for private team notes (Cloudflare Pages + Access, or a self-hosted server).
