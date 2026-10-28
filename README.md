# MD Viewer

Browse a folder of Markdown files (with nested subfolders) as a website, and edit them in place. Runs locally against a folder on disk, or as a GitHub Pages site that commits edits back to the repo.

See [PLAN.md](PLAN.md) for the design decisions.

## Features

- **Sidebar tree** of every `.md` file at any depth, natural sort, remembered open/closed folders.
- **Rendered pages:** GFM tables and task lists, code highlighting, images next to the markdown, links between files (`../other.md#heading`), Mermaid diagrams, a table of contents on wide screens.
- **Search** across file names and file contents. Accents don't matter: `huong dan` finds `Hướng dẫn`.
- **Edit in place (Visual):** click **Edit** and type straight into the rendered page, with a toolbar for headings, lists, tables, links, images, and so on. **Markdown** switches to the raw text with a live preview. `Ctrl+S` saves.
- **Only your edits change the file:** lines you didn't touch are written back byte-for-byte, even in Visual mode. **Changes** shows the exact diff before you save. Front matter (`---` YAML / `+++` TOML) is shown as "Properties" and kept verbatim. If a file uses syntax Visual mode can't show (e.g. reference-style links), a banner offers Markdown mode for those parts.
- **Images:** paste, drag-and-drop, or 🖼 in the toolbar. The image is saved to an `images/` folder next to the note (never overwriting) and linked relatively.
- **Safe saving:** conflict check (someone else changed the file → overwrite / load theirs / copy yours), atomic writes, last version kept in `.mdviewer/backup/`, deletes go to `.mdviewer/trash/`, CRLF and BOM preserved.
- **Live reload:** changes made outside the app (VS Code, `git pull`) show up straight away.
- Light/dark/auto theme, works on phones.

## Run locally

Requires Node 20+.

```bash
npm install
npm run dev                      # shows the sample ./docs folder
npm run dev -- "D:\my\notes"     # shows your own folder
```

Open http://127.0.0.1:4000.

Production-style run (no Vite dev server):

```bash
npm run build
npm start -- "D:\my\notes"
```

| Setting | How | Default |
|---|---|---|
| Folder to show | first CLI argument, or `ROOT_DIR` env var | `./docs` |
| Port | `PORT` env var | `4000` |
| Host | `HOST` env var | `127.0.0.1` |

Keep `HOST` on `127.0.0.1`. Anyone who can reach the port can edit and delete files in the folder.

## Deploy to GitHub Pages

1. Push this project to a GitHub repo, with your markdown in `docs/`.
2. In the repo, go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. Push to `main`. `.github/workflows/deploy.yml` tests, builds, and publishes to `https://<user>.github.io/<repo>/`.

**Editing on the published site:** click **Connect GitHub to edit** at the bottom of the sidebar. Paste a [fine-grained token](https://github.com/settings/personal-access-tokens/new) limited to that one repo with **Contents: Read and write**. The token is kept only in that browser tab (`sessionStorage`). Each save becomes a commit, and the site rebuilds about a minute later. Without a token, every page still has an **Edit on GitHub** link.

Things to know:
- Pages sites are public. Don't publish private notes. Pages on a private repo also needs a paid plan.
- A rename on Pages is two commits (create + delete), because GitHub's contents API has no rename.
- Search on the Pages site uses the index built at deploy time, so it can lag the newest commits by a minute.

Build the Pages version locally:

```bash
CONTENT_DIR=docs BASE_PATH=/my-repo/ REPO=me/my-repo npm run build:static   # → dist/site
```

## Develop

```bash
npm test          # vitest: path safety, API, saving/conflicts, live events, search, GitHub mode
npm run typecheck
```

| Folder | What's in it |
|---|---|
| `server/` | Express API: tree, read/save/create/rename/trash, search, SSE live events, file watcher |
| `client/` | The single-page app: viewer, visual + source editors, sidebar, data sources (`LocalApi`, `HostedSource`) |
| `shared/` | Types, tree building and search used by both sides |
| `scripts/build-static.ts` | GitHub Pages build |
