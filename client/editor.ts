import { markdown } from '@codemirror/lang-markdown';
import { basicSetup, EditorView } from 'codemirror';
import { isImageFile } from './images';

export type EditorOptions = {
  onChange: () => void;
  /** Upload images and return markdown-ready paths relative to the file being edited. */
  uploadImages: (files: File[]) => Promise<{ src: string; alt: string }[]>;
  onError: (err: Error) => void;
};

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

  constructor(parent: HTMLElement, doc: string, opts: EditorOptions) {
    // Pasted or dropped images are uploaded and inserted as ![alt](images/…) at the cursor / drop point.
    const insertImages = (view: EditorView, files: File[], pos: number) => {
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
        markdown(),
        EditorView.lineWrapping,
        theme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) opts.onChange();
        }),
        EditorView.domEventHandlers({
          paste(event, view) {
            const files = [...(event.clipboardData?.files ?? [])].filter(isImageFile);
            if (files.length === 0) return false;
            event.preventDefault();
            insertImages(view, files, view.state.selection.main.head);
            return true;
          },
          drop(event, view) {
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

  destroy() {
    this.view.destroy();
  }
}
