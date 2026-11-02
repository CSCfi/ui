/**
 * TypeScript flavor of the example smoke (D15, ADR-0077): every
 * `.typescript.html` fragment, run with its optional `.typescript.ts`
 * wiring, upgrades as cleanly as its Vue canon.
 */
import { describe, expect, it } from 'vitest';

import { captureConsole, expectUpgraded, settle, settleTime } from './smoke';

const fragments = import.meta.glob<string>(
  '../app/examples/*/*.typescript.html',
  { import: 'default', query: '?raw' },
);

const scripts = import.meta.glob('../app/examples/*/*.typescript.ts');

describe('typescript canon', () => {
  for (const [file, load] of Object.entries(fragments)) {
    const name = file
      .replace('../app/examples/', '')
      .replace(/\.typescript\.html$/, '');

    it(name, async () => {
      const capture = captureConsole();

      const root = document.createElement('div');

      root.dataset.canon = name;
      document.body.append(root);

      try {
        root.innerHTML = await load();
        // The wiring queries the document, so the fragment goes in first.
        await scripts[file.replace(/\.html$/, '.ts')]?.();
        await settle(settleTime(name));

        expectUpgraded(root);
        expect(capture.problems).toEqual([]);
      } finally {
        capture.restore();
        root.remove();
      }

      expect(
        document.documentElement.style.overflow,
        'scroll lock released',
      ).toBe('');
    });
  }
});
