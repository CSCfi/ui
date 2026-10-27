// usage.md files come from the library's build output (dist/docs/<tag>/),
// aliased as #library-docs in nuxt.config.ts. They are bundled at build time,
// so the site never reads the filesystem at runtime.
const usageFiles = import.meta.glob('#library-docs/*/usage.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

export const useUsageDoc = (tag: string): null | string => {
  const entry = Object.entries(usageFiles).find(([path]) =>
    path.endsWith(`/${tag}/usage.md`),
  );

  return entry?.[1] ?? null;
};

/**
 * The usage doc minus its first paragraph. The first paragraph is the
 * component's description — the analyzer lifts it into the manifest, and the
 * page renders it as the intro under the H1 — so the Usage section must not
 * repeat it. Returns null when nothing but that paragraph exists (a freshly
 * seeded usage doc), so the Usage section can be omitted entirely.
 */
export const usageWithoutIntro = (markdown: null | string): null | string => {
  if (!markdown) return null;

  const lines = markdown.split('\n');

  let i = 0;

  while (i < lines.length && !lines[i]?.trim()) i += 1;

  // A doc opening with a heading has no intro paragraph to strip.
  if (lines[i]?.trimStart().startsWith('#')) return markdown;

  while (i < lines.length && lines[i]?.trim()) i += 1;

  const rest = lines.slice(i).join('\n').trim();

  return rest || null;
};

/**
 * A composed child's usage doc as a section of its parent's Usage: the child
 * has no page, and its API reference shows only the first paragraph. Null
 * when that paragraph is all there is. The whole doc goes in, intro too,
 * under a heading naming the tag, its own sections one level down.
 */
export const childUsageSection = (tag: string): null | string => {
  const markdown = useUsageDoc(tag);

  if (!usageWithoutIntro(markdown)) return null;

  let fenced = false;

  const body = markdown!
    .trim()
    .split('\n')
    .map((line) => {
      if (line.trimStart().startsWith('```')) fenced = !fenced;

      return !fenced && /^#{2,5} /.test(line) ? `#${line}` : line;
    })
    .join('\n');

  return `## \`<${tag}>\`\n\n${body}`;
};
