import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: false,
  linkify: true,
});

export const renderMarkdown = (source: string): string => md.render(source);
