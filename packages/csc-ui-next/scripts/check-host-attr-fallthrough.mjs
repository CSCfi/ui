import fs from 'node:fs';
import path from 'node:path';

/**
 * Guard against the host-attribute fallthrough a11y trap.
 *
 * In `defineCustomElement` SFCs, Vue mirrors every NON-prop attribute set on the
 * host element into `$attrs`, which then falls through onto the component's
 * template root (`[part=root]`). So when a component makes the host the real
 * a11y element by setting `role` / `tabindex` / `id` / `aria-*` on it
 * imperatively (`host.setAttribute(...)` in onMounted / watchEffect), those same
 * attributes ALSO land on the inner `[part=root]` div. Consequences seen:
 *   - a duplicate role="…"+tabindex="0" → a SECOND keyboard tab stop per control
 *     (c-tab, c-tag, c-list-item, c-navigation-button)
 *   - a duplicated id → broken aria-controls / aria-labelledby targeting
 *   - a nested duplicate landmark / live-region role
 *     (c-list, c-tab-item, c-toast)
 *
 * The fix is always `defineOptions({ inheritAttrs: false })`: the host keeps its
 * attributes (where `:host(...)` selectors match), and the inner root gets none.
 *
 * Rule: an SFC that sets `role` / `tabindex` / `id` / `aria-*` on the host MUST
 * declare `inheritAttrs: false`. Comments are stripped before scanning (newlines
 * preserved for line numbers), so a commented-out setAttribute — or a commented
 * inheritAttrs — is treated as absent.
 *
 * Exit 1 on any violation (the codebase is currently clean, so any hit is a
 * regression). `--report` downgrades to informational (exit 0).
 */

const ROOT = path.resolve(import.meta.dirname, '../src/components');
const REPORT_ONLY = process.argv.includes('--report');

// `host.setAttribute('role'|'tabindex'|'id'|'aria-*', …)` — the host binding is
// `const host = useHost()` by convention across these SFCs. Optional-chaining
// (`host?.setAttribute`) and whitespace variants are tolerated.
const HOST_ATTR = /\bhost\s*\??\.\s*setAttribute\(\s*(['"`])(role|tabindex|id|aria-[a-z-]+)\1/g;

const INHERIT_ATTRS_FALSE = /inheritAttrs\s*:\s*false/;

/** Blank out comments, preserving newlines so reported line numbers stay true. */
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
    // line comments to EOL, but not the // in http:// (preceded by ':')
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));

const vueFiles = fs
  .readdirSync(ROOT, { recursive: true })
  .filter((f) => typeof f === 'string' && f.endsWith('.vue'))
  .map((f) => path.join(ROOT, f))
  .sort();

let fileCount = 0;
let hitCount = 0;

for (const file of vueFiles) {
  const src = stripComments(fs.readFileSync(file, 'utf8'));

  // Only components that set a host a11y attribute are in scope.
  const lines = src.split('\n');
  const hits = [];

  lines.forEach((line, i) => {
    const attrs = [...line.matchAll(HOST_ATTR)].map((m) => m[2]);
    if (attrs.length) hits.push({ attrs: [...new Set(attrs)], line: i + 1 });
  });

  if (!hits.length) continue;

  // In scope — is it guarded?
  if (INHERIT_ATTRS_FALSE.test(src)) continue;

  fileCount += 1;
  const rel = path.relative(path.resolve(import.meta.dirname, '..'), file);
  console.log(`\n${rel}  (missing \`defineOptions({ inheritAttrs: false })\`)`);
  for (const { line, attrs } of hits) {
    hitCount += attrs.length;
    console.log(`  ${line}: host.setAttribute → ${attrs.join(', ')}`);
  }
}

console.log(
  `\n${hitCount} unguarded host-attr set${hitCount === 1 ? '' : 's'} in ${fileCount} of ${vueFiles.length} SFCs.`,
);

if (hitCount === 0) {
  console.log('✓ every SFC that sets host role/tabindex/id/aria has inheritAttrs:false.');
} else if (REPORT_ONLY) {
  console.log('(informational — omit --report to fail the build)');
} else {
  console.error(
    '✗ host-attribute fallthrough risk: the attributes above will also land on\n' +
      '  [part=root] (duplicate tab stop / role / id). Add\n' +
      '  `defineOptions({ inheritAttrs: false })` to each SFC listed.',
  );
  process.exit(1);
}
