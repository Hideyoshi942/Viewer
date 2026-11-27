import { iconEl } from './icons';

export type Theme = 'auto' | 'light' | 'dark' | 'sepia';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type ReadingWidth = 'narrow' | 'standard' | 'wide';

export type ReaderPrefs = {
  theme: Theme;
  font: FontFamily;
  fontSize: FontSize;
  width: ReadingWidth;
};

const KEYS = {
  theme: 'mdv.theme',
  font: 'mdv.font',
  fontSize: 'mdv.fontSize',
  width: 'mdv.width',
  sidebarCollapsed: 'mdv.sidebarCollapsed',
};

function readKey<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const val = localStorage.getItem(key) as T | null;
    return val && allowed.includes(val) ? val : fallback;
  } catch {
    return fallback;
  }
}

function writeKey(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable
  }
}

export function loadPrefs(): ReaderPrefs {
  return {
    theme: readKey(KEYS.theme, ['auto', 'light', 'dark', 'sepia'], 'auto'),
    font: readKey(KEYS.font, ['sans', 'serif', 'mono'], 'sans'),
    fontSize: readKey(KEYS.fontSize, ['sm', 'md', 'lg', 'xl'], 'md'),
    width: readKey(KEYS.width, ['narrow', 'standard', 'wide'], 'standard'),
  };
}

export function loadSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(KEYS.sidebarCollapsed) === '1';
  } catch {
    return false;
  }
}

export function saveSidebarCollapsed(collapsed: boolean): void {
  writeKey(KEYS.sidebarCollapsed, collapsed ? '1' : '0');
}

export function isDarkTheme(): boolean {
  const t = document.documentElement.dataset.theme;
  return t === 'dark' || (t !== 'light' && t !== 'sepia' && matchMedia('(prefers-color-scheme: dark)').matches);
}

export function updateThemeColor(): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) return;
  const t = document.documentElement.dataset.theme;
  if (t === 'sepia') meta.content = '#f6efe2';
  else if (isDarkTheme()) meta.content = '#0f1115';
  else meta.content = '#fbfbfa';
}

export function applyPrefs(prefs: ReaderPrefs): void {
  const root = document.documentElement;
  if (prefs.theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = prefs.theme;
  root.dataset.font = prefs.font;
  root.dataset.fontSize = prefs.fontSize;
  root.dataset.width = prefs.width;
  updateThemeColor();
  writeKey(KEYS.theme, prefs.theme);
  writeKey(KEYS.font, prefs.font);
  writeKey(KEYS.fontSize, prefs.fontSize);
  writeKey(KEYS.width, prefs.width);
}

export class AppearanceStudio {
  private popover: HTMLElement | null = null;
  private onThemeChange?: () => void;

  constructor(
    private trigger: HTMLButtonElement,
    private prefs: ReaderPrefs,
    onThemeChange?: () => void,
  ) {
    this.onThemeChange = onThemeChange;
    applyPrefs(this.prefs);
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.popover) this.close();
      else this.open();
    });
  }

  get current(): ReaderPrefs {
    return this.prefs;
  }

  private open(): void {
    this.close();
    const pop = document.createElement('div');
    pop.className = 'appearance-popover';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Reading appearance');

    const makeSection = <T extends string>(
      title: string,
      options: { value: T; label: string; icon?: Parameters<typeof iconEl>[0] }[],
      active: T,
      onPick: (val: T) => void,
    ) => {
      const sec = document.createElement('div');
      sec.className = 'ap-section';
      const lbl = document.createElement('div');
      lbl.className = 'ap-label';
      lbl.textContent = title;
      const row = document.createElement('div');
      row.className = 'ap-segmented';
      for (const opt of options) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `ap-opt${opt.value === active ? ' active' : ''}`;
        if (opt.icon) b.append(iconEl(opt.icon, 14));
        const span = document.createElement('span');
        span.textContent = opt.label;
        b.append(span);
        b.addEventListener('click', () => {
          row.querySelectorAll('.ap-opt').forEach((el) => el.classList.remove('active'));
          b.classList.add('active');
          onPick(opt.value);
        });
        row.append(b);
      }
      sec.append(lbl, row);
      return sec;
    };

    pop.append(
      makeSection<Theme>(
        'Theme',
        [
          { value: 'auto', label: 'Auto', icon: 'contrast' },
          { value: 'light', label: 'Light', icon: 'sun' },
          { value: 'sepia', label: 'Sepia', icon: 'book' },
          { value: 'dark', label: 'Dark', icon: 'moon' },
        ],
        this.prefs.theme,
        (v) => {
          const wasDark = isDarkTheme();
          this.prefs.theme = v;
          applyPrefs(this.prefs);
          if (wasDark !== isDarkTheme() || v === 'sepia' || v === 'light') {
            this.onThemeChange?.();
          }
        },
      ),
      makeSection<FontFamily>(
        'Typeface',
        [
          { value: 'sans', label: 'Sans' },
          { value: 'serif', label: 'Serif' },
          { value: 'mono', label: 'Mono' },
        ],
        this.prefs.font,
        (v) => {
          this.prefs.font = v;
          applyPrefs(this.prefs);
        },
      ),
      makeSection<FontSize>(
        'Text Size',
        [
          { value: 'sm', label: 'S' },
          { value: 'md', label: 'M' },
          { value: 'lg', label: 'L' },
          { value: 'xl', label: 'XL' },
        ],
        this.prefs.fontSize,
        (v) => {
          this.prefs.fontSize = v;
          applyPrefs(this.prefs);
        },
      ),
      makeSection<ReadingWidth>(
        'Page Width',
        [
          { value: 'narrow', label: 'Narrow' },
          { value: 'standard', label: 'Standard' },
          { value: 'wide', label: 'Wide' },
        ],
        this.prefs.width,
        (v) => {
          this.prefs.width = v;
          applyPrefs(this.prefs);
        },
      ),
    );

    document.body.append(pop);
    const rect = this.trigger.getBoundingClientRect();
    const popWidth = Math.min(300, window.innerWidth - 24);
    pop.style.width = `${popWidth}px`;
    const left = Math.max(12, Math.min(window.innerWidth - popWidth - 12, rect.right - popWidth));
    pop.style.top = `${Math.round(rect.bottom + 8)}px`;
    pop.style.left = `${Math.round(left)}px`;

    this.popover = pop;
    this.trigger.setAttribute('aria-expanded', 'true');
    window.addEventListener('pointerdown', this.onOutside);
    window.addEventListener('keydown', this.onKey);
  }

  private onOutside = (e: PointerEvent) => {
    const t = e.target as Node;
    if (this.popover && !this.popover.contains(t) && !this.trigger.contains(t)) {
      this.close();
    }
  };

  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close();
  };

  close(): void {
    if (!this.popover) return;
    this.popover.remove();
    this.popover = null;
    this.trigger.setAttribute('aria-expanded', 'false');
    window.removeEventListener('pointerdown', this.onOutside);
    window.removeEventListener('keydown', this.onKey);
  }
}
