// The pre-commit check (ADR-0068): runs oxfmt, oxlint and ESLint over the
// staged paths in check mode. It never writes a file or touches the index, so
// it cannot race an editor that rewrites `.git/index`; a failure says how to
// fix it instead. It reads the working-tree copy of each staged path, so a
// partly staged file is judged with its unstaged edits.
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';

const staged = execFileSync(
  'git',
  ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);

if (staged.length === 0) {
  process.exit(0);
}

const scripts = staged.filter((file) =>
  /\.(?:[cm]?[jt]s|[jt]sx|vue)$/.test(file),
);

const templates = staged.filter((file) => file.endsWith('.vue'));

const steps = [
  ['oxfmt', ['--check', '--no-error-on-unmatched-pattern', ...staged]],
  scripts.length > 0 && [
    'oxlint',
    ['--deny-warnings', '--no-error-on-unmatched-pattern', ...scripts],
  ],
  templates.length > 0 && [
    'eslint',
    ['--max-warnings', '0', '--no-warn-ignored', ...templates],
  ],
].filter(Boolean);

let failed = false;

for (const [bin, args] of steps) {
  const { status } = spawnSync(path.join('node_modules', '.bin', bin), args, {
    stdio: 'inherit',
  });

  if (status !== 0) {
    failed = true;
  }
}

if (failed) {
  console.error(
    '\nThe staged files fail the format or lint check. Run `pnpm fix`, stage the result and commit again.',
  );
  process.exit(1);
}
