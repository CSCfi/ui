import type { ComponentType } from 'react';

/**
 * React flavor of the example smoke (D15, ADR-0077): every `.react.tsx`
 * canon renders through the built `@cscfi/csc-ui-react` wrappers on React 19
 * and upgrades as cleanly as its Vue canon, with no React warning or error.
 */
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';

import { captureConsole, expectUpgraded, settle, settleTime } from './smoke';

const canons = import.meta.glob<Record<string, ComponentType>>(
  '../app/examples/*/*.react.tsx',
);

describe('react canon', () => {
  for (const [file, load] of Object.entries(canons)) {
    const name = file
      .replace('../app/examples/', '')
      .replace(/\.react\.tsx$/, '');

    it(name, async () => {
      // Each canon module exports its one example component.
      const [canon] = Object.values(await load());

      const capture = captureConsole();

      const { problems } = capture;

      const report = (kind: string) => (error: unknown) =>
        problems.push(`React ${kind}: ${String(error)}`);

      const root = document.createElement('div');

      root.dataset.canon = name;
      document.body.append(root);

      const reactRoot = createRoot(root, {
        onCaughtError: report('caught error'),
        onRecoverableError: report('recoverable error'),
        onUncaughtError: report('uncaught error'),
      });

      try {
        flushSync(() => reactRoot.render(createElement(canon)));
        await settle(settleTime(name));

        expectUpgraded(root);
        expect(problems).toEqual([]);
      } finally {
        capture.restore();
        reactRoot.unmount();
        root.remove();
      }

      expect(
        document.documentElement.style.overflow,
        'scroll lock released',
      ).toBe('');
    });
  }
});
