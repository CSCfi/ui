import type { Component } from 'vue';

/**
 * Example smoke (CONTEXT.md, ADR-0049): every Vue canon mounts once against
 * the built package and upgrades cleanly, and axe finds no WCAG 2.1 AA
 * violation in either theme mode (D14, ADR-0077). The canons are fixtures,
 * not specs — nothing here asserts behaviour. The 2026-09-11 `.prop`
 * regression (52 dead bindings across 26 canons) is the class of fault this
 * catches.
 *
 * `axe-baseline.json` lists, per canon, the axe rules that still fail. It
 * may only shrink (a listed rule that passes fails the canon until it is
 * removed), and it must be empty once the changesets pre tag leaves `alpha`.
 * A rule wrong for a shadow-DOM pattern is disabled for every canon in
 * `smoke.ts`, with its reason — never per canon.
 */
import { describe, expect, inject, it } from 'vitest';
import { page, server } from 'vitest/browser';
import { createApp } from 'vue';

import AXE_BASELINE from './axe-baseline.json';
import {
  axeViolations,
  captureConsole,
  expectUpgraded,
  settle,
  settleTime,
} from './smoke';

const canons = import.meta.glob<{ default: Component }>(
  '../app/examples/*/*.vue',
);

const nameOf = (file: string): string =>
  file.replace('../app/examples/', '').replace(/\.vue$/, '');

const baseline: Record<string, string[]> = AXE_BASELINE;

/** One representative canon per component family, captured in both theme modes. */
const SCREENSHOT = new Set([
  'c-alert/types',
  'c-badge/basic',
  'c-button/variants',
  'c-card/basic',
  'c-checkbox/basic',
  'c-data-table/basic',
  'c-progress-bar/basic',
  'c-radio-group/basic',
  'c-select/basic',
  'c-switch/basic',
  'c-tabs/basic',
  'c-tags/basic',
  'c-text-field/basic',
  'c-tree-select/basic',
]);

describe('canon', () => {
  for (const [file, load] of Object.entries(canons)) {
    const name = nameOf(file);

    it(name, async () => {
      const { default: canon } = await load();

      const capture = captureConsole();

      const { problems } = capture;

      const app = createApp(canon);

      app.config.warnHandler = (message) =>
        problems.push(`Vue warn: ${message}`);
      app.config.errorHandler = (error) =>
        problems.push(`Vue error: ${String(error)}`);

      const root = document.createElement('div');

      root.dataset.canon = name;
      document.body.append(root);

      try {
        app.mount(root);
        await settle(settleTime(name));

        expectUpgraded(root);
        expect(problems).toEqual([]);

        const violations = await axeViolations(root);

        const allowed = new Set(baseline[name] ?? []);

        expect(
          [...violations]
            .filter(([rule]) => !allowed.has(rule))
            .flatMap(([rule, lines]) => lines.map((line) => `${rule} ${line}`)),
          'axe violations (WCAG 2.1 AA)',
        ).toEqual([]);
        expect(
          [...allowed].filter((rule) => !violations.has(rule)),
          'axe rules that pass now: remove them from tests/axe-baseline.json',
        ).toEqual([]);

        // Baselines are compared on Linux only (devcontainer + CI, where the
        // fonts are pinned); elsewhere the mount assertions above still run.
        if (SCREENSHOT.has(name) && server.platform === 'linux') {
          for (const mode of ['light', 'dark'] as const) {
            document.documentElement.setAttribute('data-theme', mode);
            await settle(350);
            await expect
              .element(page.elementLocator(root))
              .toMatchScreenshot(`${name.replace('/', '-')}-${mode}`);
          }
        }
      } finally {
        capture.restore();
        app.unmount();
        root.remove();
      }

      expect(
        document.documentElement.style.overflow,
        'scroll lock released',
      ).toBe('');
    });
  }
});

describe('axe baseline', () => {
  it('names only canons that exist', () => {
    const names = new Set(Object.keys(canons).map(nameOf));

    expect(Object.keys(baseline).filter((name) => !names.has(name))).toEqual(
      [],
    );
  });

  it('is empty once the changesets pre tag leaves alpha', () => {
    if (inject('preTag') === 'alpha') return;

    expect(Object.keys(baseline)).toEqual([]);
  });
});
