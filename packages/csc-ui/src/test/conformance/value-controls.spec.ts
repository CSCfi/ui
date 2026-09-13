/**
 * Conformance suite, kind "value control" (CONTEXT.md, ADR-0049): the v-model
 * contract every tag with an `update:value` event honours, enrolled from the
 * generated `VALUE_TAGS`.
 */
import { describe, expect, it } from 'vitest';
import { createApp, h, ref, vModelText, withDirectives } from 'vue';

import type { Mounted } from '../harness';

import { VALUE_TAGS } from '../../tag-name-map';
import { defineAll, mount, recordEvents, settle, wrap } from '../harness';
import {
  KNOWN_EMPTY_VALUE_CHECKED,
  KNOWN_PROGRAMMATIC_EMITTERS,
  VALUE_RECIPES,
} from './kinds';

const HOST_EVENTS = [
  'changeValue',
  'change-value',
  'change',
  'update:value',
] as const;

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

    await recipe.interact(m);
    await settle(60);

    const updates = host.of('update:value');

    expect(updates).toHaveLength(1);

    const { detail } = updates[0];

    if (typeof recipe.expected === 'function') {
      expect(
        recipe.expected(detail),
        `update:value detail ${JSON.stringify(detail)}`,
      ).toBe(true);
    } else {
      expect(detail).toEqual(recipe.expected);
    }

    const libraryInputs = inputs.of('input', libraryInput);

    expect(libraryInputs).toHaveLength(1);
    expect(libraryInputs[0].bubbles).toBe(true);

    const settledAt =
      recipe.valueSettledAt === 'input' ? libraryInputs[0] : updates[0];

    expect(settledAt.targetValue, 'host.value at dispatch').toEqual(detail);

    if (recipe.family === 'change') {
      const changes = host.of('change');

      expect(changes).toHaveLength(1);
      expect(changes[0].detail).toEqual(detail);
      expect(host.of('changeValue')).toHaveLength(0);
    } else {
      expect(host.of('changeValue')).toHaveLength(1);
      expect(host.of('change-value')).toHaveLength(1);
      expect(host.of('changeValue')[0].detail).toEqual(detail);
      expect(host.of('change-value')[0].detail).toEqual(detail);
    }
  });

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

  it.runIf(KNOWN_EMPTY_VALUE_CHECKED.includes(tag))(
    'an empty-string value mounts the control checked (known deviation)',
    async () => {
      const m = await mount<ValueHost>(tag, recipe.mount);

      expect(m.host.matches(':state(checked)')).toBe(false);

      m.host.value = '';
      await settle();

      expect(
        m.host.matches(':state(checked)'),
        'deviation fixed — remove the tag from KNOWN_EMPTY_VALUE_CHECKED',
      ).toBe(true);
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
