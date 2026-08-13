/**
 * Build-time syntax highlighting. Shiki and markdown-it are pulled
 * in via dynamic import so they land in a server-only chunk: these functions
 * run inside `useAsyncData` handlers, which execute during SSG prerender and
 * whose results are serialized into the static payload — the client reads the
 * highlighted HTML from the payload and never loads Shiki.
 *
 * Dual-theme output: each token carries both `--shiki-light` and `--shiki-dark`
 * CSS variables; site.css swaps them under the `data-theme` dark toggle, so a
 * single highlight pass serves both themes with no runtime cost.
 */
import type { Highlighter } from 'shiki';

const LANGS = [
  'vue',
  'tsx',
  'ts',
  'jsx',
  'js',
  'html',
  'bash',
  'json',
  'css',
  'md',
];

const THEMES = { dark: 'one-dark-pro', light: 'one-light' } as const;

let highlighterPromise: null | Promise<Highlighter> = null;

const getHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({ langs: LANGS, themes: Object.values(THEMES) }),
    );
  }

  return highlighterPromise;
};

const lang = (name: string) => (LANGS.includes(name) ? name : 'text');

/** Highlight a single code string to dual-theme HTML. */
export const highlightCode = async (
  code: string,
  language: string,
): Promise<string> => {
  const highlighter = await getHighlighter();

  return highlighter.codeToHtml(code, { lang: lang(language), themes: THEMES });
};

/** Render markdown with Shiki-highlighted fenced code blocks (HTML disabled). */
export const renderMarkdown = async (source: string): Promise<string> => {
  const [{ default: MarkdownIt }, highlighter] = await Promise.all([
    import('markdown-it'),
    getHighlighter(),
  ]);

  const md = new MarkdownIt({
    highlight: (code, language) =>
      highlighter.codeToHtml(code, { lang: lang(language), themes: THEMES }),
    html: false,
    linkify: true,
  });

  return md.render(source);
};
