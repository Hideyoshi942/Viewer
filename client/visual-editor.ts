import { defaultValueCtx, Editor, editorViewCtx, remarkStringifyOptionsCtx, rootCtx } from '@milkdown/kit/core';
import { clipboard } from '@milkdown/kit/plugin/clipboard';
import { history } from '@milkdown/kit/plugin/history';
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener';
import { upload, uploadConfig } from '@milkdown/kit/plugin/upload';
import {
  commonmark,
  createCodeBlockCommand,
  imageSchema,
  insertHrCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand,
  toggleStrongCommand,
  turnIntoTextCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand,
} from '@milkdown/kit/preset/commonmark';
import { gfm, insertTableCommand, remarkGFMPlugin, toggleStrikethroughCommand } from '@milkdown/kit/preset/gfm';
import { $view, callCommand, getMarkdown, insert, replaceAll } from '@milkdown/kit/utils';
import { frontMatterInner, joinFrontMatter, splitFrontMatter } from '../shared/frontmatter';
import { preserveUntouched } from '../shared/preserve';
import { survivesRoundTrip } from '../shared/roundtrip';
import type { ContentEditor, EditorOptions } from './editor';
import { pickImages } from './images';
import { isExternal, resolveRelative, safeDecode } from './links';

type Command = { key: unknown };

/**
 * WYSIWYG markdown editor (Milkdown): you edit the rendered page directly.
 * The document area uses the same `.markdown-body` styles as the viewer, so it looks identical.
 */
export class VisualEditor implements ContentEditor {
  /** What was last loaded/saved; `isChanged` compares against it. */
  private baseline = '';
  /** Kept out of the editor (it can't represent it) and re-attached verbatim. */
  private frontMatter = '';
  /** The file's body as loaded, and the editor's own serialisation of it right after loading. */
  private sourceBody = '';
  private loadedBody = '';
  /** False when opening the file here already changed its text (raw HTML, unsupported syntax…). */
  lossless = true;

  private constructor(
    private editor: Editor,
    private host: HTMLElement,
    private propertiesBox: HTMLElement,
    private opts: EditorOptions,
  ) {}

