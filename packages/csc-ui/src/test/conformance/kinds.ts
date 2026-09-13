/**
 * Fixtures and recipes for the conformance suites (CONTEXT.md "Conformance
 * suite", ADR-0049). Tags are enrolled from generated data — `migratedTags`,
 * `VALUE_TAGS`, a runtime `[popover]` probe — never from these tables; the
 * tables only say how to make a tag interactive, and each suite fails when a
 * tag has no entry.
 */
import { mdiCheck } from '@mdi/js';
import { userEvent } from 'vitest/browser';

import type { Mounted, MountOptions } from '../harness';

import { settle } from '../harness';

export { NO_ROOT_PART } from './root-part';

/** Per-tag mount options that keep a bare mount warning-free. Each entry names the warning it prevents. */
export const FIXTURES: Record<string, MountOptions> = {
  // c-icon renders nothing meaningful without a path.
  'c-icon': { props: { path: mdiCheck } },
  // CMenuItem.vue only renders its submenu popover with a populated `submenu` slot.
  'c-menu-item': {
    html: 'Item<c-menu-item slot="submenu" value="s">Sub</c-menu-item>',
  },
  // CMessage.vue renders its root only with a hint or an error message.
  'c-message': { props: { hint: 'Hint text' } },
  // CModal.vue warns when opened without an accessible name.
  'c-modal': { attrs: { 'aria-label': 'Dialog' } },
  // CPopover.vue warns when the panel has neither a heading nor an aria-label.
  'c-popover': {
    html: '<c-button slot="trigger">Open</c-button>',
    props: { heading: 'Heading' },
  },
};

/**
 * Value controls that dispatch value events on mount or on a programmatic
 * `value` change, breaking the "emit only on interaction" contract. The suite
 * asserts the inverse for these so fixing one forces the list to shrink.
 */
export const KNOWN_PROGRAMMATIC_EMITTERS: readonly string[] = [
  // CPagination.vue: `onMounted → setRange()` and a `value` watch both emit.
  'c-pagination',
];

/**
 * Anchored overlays that drop keyboard focus to `<body>` when they close from
 * the keyboard with a slotted `c-button` trigger: the return call is
 * `trigger.focus()` on a `display: contents` host, which is not focusable.
 * The suite asserts the inverse so fixing one forces the list to shrink.
 */
export const KNOWN_FOCUS_LOSS_ON_CLOSE: readonly string[] = [
  // CMenu.vue: `getTriggerEl()?.focus?.()` after Escape.
  'c-menu',
];

/**
 * Value controls whose `value` prop is typed `boolean | number | string`: Vue
 * casts an empty string to `true` for such a prop, so the `''` a plain Vue
 * `v-model` writes for a `null` model reads as `trueValue` and the control
 * mounts CHECKED. Real consumer-facing deviation (see CONTEXT.md "Value
 * control": '' must read as empty). The suite asserts the inverse so fixing
 * one forces the list to shrink.
 */
export const KNOWN_EMPTY_VALUE_CHECKED: readonly string[] = [
  'c-checkbox',
  'c-switch',
];

const OPTIONS = [
  '<c-option name="Finland" value="fi">Finland</c-option>',
  '<c-option name="Sweden" value="se">Sweden</c-option>',
  '<c-option name="Norway" value="no">Norway</c-option>',
].join('');

export interface ValueRecipe {
  /** The value control is built on c-input and must treat '' / null as empty. */
  emptyAware?: boolean;
  /** The `update:value` detail that interaction yields (a predicate for object values). */
  expected: ((detail: unknown) => boolean) | unknown;
  /**
   * `changeValue`: the grandfathered set (changeValue + change-value twin);
   * `change`: the all-lowercase set (`emitModelChange`);
   * `otp`: c-otp-input's hand-rolled bridge (changeValue is null until complete).
   */
  family: 'change' | 'changeValue' | 'otp';
  /** The one user interaction that changes the value. */
  interact(m: Mounted): Promise<void>;
  /** Initial v-model value for the round-trip test (default `null`). */
  model?: unknown;
  mount: MountOptions;
  /** A value to assign programmatically in the no-emission test. */
  programmatic: unknown;
  /** The event at which `host.value` is guaranteed updated (c-otp-input writes it after `update:value`). */
  valueSettledAt?: 'input' | 'update:value';
}

// The field panels open on a click anywhere in the c-input box. c-tree-select
// keeps its readonly combobox clipped (focusable, not visible), so the input
// itself is not an actionable click target for Playwright.
const openField = async (m: Mounted): Promise<void> => {
  await userEvent.click(m.shadow('c-input'));
  await settle();
};

