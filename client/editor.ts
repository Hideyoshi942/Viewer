import type { Extension } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';
import type { FileFormat } from '../shared/formats';
import { isImageFile } from './images';

export type EditorOptions = {
  onChange: () => void;
  /** Upload images and return markdown-ready paths relative to the file being edited. */
  uploadImages: (files: File[]) => Promise<{ src: string; alt: string }[]>;
  onError: (err: Error) => void;
  cmLang?: FileFormat['cmLang'];
  allowImageUpload?: boolean;
};

async function loadLanguageExtension(cmLang?: FileFormat['cmLang']): Promise<Extension> {
  switch (cmLang) {
    case 'markdown': {
      const { markdown } = await import('@codemirror/lang-markdown');
      return markdown();
    }
    case 'javascript': {
      const { javascript } = await import('@codemirror/lang-javascript');
      return javascript({ typescript: true, jsx: true });
    }
    case 'json': {
      const { json } = await import('@codemirror/lang-json');
      return json();
    }
    case 'html': {
      const { html } = await import('@codemirror/lang-html');
      return html();
    }
    case 'css': {
      const { css } = await import('@codemirror/lang-css');
      return css();
    }
    case 'xml': {
      const { xml } = await import('@codemirror/lang-xml');
      return xml();
    }
    case 'yaml': {
      const { yaml } = await import('@codemirror/lang-yaml');
      return yaml();
    }
    case 'python': {
      const { python } = await import('@codemirror/lang-python');
      return python();
    }
    case 'sql': {
      const { sql } = await import('@codemirror/lang-sql');
      return sql();
    }
    default:
      return [];
  }
}

/** What main.ts needs from either editor (visual WYSIWYG or markdown source). */
export interface ContentEditor {
  /** Current document as markdown. */
  readonly value: string;
  /** Replace the document; the new text counts as unchanged. */
  setValue(text: string): void;
  /** True once the user has changed the document since load / the last markSaved(). */
  isChanged(): boolean;
  /** The given text (what was just saved) becomes the new "unchanged" state. */
  markSaved(savedText: string): void;
  focus(): void;
  destroy(): void;
  /** Insert text at the current cursor (source editor only). */
  insertText?(snippet: string): void;
  /** Visual editor only: false if loading the file already altered its text. */
  readonly lossless?: boolean;
}

// Colours come from the page's CSS variables, so the editor follows light/dark mode.
const theme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'var(--bg)', color: 'var(--text)', fontSize: '14px' },
  '.cm-scroller': { fontFamily: "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace" },
  '.cm-content': { caretColor: 'var(--text)', padding: '12px 0' },
  '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--text)' },
  '.cm-gutters': { backgroundColor: 'var(--bg-soft)', color: 'var(--text-muted)', borderRight: '1px solid var(--border)' },
  '.cm-activeLine': { backgroundColor: 'var(--bg-hover)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--bg-hover)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--accent-soft) !important',
  },
});

/** Plain-text markdown editor (CodeMirror), shown next to a live preview. */
export class SourceEditor implements ContentEditor {
  private view: EditorView;
  private baseline: string;

  static async create(parent: HTMLElement, doc: string, opts: EditorOptions): Promise<SourceEditor> {
    const langExt = await loadLanguageExtension(opts.cmLang);
    return new SourceEditor(parent, doc, opts, langExt);
  }

  constructor(parent: HTMLElement, doc: string, opts: EditorOptions, langExt: Extension = []) {
    const allowImages = opts.allowImageUpload ?? true;
    // Pasted or dropped images are uploaded and inserted as ![alt](images/…) at the cursor / drop point.
    const insertImages = (view: EditorView, files: File[], pos: number) => {
      if (!allowImages) return;
      opts
        .uploadImages(files)
        .then((images) => {
          // Put images on their own line(s) and keep the file's trailing newline.
          const doc = view.state.doc;
          const prefix = pos > 0 && doc.sliceString(pos - 1, pos) !== '\n' ? '\n' : '';
          const suffix = pos === doc.length || doc.sliceString(pos, pos + 1) !== '\n' ? '\n' : '';
          const text = prefix + images.map((i) => `![${i.alt}](${i.src})`).join('\n') + suffix;
          view.dispatch({ changes: { from: pos, insert: text }, selection: { anchor: pos + text.length } });
        })
        .catch(opts.onError);
    };

    this.view = new EditorView({
      doc,
      parent,
      extensions: [
        basicSetup,
        langExt,
        EditorView.lineWrapping,
        theme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) opts.onChange();
        }),
        EditorView.domEventHandlers({
          paste(event, view) {
            if (!allowImages) return false;
            const files = [...(event.clipboardData?.files ?? [])].filter(isImageFile);
            if (files.length === 0) return false;
            event.preventDefault();
            insertImages(view, files, view.state.selection.main.head);
            return true;
          },
          drop(event, view) {
            if (!allowImages) return false;
            const files = [...(event.dataTransfer?.files ?? [])].filter(isImageFile);
            if (files.length === 0) return false;
            event.preventDefault();
            const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }) ?? view.state.selection.main.head;
            insertImages(view, files, pos);
            return true;
          },
        }),
      ],
    });
    this.baseline = this.value;
  }

  get value(): string {
    return this.view.state.doc.toString();
  }

  setValue(text: string) {
    this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: text } });
    this.baseline = this.value;
  }

  isChanged() {
    return this.value !== this.baseline;
  }

  markSaved(savedText: string) {
    this.baseline = savedText;
  }

  focus() {
    this.view.focus();
  }

  insertText(snippet: string) {
    const pos = this.view.state.selection.main.head;
    const doc = this.view.state.doc;
    const prefix = pos > 0 && doc.sliceString(pos - 1, pos) !== '\n' ? '\n\n' : '';
    const suffix = pos === doc.length || doc.sliceString(pos, pos + 1) !== '\n' ? '\n' : '';
    const text = prefix + snippet + suffix;
    this.view.dispatch({ changes: { from: pos, insert: text }, selection: { anchor: pos + text.length } });
    this.view.focus();
  }

  destroy() {
    this.view.destroy();
  }
}
