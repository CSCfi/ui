/**
 * Conformance suite, kind "form-associated" (CONTEXT.md "Form-associated",
 * "Validating form"; ADR-0084): every value control that is a form field takes
 * part in a native `<form>` — its value submits under its `name`, a form reset
 * returns it to its default with `update:value` and no `change`, a disabled
 * fieldset disables it, and a validating form checks `required` but never
 * the consumer's `invalid`. Enrolled from the generated `VALUE_TAGS`. The
 * form-associated elements without a value (the buttons) focus their control
 * from `focus()`, as the form controls do (value-controls).
 */
import { describe, expect, it } from 'vitest';

import { formAssociatedTags } from '../../registry';
import { VALUE_TAGS } from '../../tag-name-map';
import {
  deepActiveElement,
  defineAll,
  mount,
  mountInForm,
  recordEvents,
  settle,
} from '../harness';
import { FIXTURES, NOT_FORM_FIELDS, VALUE_RECIPES } from './kinds';

type ValueHost = { value?: unknown } & HTMLElement;

const FORM_TAGS = VALUE_TAGS.filter((tag) => !NOT_FORM_FIELDS.includes(tag));

/** The form-associated elements without a value: the buttons. */
const VALUELESS_TAGS = [...formAssociatedTags].filter(
  (tag) => !(VALUE_TAGS as readonly string[]).includes(tag),
);

/** What a recipe's programmatic value submits: a checked box `on`, else the text. */
const entryOf = (value: unknown): string =>
  value === true ? 'on' : String(value);

it('every value control is form-associated unless it is not a form field', () => {
  defineAll();

  const associated = (tag: string): boolean =>
    (customElements.get(tag) as { formAssociated?: boolean } | undefined)
      ?.formAssociated === true;

  expect(VALUE_TAGS.filter(associated).sort()).toEqual([...FORM_TAGS].sort());
  expect(['c-button', 'c-icon-button'].filter(associated)).toHaveLength(2);
});

describe.each(FORM_TAGS)('%s', (tag) => {
  const recipe = VALUE_RECIPES[tag];

  // The suite sets its own values: a mounted value would be authored as a
  // property, never as the default a reset returns to.
  const { value: _mounted, ...props } = recipe.mount.props ?? {};

  const inForm = (extra: Record<string, unknown> = {}) =>
    mountInForm<ValueHost>(tag, {
      ...recipe.mount,
      attrs: { ...recipe.mount.attrs, name: 'field' },
      props: { ...props, ...extra },
    });

  it('submits its value under its name', async () => {
    const m = await inForm();

    m.host.value = recipe.programmatic;
    await settle();

    expect(m.entries('field')).toEqual([entryOf(recipe.programmatic)]);
    m.unmount();
  });

  it('a form reset returns to the default with update:value, never change', async () => {
    const m = await inForm();

    const before = m.entries('field');

    m.host.value = recipe.programmatic;
    await settle();

    const events = recordEvents(m.host, ['change', 'update:value']);

    m.form.reset();
    await settle();

    expect(m.entries('field')).toEqual(before);
    expect(events.names()).toEqual(['update:value']);
    m.unmount();
  });

  it('a disabled fieldset disables it, and it submits nothing', async () => {
    const m = await inForm();

    m.host.value = recipe.programmatic;
    m.fieldset.disabled = true;
    await settle();

    expect(m.host.matches(':disabled')).toBe(true);
    expect(m.entries('field')).toEqual([]);
    m.unmount();
  });

  it('a validating form checks required, never invalid', async () => {
    const m = await inForm({ invalid: true });

    expect(m.form.checkValidity()).toBe(true);

    if ('required' in m.host) {
      (m.host as { required?: boolean }).required = true;
      await settle();

      expect(m.form.checkValidity()).toBe(false);
    }

    m.host.value = recipe.programmatic;
    await settle();

    expect(m.form.checkValidity()).toBe(true);
    m.unmount();
  });
});

// A menu or popover returns focus to its trigger, and an app moves focus to a
// button, with the element's focus(). The host renders no box of its own, so
// its button must take it.
describe.each(VALUELESS_TAGS)('%s', (tag) => {
  it('focus() focuses its button, also once the element is re-added', async () => {
    const m = await mount(tag, FIXTURES[tag]);

    const parent = m.host.parentNode!;

    // Once mounted, and again after the element leaves the page and comes
    // back with a new component instance (KeepAlive, a moved list item).
    for (const pass of ['mounted', 're-added']) {
      await settle();
      (deepActiveElement() as HTMLElement | null)?.blur();

      m.host.focus();
      await settle();

      expect(document.activeElement, pass).toBe(m.host);
      expect(m.host.shadowRoot!.activeElement, pass).toBe(m.part('root'));

      m.host.remove();
      await settle(100);
      parent.append(m.host);
    }

    m.unmount();
  });
});