const inner = (el: Element | null, selector: string): HTMLElement => {
  const found = el?.shadowRoot?.querySelector<HTMLElement>(selector) ?? null;

  if (!found)
    throw new Error(`kinds: no ${selector} inside <${el?.localName}>`);

  return found;
};

export const VALUE_RECIPES: Record<string, ValueRecipe> = {
  'c-accordion': {
    expected: 'a',
    family: 'changeValue',
    interact: async (m) => {
      await userEvent.click(
        inner(
          m.host.querySelector('c-accordion-item'),
          'button[part~="header"]',
        ),
      );
    },
    mount: {
      html:
        '<c-accordion-item value="a" heading="One">First</c-accordion-item>' +
        '<c-accordion-item value="b" heading="Two">Second</c-accordion-item>',
    },
    programmatic: 'b',
  },
  'c-autocomplete': {
    emptyAware: true,
    expected: 'fi',
    family: 'changeValue',
    interact: async (m) => {
      await openField(m);
      await userEvent.click(m.shadow('li[part~="item"]'));
    },
    mount: { html: OPTIONS, props: { label: 'Country' } },
    programmatic: 'se',
  },
  'c-button-group': {
    expected: 'b',
    family: 'change',
    interact: async (m) => {
      await userEvent.click(
        inner(m.host.querySelectorAll('c-button')[1], 'button'),
      );
    },
    mount: {
      html: '<c-button value="a">A</c-button><c-button value="b">B</c-button>',
      props: { label: 'Choice' },
    },
    programmatic: 'a',
  },
  'c-checkbox': {
    expected: true,
    family: 'changeValue',
    interact: async (m) => {
      await userEvent.click(m.part('label'));
    },
    model: false,
    mount: { props: { label: 'Accept' } },
    programmatic: true,
  },
  'c-modal': {
    expected: false,
    family: 'changeValue',
    interact: async () => {
      await userEvent.keyboard('{Escape}');
    },
    model: true,
    mount: {
      attrs: { 'aria-label': 'Dialog' },
      html: '<c-button>Ok</c-button>',
      props: { dismissable: true, value: true },
    },
    programmatic: false,
  },
  'c-otp-input': {
    expected: '1',
    family: 'otp',
    interact: async (m) => {
      await userEvent.type(m.shadow('input[part~="input"]'), '1');
    },
    mount: { props: { length: 1 } },
    programmatic: '2',
    valueSettledAt: 'input',
  },
  'c-pagination': {
    expected: (detail: unknown) =>
      (detail as { currentPage?: number }).currentPage === 2,
    family: 'changeValue',
    interact: async (m) => {
      await userEvent.click(
        m.deep('c-icon-button[aria-label="Next page"]', 'button'),
      );
    },
    model: { currentPage: 1, itemCount: 100, itemsPerPage: 25 },
    mount: {
      props: { value: { currentPage: 1, itemCount: 100, itemsPerPage: 25 } },
    },
    programmatic: { currentPage: 3, itemCount: 100, itemsPerPage: 25 },
  },
  'c-radio-group': {
    expected: 'b',
    family: 'changeValue',
    interact: async (m) => {
      await userEvent.click(m.host.querySelectorAll('c-radio')[1]);
    },
    mount: {
      html: '<c-radio value="a">A</c-radio><c-radio value="b">B</c-radio>',
      props: { label: 'Pick one' },
    },
    programmatic: 'a',
  },
  'c-select': {
    emptyAware: true,
    expected: 'fi',
    family: 'changeValue',
    interact: async (m) => {
      await openField(m);
      await userEvent.click(
        m.deep('c-dropdown', 'li[role="option"]:not([data-select-all])'),
      );
    },
    mount: { html: OPTIONS, props: { label: 'Country' } },
    programmatic: 'se',
  },
  'c-slider': {
    expected: 6,
    family: 'changeValue',
    interact: async (m) => {
      m.shadow('input[type="range"]').focus();
      await userEvent.keyboard('{ArrowRight}');
    },
    model: 5,
    mount: { props: { label: 'Volume', max: 10, min: 0, value: 5 } },
    programmatic: 3,
  },
  'c-switch': {
    expected: true,
    family: 'changeValue',
    interact: async (m) => {
      await userEvent.click(m.part('root'));
    },
    model: false,
    mount: { props: { label: 'Enabled' } },
    programmatic: true,
  },
  'c-tabs': {
    expected: 'two',
    family: 'changeValue',
    interact: async (m) => {
      await userEvent.click(m.host.querySelectorAll('c-tab')[1]);
    },
    model: 'one',
    mount: {
      html: '<c-tab value="one">One</c-tab><c-tab value="two">Two</c-tab>',
      props: { value: 'one' },
    },
    programmatic: 'one',
  },
  'c-text-field': {
    emptyAware: true,
    expected: 'a',
    family: 'changeValue',
    interact: async (m) => {
      await userEvent.type(m.shadow('input'), 'a');
    },
    mount: { props: { label: 'Name' } },
    programmatic: 'x',
  },
  'c-tree-select': {
    emptyAware: true,
    expected: 'a',
    family: 'change',
    interact: async (m) => {
      await openField(m);
      await userEvent.click(m.shadow('li[part~="item"]'));
    },
    mount: {
      props: {
        items: [
          { name: 'Alpha', value: 'a' },
          { name: 'Beta', value: 'b' },
        ],
        label: 'Field',
      },
    },
    programmatic: 'b',
  },
};

