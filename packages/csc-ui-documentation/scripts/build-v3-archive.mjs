/**
 * Build the 3.x documentation archive into `public/v3/` (plan D16).
 *
 * 3.x is unsupported since 4.0.0, but apps still upgrading need its docs.
 * This builds the docs site of the last 3.x release (the `v3.0.19` tag) once,
 * as a static snapshot the 4.x site serves at `/v3/`:
 *
 *   1. checks the tag out into a temporary git worktree and installs its
 *      dependencies with npm, scripts off (its `prepare` would run
 *      `husky install` against this repository's shared git config);
 *   2. builds the Stencil package and the Vue wrapper the docs import, then
 *      generates the docs (a client-only Nuxt app) under the `/v3/` base;
 *   3. puts an "unsupported" banner, linking the current docs and the
 *      migration guide, at the top of every page, and keeps the archive out of
 *      search results;
 *   4. gives every component page its own entry HTML, so a direct link such
 *      as `/v3/components/c-button` loads on any static host without a
 *      fallback rule;
 *   5. replaces `public/v3/` with the result and removes the worktree.
 *
 * The output is committed: it never changes once built. Rerun only to change
 * the banner.
 *
 * Usage: node scripts/build-v3-archive.mjs
 */
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TAG = 'v3.0.19';

const BASE = '/v3/';

const resolve = (relative) => fileURLToPath(new URL(relative, import.meta.url));

const target = resolve('../public/v3');

const scratch = mkdtempSync(path.join(tmpdir(), 'csc-ui-v3-'));

const worktree = path.join(scratch, 'repo');

const run = (command, args, cwd, env = {}) =>
  execFileSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });

const BANNER = `<div role="note" style="position:relative;z-index:2147483647;padding:10px 16px;background:#fff3c4;color:#1f1f1f;border-bottom:2px solid #b45309;font:15px/1.5 system-ui,sans-serif;text-align:center"><strong>csc-ui 3.x is unsupported since 4.0.0.</strong> This is an archived copy of the 3.0.19 documentation. <a href="/" style="color:inherit;text-decoration:underline">Current documentation</a> · <a href="/migration" style="color:inherit;text-decoration:underline">Migration guide</a></div>`;

/** Every HTML file under `dir`. */
const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const file = path.join(dir, entry);

    if (statSync(file).isDirectory()) return htmlFiles(file);

    return entry.endsWith('.html') ? [file] : [];
  });

const archive = (html) =>
  html
    .replace('<head>', '<head><meta name="robots" content="noindex">')
    .replace(/<body([^>]*)>/, `<body$1>${BANNER}`);

try {
  run('git', ['worktree', 'add', '--detach', worktree, TAG], resolve('.'));

  run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], worktree, {
    CI: 'true',
    HUSKY: '0',
  });

  run('npm', ['run', 'build'], path.join(worktree, 'packages/csc-ui'));
  run('npm', ['run', 'build'], path.join(worktree, 'packages/csc-ui-vue'));

  const docs = path.join(worktree, 'packages/csc-ui-documentation');

  run('npx', ['nuxt', 'prepare'], docs);
  run('node', ['scripts/updateVersion.js'], docs);
  run('npm', ['run', 'build:examples'], docs);
  run('npx', ['nuxt', 'generate'], docs, { NUXT_APP_BASE_URL: BASE });

  const output = path.join(docs, '.output/public');

  // The client-only app prerenders a shell for its static routes; component
  // pages are one catch-all route, so each gets a copy of the SPA shell.
  const { components } = JSON.parse(
    readFileSync(path.join(worktree, 'packages/csc-ui/docs.json'), 'utf8'),
  );

  const shell = readFileSync(path.join(output, '200.html'), 'utf8');

  for (const { tag } of components) {
    const dir = path.join(output, 'components', tag);

    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'index.html'), shell);
  }

  for (const file of htmlFiles(output)) {
    writeFileSync(file, archive(readFileSync(file, 'utf8')));
  }

  rmSync(target, { force: true, recursive: true });
  // `cp`, not fs.cpSync: Node's native copy fails with EACCES on some
  // overlay filesystems (the devcontainer's).
  run('cp', ['-R', output, target], worktree);

  console.log(`3.x docs archive (${TAG}) written to ${target}`);
} finally {
  if (existsSync(worktree)) {
    run('git', ['worktree', 'remove', '--force', worktree], resolve('.'));
  }

  rmSync(scratch, { force: true, recursive: true });
}
