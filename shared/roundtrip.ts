/**
 * What must survive a trip through the visual editor: the text itself, ignoring formatting the
 * serialiser is allowed to change (whitespace, bullet style, list numbering, escapes, table pipes).
 * If the signature of the original and of the re-serialised markdown differ, content was lost or
 * altered (typically raw HTML or syntax the editor doesn't support).
 */
export function contentSignature(markdown: string): string {
  return markdown
    .replace(/^[ \t]*\d+[.)][ \t]+/gm, '') // ordered-list numbers may be renumbered
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e: string) => ENTITIES[e] ?? '') // entity vs literal char
    .replace(/[\s*_\-|`#>~\\[\]():!+.=]/g, ''); // whitespace and markdown punctuation
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

export function survivesRoundTrip(original: string, reserialised: string): boolean {
  return contentSignature(original) === contentSignature(reserialised);
}
