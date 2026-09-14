/**
 * Example smoke (CONTEXT.md, ADR-0049): every canon mounts once against the
 * built package and upgrades cleanly. The canons are fixtures, not specs —
 * nothing here asserts behaviour. The 2026-09-11 `.prop` regression (52 dead
 * bindings across 26 canons) is the class of fault this catches.
 */
import { describe, expect, it } from 'vitest';
import { page, server } from 'vitest/browser';
import type { Component } from 'vue';
import { createApp } from 'vue';

const canons = import.meta.glob<{ default: Component }>(
  '../app/examples/*/*.vue',
);

/** Canons whose data arrives on a timer (debounced external filter, simulated fetch). */
const TIMER_DRIVEN = new Set([
  'c-autocomplete/external',
  'c-data-table/external-data',
]);

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

const settle = async (ms = 0): Promise<void> => {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));

  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
};

describe('canon', () => {
  for (const [file, load] of Object.entries(canons)) {
    const name = file.replace('../app/examples/', '').replace(/\.vue$/, '');

    it(name, async () => {
      const { default: canon } = await load();
      const problems: string[] = [];
      const originals = { error: console.error, warn: console.warn };

      console.error = (...args: unknown[]) =>
        problems.push(`console.error: ${args.join(' ')}`);
      console.warn = (...args: unknown[]) =>
        problems.push(`console.warn: ${args.join(' ')}`);

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
        await settle(TIMER_DRIVEN.has(name) ? 700 : 100);

        const elements = Array.from(root.querySelectorAll('*')).filter((el) =>
          el.localName.startsWith('c-'),
        );

        expect(
          elements.length,
          'the canon renders at least one c-* element',
        ).toBeGreaterThan(0);

        for (const el of elements) {
          expect(customElements.get(el.localName), el.localName).toBeDefined();
          expect(el.matches(':defined'), `${el.localName} upgraded`).toBe(true);
          expect(el.shadowRoot, `${el.localName} shadow root`).not.toBeNull();
          // A `:some-prop.prop` binding writes a dead own property instead of
          // the camelCase property the element declares.
          expect(
            Object.getOwnPropertyNames(el).filter((key) => key.includes('-')),
            `${el.localName} hyphenated own properties`,
          ).toEqual([]);
        }

        expect(problems).toEqual([]);

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
        console.error = originals.error;
        console.warn = originals.warn;
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
