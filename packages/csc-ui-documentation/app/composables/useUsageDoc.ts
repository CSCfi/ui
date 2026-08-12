// usage.md files come from the library's build output (dist/docs/<tag>/),
// aliased as #library-docs in nuxt.config.ts. They are bundled at build time,
// so the site never reads the filesystem at runtime.
const usageFiles = import.meta.glob('#library-docs/*/usage.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

export const useUsageDoc = (tag: string): string | null => {
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
export const usageWithoutIntro = (markdown: string | null): string | null => {
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
