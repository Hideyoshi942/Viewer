import { getFormat, stripDisplayExtension } from '../shared/formats';
import { fold } from '../shared/search';
import type { SearchHit } from '../shared/types';
import { formatIconName, iconEl, type IconName } from './icons';
import { fileHref } from './links';

export type PaletteCommand = {
  id: string;
  label: string;
  hint?: string;
  icon: IconName;
  run: () => void;
};

type PaletteItem = {
  title: string;
  sub: string;
  icon: IconName;
  cat?: string;
  run: () => void;
};

export class CommandPalette {
  private items: PaletteItem[] = [];
  private activeIdx = 0;
  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  private searchToken = 0;
  private contentHits: SearchHit[] = [];

  constructor(
    private dialog: HTMLDialogElement,
    private input: HTMLInputElement,
    private list: HTMLElement,
    private getFiles: () => string[],
    private getCommands: () => PaletteCommand[],
    private onNavigate: (href: string) => void,
    private searchContent?: (query: string) => Promise<SearchHit[]>,
  ) {
    this.input.addEventListener('input', () => {
      this.activeIdx = 0;
      this.contentHits = [];
      this.render();
      clearTimeout(this.searchTimer);
      const raw = this.input.value.trim();
      const token = ++this.searchToken;
      if (this.searchContent && raw.length >= 2 && !raw.startsWith('>')) {
        this.searchTimer = setTimeout(async () => {
          try {
            const hits = await this.searchContent!(raw);
            if (token === this.searchToken && this.dialog.open) {
              this.contentHits = hits.slice(0, 8);
              this.render();
            }
          } catch {
            // ignore
          }
        }, 200);
      }
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.items.length > 0) {
          this.activeIdx = (this.activeIdx + 1) % this.items.length;
          this.syncActive();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.items.length > 0) {
          this.activeIdx = (this.activeIdx - 1 + this.items.length) % this.items.length;
          this.syncActive();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = this.items[this.activeIdx];
        if (item) {
          this.close();
          item.run();
        }
      }
    });

    this.dialog.addEventListener('click', (e) => {
      if (e.target === this.dialog) this.close();
    });
  }

  open(initial = ''): void {
    this.input.value = initial;
    this.activeIdx = 0;
    this.render();
    this.dialog.showModal();
    this.input.focus();
  }

  close(): void {
    if (this.dialog.open) this.dialog.close();
  }

  private render(): void {
    const raw = this.input.value.trim();
    const isCmdMode = raw.startsWith('>');
    const q = fold(isCmdMode ? raw.slice(1).trim() : raw);

    const results: PaletteItem[] = [];

    if (isCmdMode || !q) {
      for (const cmd of this.getCommands()) {
        if (!q || fold(cmd.label).includes(q)) {
          results.push({
            title: cmd.label,
            sub: cmd.hint ?? 'Command',
            icon: cmd.icon,
            run: cmd.run,
          });
        }
      }
    }

    if (!isCmdMode) {
      const files = this.getFiles();
      for (const path of files) {
        if (!q || fold(path).includes(q)) {
          const fmt = getFormat(path);
          const name = path.split('/').pop()!;
          results.push({
            title: stripDisplayExtension(name),
            sub: path,
            icon: fmt ? formatIconName(fmt.kind) : 'doc',
            cat: fmt?.category,
            run: () => this.onNavigate(fileHref(path)),
          });
        }
        if (results.length >= 25) break;
      }

      for (const hit of this.contentHits) {
        const fmt = getFormat(hit.path);
        results.push({
          title: hit.title,
          sub: hit.snippet ? `${hit.path} — ${hit.snippet}` : hit.path,
          icon: fmt ? formatIconName(fmt.kind) : 'doc',
          cat: fmt?.category,
          run: () => this.onNavigate(fileHref(hit.path)),
        });
      }
    }

    this.items = results;
    if (results.length === 0) {
      this.list.innerHTML = '<div class="cmd-empty">No matching files or commands.</div>';
      return;
    }

    const frag = document.createDocumentFragment();
    results.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `cmd-item${idx === this.activeIdx ? ' active' : ''}`;

      const iconWrap = document.createElement('span');
      iconWrap.className = 'file-icon';
      if (item.cat) iconWrap.dataset.cat = item.cat;
      iconWrap.append(iconEl(item.icon, 16));

      const main = document.createElement('span');
      main.className = 'cmd-item-main';
      const title = document.createElement('span');
      title.className = 'cmd-item-title';
      title.textContent = item.title;
      const sub = document.createElement('span');
      sub.className = 'cmd-item-sub';
      sub.textContent = item.sub;
      main.append(title, sub);

      btn.append(iconWrap, main);
      btn.addEventListener('click', () => {
        this.close();
        item.run();
      });
      frag.append(btn);
    });
    this.list.replaceChildren(frag);
  }

  private syncActive(): void {
    const children = [...this.list.querySelectorAll<HTMLElement>('.cmd-item')];
    children.forEach((el, i) => el.classList.toggle('active', i === this.activeIdx));
    children[this.activeIdx]?.scrollIntoView({ block: 'nearest' });
  }
}
