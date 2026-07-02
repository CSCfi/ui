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
