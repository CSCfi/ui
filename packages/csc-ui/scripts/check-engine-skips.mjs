import fs from 'node:fs';
import path from 'node:path';

/**
 * Guard for **Chromium-only specs** (ADR-0077). Behaviour specs run on
 * Chromium, Firefox and WebKit in CI; a spec may skip Firefox and WebKit only
 * through the harness's `chromiumOnly(reason)`, for test tooling only Chromium
 * has. Lists every use with its reason, and fails on:
 *
 *   - a `chromiumOnly` whose reason is not a non-empty string literal;
 *   - a `chromiumOnly` in a conformance suite, which never skips;
 *   - any other engine switch in a browser spec or the test support code
 *     (`server.browser`, `navigator.userAgent`) outside the harness.
 *
 * Visual-only tests skip through `VISUAL_BASELINES` (Chromium on Linux) and
 * are not engine skips: no baseline is compared on another engine.
 */

const packageRoot = path.resolve(import.meta.dirname, '..');

const srcRoot = path.join(packageRoot, 'src');

const HARNESS = 'src/test/harness.ts';

const CONFORMANCE = 'src/test/conformance/';

const ENGINE_SWITCH = /\bserver\.browser\b|\bnavigator\.userAgent\b/g;

const USE = /\bchromiumOnly\(\s*(?:'([^'\n]*)'|"([^"\n]*)"|`([^`$]*)`)?/g;

// Browser specs and the test support code. Visual baselines sit in
// `__screenshots__/<spec file>/` directories, hence the file check.
const files = fs
  .readdirSync(srcRoot, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
  .map((entry) =>
    path.relative(packageRoot, path.join(entry.parentPath, entry.name)),
  )
  .map((file) => file.split(path.sep).join('/'))
  .filter(
    (file) =>
      file !== HARNESS &&
      ((file.endsWith('.spec.ts') && !file.endsWith('.node.spec.ts')) ||
        file.startsWith('src/test/')),
  )
  .sort();

const lineOf = (src, index) => src.slice(0, index).split('\n').length;

const uses = [];

const errors = [];

for (const file of files) {
  const src = fs.readFileSync(path.join(packageRoot, file), 'utf8');

  for (const match of src.matchAll(USE)) {
    const where = `${file}:${lineOf(src, match.index)}`;

    const reason = (match[1] ?? match[2] ?? match[3] ?? '').trim();

    if (!reason) {
      errors.push(
        `${where}: chromiumOnly needs its reason as a string literal`,
      );
    } else if (file.startsWith(CONFORMANCE)) {
      errors.push(`${where}: a conformance suite never skips an engine`);
    } else {
      uses.push(`${where}: ${reason}`);
    }
  }

  for (const match of src.matchAll(ENGINE_SWITCH)) {
    errors.push(
      `${file}:${lineOf(src, match.index)}: \`${match[0]}\` switches on the engine; skip through chromiumOnly(reason) instead`,
    );
  }
}

console.log(
  uses.length === 0
    ? 'Chromium-only specs: none.'
    : `Chromium-only specs (${uses.length}):${uses.map((use) => `\n  - ${use}`).join('')}`,
);

if (errors.length > 0) {
  console.error(`\n${errors.join('\n')}`);
  process.exitCode = 1;
}
