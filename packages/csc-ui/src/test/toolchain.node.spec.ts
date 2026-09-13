/**
 * The devcontainer bakes Chromium for one exact `playwright` version
 * (.devcontainer/Dockerfile → /ms-playwright). The workspace catalog pins the
 * npm client to the same version; this spec fails when the two drift.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const require = createRequire(import.meta.url);

const dockerfile = readFileSync(
  fileURLToPath(
    new URL('../../../../.devcontainer/Dockerfile', import.meta.url),
  ),
  'utf8',
);

it('the devcontainer bakes the Chromium of the installed playwright', () => {
  const baked = dockerfile.match(
    /npx -y playwright@(\d+\.\d+\.\d+) install/,
  )?.[1];

  const installed = (require('playwright/package.json') as { version: string })
    .version;
  expect(baked, 'Dockerfile playwright pin').toBe(installed);
});