export interface OverlayRecipe {
  /** Extra expectations once Escape has closed the panel. */
  afterEscape?(m: Mounted): void;
  /** The element (light or shadow) that owns focus once the panel closes; `null` when focus must not move. */
  focusHome(m: Mounted): Element | null;
  /** Whether an outside pointerdown closes the panel. */
  lightDismiss: boolean;
  mount: MountOptions;
  /** The tag to mount when the overlay only exists inside a parent (c-menu-item inside c-menu). */
  mountTag?: string;
  /** Open the panel through its trigger. */
  open(m: Mounted): Promise<void>;
  /** The `[popover]` panel element. */
  panel(m: Mounted): HTMLElement;
}

const TRIGGER = '<c-button slot="trigger">Open</c-button>';

const triggerButton = (m: Mounted): HTMLElement =>
  inner(m.host.querySelector('c-button'), 'button');

export const OVERLAY_RECIPES: Record<string, OverlayRecipe> = {
  'c-autocomplete': {
    focusHome: (m) => m.shadow('input[role="combobox"]'),
    lightDismiss: true,
    mount: { html: OPTIONS, props: { label: 'Country' } },
    open: openField,
    panel: (m) => m.part('panel'),
  },
  'c-menu': {
    focusHome: (m) => m.host.querySelector('c-button'),
    lightDismiss: true,
    mount: {
      html: `${TRIGGER}<c-menu-item value="a">A</c-menu-item><c-menu-item value="b">B</c-menu-item>`,
    },
    open: async (m) => {
      await userEvent.click(triggerButton(m));
      await settle();
    },
    panel: (m) => m.part('panel'),
  },
  'c-menu-item': {
    // Escape peels the submenu only; the menu itself stays open.
    afterEscape: (m) => {
      if (!m.part('panel').matches(':popover-open'))
        throw new Error('Escape closed the whole menu');
    },
    focusHome: (m) => m.host.querySelector('c-menu-item'),
    lightDismiss: false,
    mount: {
      html: `${TRIGGER}<c-menu-item value="p">Parent<c-menu-item slot="submenu" value="s">Sub</c-menu-item></c-menu-item>`,
    },
    mountTag: 'c-menu',
    open: async (m) => {
      await userEvent.click(triggerButton(m));
      await settle();
      await userEvent.click(m.host.querySelector('c-menu-item')!);
      await settle();
    },
    panel: (m) =>
      inner(m.host.querySelector('c-menu-item'), '[part~="submenu-panel"]'),
  },
  'c-popover': {
    focusHome: (m) => m.host.querySelector('c-button'),
    lightDismiss: true,
    mount: { html: `${TRIGGER}<p>Body</p>`, props: { heading: 'Settings' } },
    open: async (m) => {
      await userEvent.click(triggerButton(m));
      await settle();
    },
    panel: (m) => m.part('panel'),
  },
  'c-tooltip': {
    focusHome: () => null,
    lightDismiss: false,
    mount: {
      html: '<c-button slot="trigger">Hover</c-button>',
      props: { delay: 0, text: 'Hint' },
    },
    open: async (m) => {
      await userEvent.hover(triggerButton(m));
      await settle();
    },
    panel: (m) => m.part('panel'),
  },
  'c-tree-select': {
    focusHome: (m) => m.shadow('input[role="combobox"]'),
    lightDismiss: true,
    mount: VALUE_RECIPES['c-tree-select'].mount,
    open: openField,
    panel: (m) => m.part('panel'),
  },
};
