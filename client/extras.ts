import { matchRanges } from '../shared/search';
import type { SearchHit } from '../shared/types';
import { fileHref } from './links';

// ---------- Search results (sidebar) ----------

/** `text` with every query term wrapped in <mark>, built as DOM nodes (never innerHTML). */
function highlighted(text: string, query: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  let pos = 0;
  for (const [start, end] of matchRanges(text, query)) {
    if (start < pos) continue; // overlapping terms
    frag.append(text.slice(pos, start));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(start, end);
    frag.append(mark);
    pos = end;
  }
  frag.append(text.slice(pos));
  return frag;
}

export function renderSearchResults(el: HTMLElement, hits: SearchHit[], query: string) {
  const heading = document.createElement('h3');
  heading.textContent = hits.length ? `In file contents (${hits.length})` : 'No matches in file contents';
  const list = document.createElement('ul');
  for (const hit of hits) {
    const a = document.createElement('a');
    a.className = 'hit';
    a.href = fileHref(hit.path);
    const title = document.createElement('span');
    title.className = 'hit-title';
    title.append(highlighted(hit.title, query));
    const path = document.createElement('span');
    path.className = 'hit-path';
    path.textContent = hit.path;
    a.append(title, path);
    if (hit.snippet) {
      const snippet = document.createElement('span');
      snippet.className = 'hit-snippet';
      snippet.append(highlighted(hit.snippet, query));
      a.append(snippet);
    }
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
  }
  el.replaceChildren(heading, list);
  el.hidden = false;
}

// ---------- Table of contents with scroll spy ----------

let spy: IntersectionObserver | null = null;

/** Build "On this page" from the rendered article's h2/h3. Hidden when there's too little to list. */
export function renderToc(toc: HTMLElement, article: HTMLElement, filePath: string) {
  spy?.disconnect();
  spy = null;
  const headings = [...article.querySelectorAll<HTMLElement>('h2[id], h3[id]')];
  if (headings.length < 2) {
    toc.hidden = true;
    toc.replaceChildren();
    return;
  }

  const title = document.createElement('p');
  title.className = 'toc-title';
  title.textContent = 'On this page';
  const list = document.createElement('ul');
  const links = new Map<Element, HTMLAnchorElement>();
  for (const h of headings) {
    const a = document.createElement('a');
    a.href = fileHref(filePath, h.id);
    a.textContent = h.textContent;
    a.className = h.tagName === 'H3' ? 'toc-sub' : '';
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
    links.set(h, a);
  }
  toc.replaceChildren(title, list);
  toc.hidden = false;

  // The active entry is the last heading that has scrolled past the top third of the screen.
  const passed = new Set<Element>();
  spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting || e.boundingClientRect.top < 0) passed.add(e.target);
        else passed.delete(e.target);
      }
      const current = headings.filter((h) => passed.has(h)).pop() ?? headings[0];
      for (const [h, a] of links) a.classList.toggle('active', h === current);
    },
    { rootMargin: '0px 0px -66% 0px' },
  );
  headings.forEach((h) => spy!.observe(h));
}

// ---------- Theme ----------

export type Theme = 'auto' | 'light' | 'dark';
const THEME_KEY = 'mdv.theme';
const THEME_ICON: Record<Theme, string> = { auto: '◐', light: '☀', dark: '☾' };

export function loadTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : 'auto';
  } catch {
    return 'auto';
  }
}

export function applyTheme(theme: Theme, button: HTMLElement) {
  if (theme === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  button.textContent = THEME_ICON[theme];
  button.title = `Theme: ${theme} (click to change)`;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // not persisted
  }
}

export function nextTheme(theme: Theme): Theme {
  return theme === 'auto' ? 'light' : theme === 'light' ? 'dark' : 'auto';
}

export function isDark(): boolean {
  const t = document.documentElement.dataset.theme;
  return t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
}
