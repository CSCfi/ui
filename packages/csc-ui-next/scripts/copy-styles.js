import fs from 'node:fs';
import path from 'node:path';

/**
 * Copy the style-dictionary output into the published `dist/`.
 *
 * `vite build` empties `dist` on every run, so the generated token CSS is
 * written to `src/styles` (which survives) and copied here *after* the Vite
 * build. Mirrors `@cscfi/csc-ui`'s style-copy step.
 *
 * Uses an explicit recursive walk with `copyFileSync` rather than `fs.cpSync`,
 * which produced 0-byte write-only files in this environment.
 */
const src = './src/styles';
const dest = './dist/styles';

if (!fs.existsSync(src)) {
  console.error(
    `[copy-styles] ${src} not found — run style-dictionary:build first.`,
  );
  process.exit(1);
}

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

copyDir(src, dest);

console.log(`[copy-styles] ${src} → ${dest}`);
