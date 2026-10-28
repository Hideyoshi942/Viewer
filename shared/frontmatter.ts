/**
 * Front matter: a YAML (`---`) or TOML (`+++`) block at the very top of a file, used by
 * Obsidian, Hugo, Jekyll and friends. Markdown renderers and the visual editor don't understand it,
 * so it is split off, shown/kept separately, and put back verbatim on save.
 */
// Blank lines after the closing fence belong to the front matter, so they survive the visual
// editor (which drops leading blank lines from the body).
const FRONT_MATTER = /^(---|\+\+\+)[ \t]*\n[\s\S]*?\n\1[ \t]*(?:\n|$)(?:[ \t]*\n)*/;

export function splitFrontMatter(text: string): { frontMatter: string; body: string } {
  const match = FRONT_MATTER.exec(text);
  if (!match) return { frontMatter: '', body: text };
  return { frontMatter: match[0], body: text.slice(match[0].length) };
}

export function joinFrontMatter(frontMatter: string, body: string): string {
  if (!frontMatter) return body;
  return frontMatter.endsWith('\n') ? frontMatter + body : `${frontMatter}\n${body}`;
}

/** The YAML/TOML inside the fences, for display. */
export function frontMatterInner(frontMatter: string): string {
  return frontMatter.replace(/^(---|\+\+\+)[ \t]*\n/, '').replace(/\n(---|\+\+\+)[ \t]*\s*$/, '');
}

/** `title:` from YAML front matter, if present (quotes stripped). */
export function frontMatterTitle(frontMatter: string): string {
  const m = /^title\s*[:=]\s*(.+)$/m.exec(frontMatterInner(frontMatter));
  return m ? m[1].trim().replace(/^(['"])(.*)\1$/, '$2') : '';
}
