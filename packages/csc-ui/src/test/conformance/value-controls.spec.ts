/**
 * Conformance suite, kind "value control" (CONTEXT.md, ADR-0049): the v-model
 * contract every tag with an `update:value` event honours, enrolled from the
 * generated `VALUE_TAGS`.
 */
import { describe, expect, it } from 'vitest';
import { createApp, h, ref, vModelText, withDirectives } from 'vue';

import type { Mounted } from '../harness';

import { INTERNAL_EVENTS, VALUE_TAGS } from '../../tag-name-map';
import { defineAll, mount, recordEvents, settle, wrap } from '../harness';
import {
  KNOWN_DOUBLE_EMITTERS,
  KNOWN_PROGRAMMATIC_EMITTERS,
  VALUE_RECIPES,
} from './kinds';

const HOST_EVENTS = ['change', 'update:value'] as const;

type ValueHost = { value?: unknown } & HTMLElement;

/** A value control's own `input` (the native inner input's twin is `composed`). */
const libraryInput = (r: { composed: boolean }): boolean => !r.composed;

it('every value control has a recipe', () => {
  expect(Object.keys(VALUE_RECIPES).sort()).toEqual([...VALUE_TAGS].sort());
});

describe.each(VALUE_TAGS)('%s', (tag) => {
  const recipe = VALUE_RECIPES[tag];

  const known = KNOWN_PROGRAMMATIC_EMITTERS.includes(tag);

  it('emits nothing when value is set programmatically', async () => {
    const m = await mount<ValueHost>(tag, recipe.mount);

    const host = recordEvents(m.host, HOST_EVENTS);

    const inputs = recordEvents(document.body, ['input']);

    m.host.value = recipe.programmatic;
    await settle(60);

    const emitted = [
      ...host.names(),
      ...inputs.of('input', libraryInput).map((r) => r.type),
    ];

    if (known) {
      expect(
        emitted.length,
        'deviation fixed — remove the tag from KNOWN_PROGRAMMATIC_EMITTERS',
      ).toBeGreaterThan(0);
    } else {
      expect(emitted).toEqual([]);
    }
  });

  it('one interaction emits one update:value and one input with the value already on the host', async () => {
    const m = await mount<ValueHost>(tag, recipe.mount);

    const host = recordEvents(m.host, HOST_EVENTS);

    const inputs = recordEvents(document.body, ['input']);

    const wiring = recordEvents(document, INTERNAL_EVENTS);

    await recipe.interact(m);
    await settle(60);

    expect(wiring.names(), 'internal events reaching the page').toEqual([]);

    const updates = host.of('update:value');

    // A pinned double emitter dispatches twice; the assertion is inverted so
    // the fix must shrink KNOWN_DOUBLE_EMITTERS.
    const expectedCount = KNOWN_DOUBLE_EMITTERS.includes(tag) ? 2 : 1;

    expect(updates, 'update:value dispatches').toHaveLength(expectedCount);

    const { detail } = updates[0];

    if (typeof recipe.expected === 'function') {
      expect(
        recipe.expected(detail),
        `update:value detail ${JSON.stringify(detail)}`,
      ).toBe(true);
    } else {
      expect(detail).toEqual(recipe.expected);
    }

    // Only the control's own `input` reaches the page: a native one from its
    // shadow tree stops at the shadow root.
    const libraryInputs = inputs.of('input');

    expect(libraryInputs, 'input events reaching the page').toHaveLength(
      expectedCount,
    );
    expect(libraryInputs.every(libraryInput)).toBe(true);
    expect(libraryInputs[0].bubbles).toBe(true);

    expect(updates[0].targetValue, 'host.value at dispatch').toEqual(detail);
    expect(libraryInputs[0].targetValue, 'host.value at input').toEqual(detail);

    // Typed text commits later: the interaction alone fires no `change`.
    if (recipe.commit) {
      expect(host.of('change'), 'change before the commit').toHaveLength(0);

      await recipe.commit(m);
      await settle(60);

      expect(inputs.of('input'), 'input after the commit').toHaveLength(
        expectedCount,
      );
    }

    const changes = host.of('change');

    expect(changes, 'change dispatches').toHaveLength(expectedCount);
    expect(changes[0].detail).toEqual(detail);
    expect(changes[0].bubbles, 'change bubbles').toBe(false);
    expect(
      host.of('update:value'),
      'update:value after the commit',
    ).toHaveLength(expectedCount);
  });

  it.runIf(recipe.commit)(
    'a commit with nothing changed since the last one fires no change',
    async () => {
      const m = await mount<ValueHost>(tag, recipe.mount);

      await recipe.interact(m);
      await recipe.commit!(m);
      await settle(60);

      const host = recordEvents(m.host, HOST_EVENTS);

      m.shadow('input').focus();
      await recipe.commit!(m);
      await settle(60);

      expect(host.names()).toEqual([]);
    },
  );

  it.runIf(recipe.emptyAware)(
    'treats an empty string and null as no value',
    async () => {
      const m = await mount<ValueHost>(tag, {
        ...recipe.mount,
        props: { ...recipe.mount.props, clearable: true },
      });

      for (const empty of ['', null]) {
        m.host.value = empty;
        await settle();

        const input = m.host.shadowRoot!.querySelector('c-input');

        expect(
          input?.shadowRoot?.querySelector('[data-lifted]'),
          `label lifted for ${JSON.stringify(empty)}`,
        ).toBeNull();
        expect(
          m.host.shadowRoot!.querySelector(
            'c-icon-button[aria-label="Clear selection"]',
          ),
          `clear button shown for ${JSON.stringify(empty)}`,
        ).toBeNull();
      }
    },
  );

  // The field's input is in its shadow root, so the host's `aria-label` is
  // the only name a field without a visible label can get. Beside a `label`
  // the visible text names the input (WCAG 2.5.3, label in name), and the
  // `aria-label` names nothing.
  it.runIf(recipe.emptyAware)(
    'a host aria-label names the input only without a visible label',
    async () => {
      const { label: _label, ...props } = recipe.mount.props ?? {};

      for (const label of [undefined, 'Visible label']) {
        const m = await mount(tag, {
          ...recipe.mount,
          attrs: { ...recipe.mount.attrs, 'aria-label': 'Probe name' },
          props: label ? { ...props, label } : props,
        });

        const named = (root: ShadowRoot): Element[] =>
          [...root.querySelectorAll('*')].flatMap((el) => [
            ...(el.getAttribute('aria-label') === 'Probe name' ? [el] : []),
            ...(el.shadowRoot ? named(el.shadowRoot) : []),
          ]);

        const control = m.host.shadowRoot!.querySelector(
          '[role="combobox"], input:not([type="hidden"]), textarea',
        );

        expect(named(m.host.shadowRoot!), `with label ${label}`).toEqual(
          label ? [] : [control],
        );

        if (label) {
          expect(control?.getAttribute('aria-label')).toContain(label);
        }

        m.unmount();
      }
    },
  );

  // Vue reads `''` as `true` for a prop whose runtime types list Boolean
  // before String, and `''` is what a plain `v-model` writes for an empty
  // model (CONTEXT.md "Value control": '' reads as empty).
  it.runIf(typeof recipe.expected === 'boolean')(
    'reads an empty-string value as unchecked',
    async ({ skip }) => {
      const m = await mount<ValueHost>(tag, recipe.mount);

      // Only the controls with a `checked` view (c-modal's value is a boolean
      // too, but it is open or closed).
      if (!('checked' in m.host)) skip();

      m.host.value = true;
      await settle();
      expect(m.host.matches(':state(checked)')).toBe(true);

      m.host.value = '';
      await settle();
      expect(m.host.matches(':state(checked)')).toBe(false);
    },
  );

  it.skipIf(known)(
    'round-trips a plain v-model without emitting at mount',
    async () => {
      defineAll();

      const model = ref<unknown>(recipe.model ?? null);

      const container = document.createElement('div');

      document.body.append(container);

      // What `<c-x v-model="model">` compiles to for a custom element. The model
      // owns `value`, so the fixture's own `value` (if any) is not passed.
      const { value: _fixtureValue, ...props } = recipe.mount.props ?? {};

      const app = createApp({
        render: () =>
          withDirectives(
            h(tag, {
              ...recipe.mount.attrs,
              ...props,
              innerHTML: recipe.mount.html ?? '',
              'onUpdate:modelValue': (value: unknown) => {
                model.value = value;
              },
            }),
            [[vModelText, model.value]],
          ),
      });

      app.mount(container);

      const host = container.querySelector<ValueHost>(tag)!;

      await customElements.whenDefined(tag);
      await settle();

      const events = recordEvents(host, HOST_EVENTS);

      const m: Mounted<ValueHost> = wrap(host, container);

      await settle(60);
      expect(events.names(), 'events during mount').toEqual([]);

      await recipe.interact(m);
      await settle(60);

      if (typeof recipe.expected === 'function') {
        expect(recipe.expected(model.value)).toBe(true);
      } else {
        expect(model.value).toEqual(recipe.expected);
      }

      app.unmount();
    },
  );
});
