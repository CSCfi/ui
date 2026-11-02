/**
 * Behaviour spec for c-modal (CONTEXT.md "Modal stack", "Active modal",
 * "Backdrop", "Dismissable"; ADR-0014). Seeded from 5e501b96: initial focus
 * ran before slotted custom elements had upgraded, and the native dialog
 * showed a UA focus ring as the fallback focus target.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import {
  consoleSpy,
  deepActiveElement,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
} from '../../test/harness';

type ModalHost = { value: boolean } & HTMLElement;

const ACTIONS =
  '<c-card><c-card-actions><c-button>Cancel</c-button><c-button id="delete">Delete</c-button></c-card-actions></c-card>';

const VALUE_EVENTS = ['change', 'update:value'] as const;

const mountModal = (props: Record<string, unknown> = {}, html = ACTIONS) =>
  mount<ModalHost>('c-modal', {
    attrs: { 'aria-label': 'Confirm' },
    html,
    props: { dismissable: true, value: true, ...props },
    stage: false,
  });

const dialog = (m: Mounted): HTMLDialogElement =>
  m.part('root') as HTMLDialogElement;

const innerButton = (el: Element | null): HTMLElement | null =>
  el?.shadowRoot?.querySelector('button') ?? null;

describe('initial focus', () => {
  it('opened at mount, focuses the first focusable once slotted elements have upgraded', async () => {
    const m = await mountModal();

    expect(dialog(m).open).toBe(true);
    expect(deepActiveElement()).toBe(
      innerButton(m.host.querySelector('c-button')),
    );

    await matchScreenshotInBothModes(dialog(m), 'open');
  });

  it('prefers the [autofocus] element', async () => {
    const m = await mountModal(
      {},
      ACTIONS.replace('id="delete"', 'id="delete" autofocus'),
    );

    expect(deepActiveElement()).toBe(
      innerButton(m.host.querySelector('#delete')),
    );
  });

  it('falls back to the dialog itself, without a focus ring', async () => {
    const m = await mountModal({}, '<p>Nothing to focus here.</p>');

    expect(deepActiveElement()).toBe(dialog(m));
    expect(getComputedStyle(dialog(m)).outlineStyle).toBe('none');
  });
});

describe('dismissal', () => {
  it('Escape closes, dismissable or not', async () => {
    const m = await mountModal({ dismissable: false });

    const events = recordEvents(m.host, VALUE_EVENTS);

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(dialog(m).open).toBe(false);
    expect(events.of('update:value')[0]?.detail).toBe(false);
  });

  it('dismissable: a backdrop click closes', async () => {
    const m = await mountModal();

    const events = recordEvents(m.host, VALUE_EVENTS);

    await userEvent.click(m.part('backdrop'), { position: { x: 4, y: 4 } });
    await settle();

    expect(dialog(m).open).toBe(false);
    expect(events.of('update:value')[0]?.detail).toBe(false);
  });

  // `dialog.close()` fires `close` a task later: the native listener used to
  // take the modal's own close for a platform one and dispatch again.
  it('emits false once per dismissal', async () => {
    const m = await mountModal();

    const events = recordEvents(m.host, VALUE_EVENTS);

    await userEvent.keyboard('{Escape}');
    await settle(60);

    expect(events.of('update:value').map((r) => r.detail)).toEqual([false]);
    expect(events.of('change').map((r) => r.detail)).toEqual([false]);
  });

  it('emits nothing when value closes it', async () => {
    const m = await mountModal();

    const events = recordEvents(m.host, VALUE_EVENTS);

    (m.host as { value?: boolean } & HTMLElement).value = false;
    await settle(60);

    expect(dialog(m).open).toBe(false);
    expect(events.records).toEqual([]);
  });

  it('non-dismissable: the backdrop nudges instead of closing', async () => {
    const m = await mountModal({ dismissable: false });

    const events = recordEvents(m.host, VALUE_EVENTS);

    await userEvent.click(m.part('backdrop'), { position: { x: 4, y: 4 } });

    expect(dialog(m).classList.contains('nudging')).toBe(true);
    expect(dialog(m).open).toBe(true);
    expect(events.records).toEqual([]);
  });

  it('a platform close converges: value false emitted, scroll lock released', async () => {
    const m = await mountModal();

    const events = recordEvents(m.host, VALUE_EVENTS);

    expect(document.documentElement.style.overflow).toBe('hidden');

    dialog(m).close();
    await settle();

    expect(events.of('update:value').map((r) => r.detail)).toEqual([false]);
    expect(document.documentElement.style.overflow).toBe('');
  });
});

describe('modal stack', () => {
  it('the active modal owns Escape and the backdrop; siblings are inert except toasts; focus restores to the opener', async () => {
    const opener = document.createElement('button');

    const toasts = document.createElement('c-toasts');

    const sibling = document.createElement('p');

    opener.textContent = 'Open';
    sibling.textContent = 'Page content';
    document.body.append(opener, toasts, sibling);
    opener.focus();

    const first = await mountModal({}, '<c-button>One</c-button>');

    const second = await mountModal({}, '<c-button>Two</c-button>');

    expect(sibling.inert).toBe(true);
    expect(opener.inert).toBe(true);
    expect(toasts.inert).toBe(false);
    expect(first.host.inert).toBe(true);
    expect(document.documentElement.style.overflow).toBe('hidden');

    const z = (m: Mounted) => Number(getComputedStyle(dialog(m)).zIndex);

    expect(z(second)).toBeGreaterThan(z(first));
    expect(getComputedStyle(second.part('backdrop')).opacity).toBe('1');
    expect(getComputedStyle(first.part('backdrop')).opacity).toBe('0');

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(dialog(second).open).toBe(false);
    expect(dialog(first).open).toBe(true);
    expect(first.host.inert).toBe(false);
    expect(deepActiveElement()).toBe(
      innerButton(first.host.querySelector('c-button')),
    );

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(dialog(first).open).toBe(false);
    expect(sibling.inert).toBe(false);
    expect(document.documentElement.style.overflow).toBe('');
    expect(deepActiveElement()).toBe(opener);
  });
});

it('warns once when opened without an accessible name', async () => {
  await mount<ModalHost>('c-modal', {
    html: '<c-button>Ok</c-button>',
    props: { value: true },
    stage: false,
  });

  expect(consoleSpy.expect(/opened without an accessible name/).level).toBe(
    'warn',
  );
});