  static async create(
    parent: HTMLElement,
    doc: string,
    opts: EditorOptions & { filePath: string; assetUrl: (path: string) => string },
  ): Promise<VisualEditor> {
    const host = document.createElement('div');
    host.className = 'visual-editor';
    const toolbar = document.createElement('div');
    toolbar.className = 'visual-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    const body = document.createElement('div');
    body.className = 'markdown-body visual-body';
    const propertiesBox = document.createElement('details');
    propertiesBox.className = 'front-matter';
    body.append(propertiesBox);
    const editorRoot = document.createElement('div');
    body.append(editorRoot);
    host.append(toolbar, body);
    parent.append(host);

    const split = splitFrontMatter(doc);

    // Relative image paths are relative to the markdown file, like in the viewer.
    const resolveSrc = (src: string) => {
      if (!src || isExternal(src)) return src;
      const target = resolveRelative(opts.filePath, safeDecode(src.split(/[?#]/)[0]));
      return target === null ? src : opts.assetUrl(target);
    };
    const imageView = $view(imageSchema.node, () => (initial) => {
      const dom = document.createElement('img');
      const apply = (node: typeof initial) => {
        dom.src = resolveSrc(node.attrs.src);
        dom.alt = node.attrs.alt ?? '';
        dom.title = node.attrs.title ?? '';
      };
      apply(initial);
      return {
        dom,
        update: (node) => {
          if (node.type !== initial.type) return false;
          apply(node);
          return true;
        },
      };
    });

    const editor = await Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, editorRoot);
        ctx.set(defaultValueCtx, split.body);
        // Keep saved markdown close to how people usually write it, so diffs stay small.
        ctx.update(remarkStringifyOptionsCtx, (prev) => ({ ...prev, bullet: '-' as const, rule: '-' as const }));
        ctx.set(remarkGFMPlugin.options.key, { tablePipeAlign: false });
        ctx.get(listenerCtx).updated(() => opts.onChange());
        // Pasted / dropped images are uploaded next to the file and inserted as image nodes.
        ctx.update(uploadConfig.key, (prev) => ({
          ...prev,
          // Use the browser's caret at paste time: ProseMirror's own selection can lag a click
          // that happened just before the paste, which put images at the top of the document.
          getInsertPos: (event, innerCtx, fallback) => {
            if (!(event instanceof ClipboardEvent)) return fallback;
            const view = innerCtx.get(editorViewCtx);
            const sel = window.getSelection();
            if (!sel?.anchorNode || !view.dom.contains(sel.anchorNode)) return fallback;
            try {
              return view.posAtDOM(sel.anchorNode, sel.anchorOffset);
            } catch {
              return fallback;
            }
          },
          uploader: async (files, schema) => {
            try {
              const images = await opts.uploadImages([...files]);
              return images.flatMap(({ src, alt }) => schema.nodes.image.createAndFill({ src, alt }) ?? []);
            } catch (err) {
              opts.onError(err as Error);
              return [];
            }
          },
        }));
      })
      .use(commonmark)
      .use(gfm)
      .use(history)
      .use(listener)
      .use(clipboard)
      .use(upload)
      .use(imageView)
      .create();

    const instance = new VisualEditor(editor, host, propertiesBox, opts);
    instance.setFrontMatter(split.frontMatter);
    instance.rememberLoaded(split.body);
    instance.buildToolbar(toolbar);
    return instance;
  }

  private setFrontMatter(frontMatter: string) {
    this.frontMatter = frontMatter;
    this.propertiesBox.hidden = !frontMatter;
    const summary = document.createElement('summary');
    summary.textContent = 'Properties (edit in Markdown mode)';
    const pre = document.createElement('pre');
    pre.textContent = frontMatterInner(frontMatter);
    this.propertiesBox.replaceChildren(summary, pre);
  }

  private rememberLoaded(body: string) {
    this.sourceBody = body;
    this.loadedBody = this.bodyMarkdown();
    this.lossless = survivesRoundTrip(body, this.loadedBody);
    this.baseline = this.value;
  }

  private bodyMarkdown(): string {
    return this.editor.action(getMarkdown());
  }

  private run(command: Command, payload?: unknown) {
    this.editor.action(callCommand(command.key as never, payload as never));
    this.focus();
  }

  private async addImages() {
    const files = await pickImages();
    if (files.length === 0) return;
    try {
      for (const { src, alt } of await this.opts.uploadImages(files)) {
        this.editor.action(insert(`![${alt}](${src})`, true));
      }
      this.focus();
    } catch (err) {
      this.opts.onError(err as Error);
    }
  }

  private buildToolbar(toolbar: HTMLElement) {
    const groups: [string, string, () => void][][] = [
      [
        ['¶', 'Paragraph', () => this.run(turnIntoTextCommand)],
        ['H1', 'Heading 1', () => this.run(wrapInHeadingCommand, 1)],
        ['H2', 'Heading 2', () => this.run(wrapInHeadingCommand, 2)],
        ['H3', 'Heading 3', () => this.run(wrapInHeadingCommand, 3)],
      ],
      [
        ['B', 'Bold (Ctrl+B)', () => this.run(toggleStrongCommand)],
        ['I', 'Italic (Ctrl+I)', () => this.run(toggleEmphasisCommand)],
        ['S', 'Strikethrough', () => this.run(toggleStrikethroughCommand)],
        ['</>', 'Inline code', () => this.run(toggleInlineCodeCommand)],
        [
          '🔗',
          'Link',
          () => {
            const href = prompt('Link URL (or a relative path like ../other.md):');
            if (href) this.run(toggleLinkCommand, { href });
          },
        ],
      ],
      [
        ['•', 'Bullet list', () => this.run(wrapInBulletListCommand)],
        ['1.', 'Numbered list', () => this.run(wrapInOrderedListCommand)],
        ['❝', 'Quote', () => this.run(wrapInBlockquoteCommand)],
        ['{ }', 'Code block', () => this.run(createCodeBlockCommand)],
        ['▦', 'Table', () => this.run(insertTableCommand, { row: 3, col: 3 })],
        ['🖼', 'Image (or paste / drop one)', () => void this.addImages()],
        ['—', 'Divider', () => this.run(insertHrCommand)],
      ],
    ];

    for (const group of groups) {
      const wrap = document.createElement('div');
      wrap.className = 'tool-group';
      for (const [label, title, action] of group) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tool';
        b.textContent = label;
        b.title = title;
        b.setAttribute('aria-label', title);
        // Keep the text selection in the editor when clicking a tool.
        b.addEventListener('mousedown', (e) => e.preventDefault());
        b.addEventListener('click', action);
        wrap.append(b);
      }
      toolbar.append(wrap);
    }
  }

  /** The edits re-applied onto the original text: lines the user didn't touch stay byte-identical. */
  get value(): string {
    return joinFrontMatter(this.frontMatter, preserveUntouched(this.sourceBody, this.loadedBody, this.bodyMarkdown()));
  }

  setValue(text: string) {
    const { frontMatter, body } = splitFrontMatter(text);
    this.setFrontMatter(frontMatter);
    this.editor.action(replaceAll(body));
    this.rememberLoaded(body);
  }

  /** Merely opening a file never counts as a change: `value` is the original until something is edited. */
  isChanged() {
    return this.value !== this.baseline;
  }

  markSaved(savedText: string) {
    this.baseline = savedText;
  }

  focus() {
    (this.host.querySelector('.ProseMirror') as HTMLElement | null)?.focus();
  }

  destroy() {
    void this.editor.destroy();
    this.host.remove();
  }
}
