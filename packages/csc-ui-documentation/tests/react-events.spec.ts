import type { ComponentType } from 'react';

/**
 * The React wrapper's event mapping (D15, ADR-0019): for every event the
 * manifest publishes, the generated `on<Event>` prop of the tag's wrapper
 * receives the element's CustomEvent with its detail — value events,
 * `change:<prop>`, `select` and the rest alike. Generated from the built
 * manifest, so an event is covered the day it is added.
 */
import * as wrappers from '@cscfi/csc-ui-react';
import manifest from '@cscfi/csc-ui/custom-elements.json';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';

import { settle } from './smoke';

interface Declaration {
  events?: Array<{ name: string }>;
  tagName?: string;
}

const capitalize = (part: string): string =>
  part.charAt(0).toUpperCase() + part.slice(1);

/** As `packages/csc-ui-react/scripts/generate.mjs`: `update:value` → `onUpdateValue`. */
const reactEventName = (name: string): string =>
  `on${name.split(/[:-]/).map(capitalize).join('')}`;

/** `c-text-field` → `CTextField`. */
const wrapperName = (tag: string): string =>
  tag.split('-').map(capitalize).join('');

const declarations = (
  manifest.modules as Array<{ declarations?: Declaration[] }>
)
  .flatMap((module) => module.declarations ?? [])
  .filter((declaration) => declaration.tagName && declaration.events?.length);

describe('react event mapping', () => {
  for (const { events = [], tagName = '' } of declarations) {
    it(tagName, async () => {
      const wrapper = (wrappers as unknown as Record<string, ComponentType>)[
        wrapperName(tagName)
      ];

      expect(wrapper, `${wrapperName(tagName)} export`).toBeDefined();

      const received = new Map<string, unknown>();

      const handlers = Object.fromEntries(
        events.map(({ name }) => [
          reactEventName(name),
          (event: Event) =>
            received.set(name, (event as CustomEvent<unknown>).detail),
        ]),
      );

      const root = document.createElement('div');

      document.body.append(root);

      const reactRoot = createRoot(root);

      try {
        flushSync(() => reactRoot.render(createElement(wrapper, handlers)));
        await settle();

        const element = root.querySelector(tagName)!;

        for (const { name } of events) {
          const detail = { event: name };

          element.dispatchEvent(new CustomEvent(name, { detail }));

          expect(received.get(name), `${reactEventName(name)} detail`).toBe(
            detail,
          );
        }
      } finally {
        reactRoot.unmount();
        root.remove();
      }
    });
  }
});
