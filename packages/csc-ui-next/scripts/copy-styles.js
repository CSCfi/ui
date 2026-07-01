import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Copy the style-dictionary output into the published `dist/`.
 *
 * `vite build` empties `dist` on every run, so the generated token CSS is
 * written to `src/styles` (which survives) and copied here *after* the Vite
 * build. Mirrors `@cscfi/csc-ui`'s style-copy step.
 *
 * Exposed as a function so the Vite config can re-run it after every (watch)
 * rebuild via the `writeBundle` hook — otherwise `dist/styles` vanishes on
 * each incremental build. Also runnable directly as a CLI step in `build`.
 *
 * Uses an explicit recursive walk with `copyFileSync` rather than `fs.cpSync`,
 * which produced 0-byte write-only files in this environment.
 */
const pkgRoot = path.resolve(fileURLToPath(import.meta.url), '../..');

const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  }
};

/** Copy `src/styles` → `dist/styles`. Returns false (and warns) if no source. */
export const copyStyles = () => {
  const src = path.join(pkgRoot, 'src/styles');
  const dest = path.join(pkgRoot, 'dist/styles');
  if (!fs.existsSync(src)) {
    console.error(
      `[copy-styles] ${src} not found — run style-dictionary:build first.`,
    );
    return false;
  }
  copyDir(src, dest);
  console.log('[copy-styles] src/styles → dist/styles');
  return true;
};

// Run immediately when invoked as a script (`node scripts/copy-styles.js`).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!copyStyles()) process.exit(1);
}
