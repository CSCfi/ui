/**
 * The visual baselines depend on one exact font: the Liberation 2.1.5 files
 * bundled under `src/test/fonts`, which `src/test/fonts.conf` (handed to
 * Chromium as FONTCONFIG_FILE by vitest.browser.shared.ts) selects in front
 * of whatever Liberation the distro ships. This spec asks fontconfig itself,
 * so it fails when the config no longer parses (a stray double hyphen in its
 * XML comment once broke it, silently for Chromium) or when a system copy
 * wins again. Linux only: that is where baselines are authored and compared.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const FONTS_CONF = fileURLToPath(new URL('./fonts.conf', import.meta.url));

const FONTS_DIR = fileURLToPath(new URL('./fonts', import.meta.url));

/** `fontversion` of the bundled Liberation 2.1.5 faces (head.fontRevision × 65536). */
const BUNDLED_FONTVERSION = 137625;

const fcMatch = (pattern: string) =>
  spawnSync('fc-match', ['-v', pattern], {
    encoding: 'utf8',
    env: { ...process.env, FONTCONFIG_FILE: FONTS_CONF },
  });

const available =
  process.platform === 'linux' &&
  spawnSync('fc-match', ['--version']).status === 0;

describe.skipIf(!available)('harness fonts (fontconfig)', () => {
  it('fonts.conf parses without errors', () => {
    expect(fcMatch('sans-serif').stderr).toBe('');
  });

  it.each([
    'Liberation Sans',
    'sans-serif',
    'system-ui',
    'ui-sans-serif',
    'museo-sans',
  ])('%s resolves to the bundled Liberation Sans 2.1.5', (pattern) => {
    const { stdout } = fcMatch(pattern);

    expect(stdout).toMatch(/family: "Liberation Sans"/);

    const file = stdout.match(/file: "([^"]+)"/)?.[1];

    expect(file, 'matched file').toBeDefined();
    expect(path.dirname(file!)).toBe(FONTS_DIR);
    expect(stdout).toContain(`fontversion: ${BUNDLED_FONTVERSION}`);
  });

  it('bold, italic and monospace requests get the bundled faces, not synthetic ones', () => {
    expect(fcMatch('sans-serif:bold').stdout).toContain(
      path.join(FONTS_DIR, 'LiberationSans-Bold.ttf'),
    );
    expect(fcMatch('sans-serif:italic').stdout).toContain(
      path.join(FONTS_DIR, 'LiberationSans-Italic.ttf'),
    );
    expect(fcMatch('monospace').stdout).toContain(
      path.join(FONTS_DIR, 'LiberationMono-Regular.ttf'),
    );
  });
});
