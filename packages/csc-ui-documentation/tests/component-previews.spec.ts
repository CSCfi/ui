/**
 * The /components overview shows a picture of every standalone component in
 * both theme modes, written by scripts/component-previews.mjs. A new
 * component fails here until the script has run for it, and a removed one
 * until its pictures are deleted. Whether a picture still matches the
 * component's render is CI's `pnpm test:previews`, which needs the generated
 * site.
 */
import { describe, expect, it } from 'vitest';

import { useManifest } from '../app/composables/useManifest';

// Keys only: the images themselves are never loaded.
const previews = Object.keys(import.meta.glob('../public/previews/*')).map(
  (path) => path.replace('../public/previews/', ''),
);

describe('component previews', () => {
  const standalone = useManifest().navComponents.map(
    (component) => component.tagName,
  );

  it('exist for every standalone component in both theme modes', () => {
    expect(
      standalone
        .flatMap((tag) => [`${tag}-light.webp`, `${tag}-dark.webp`])
        .filter((file) => !previews.includes(file)),
      'missing: run `pnpm previews` after `pnpm generate`',
    ).toEqual([]);
  });

  it('name only standalone components', () => {
    expect(
      previews.filter(
        (file) =>
          !standalone.includes(file.replace(/-(dark|light)\.webp$/, '')),
      ),
    ).toEqual([]);
  });
});
