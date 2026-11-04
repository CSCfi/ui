/**
 * Behaviour spec for c-alert's close button (glossary Closeable): `closeable`
 * renders it, pressing it fires `close`, and the alert stays put — removing
 * it is the consumer's job. An unset `type` is the neutral look, as on
 * c-status, and only a status type shows an icon. Warning and error differ by
 * hue.
 */
import { converter } from 'culori';
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { over, rasterise, tintOf } from '../../test/conformance/paint';
import {
  contrastRatio,
  defineAll,
  mount,
  parkPointer,
  recordEvents,
  roleInMode,
  setThemeMode,
  settle,
  settled,
} from '../../test/harness';

const oklch = converter('oklch');

it('closeable renders a close button that fires close', async () => {
  const m = await mount('c-alert', {
    attrs: { closeable: true },
    html: 'Maintenance on Saturday.',
  });

  const events = recordEvents(m.host, ['close']);

  await userEvent.click(m.part('close'));
  await settle();

  expect(events.records).toHaveLength(1);
  expect(m.host.isConnected).toBe(true);
});

it('renders no close button unless closeable', async () => {
  const m = await mount('c-alert', { html: 'Maintenance on Saturday.' });

  expect(m.host.shadowRoot!.querySelector('[part~="close"]')).toBeNull();
});

it('an unset or unknown type is the neutral look, announced politely', async () => {
  const neutral = await mount('c-alert', { html: 'Note' });

  const unknown = await mount('c-alert', {
    attrs: { type: 'default' },
    html: 'Note',
  });

  for (const m of [neutral, unknown]) {
    expect(m.host.getAttribute('role')).toBe('status');
    expect(m.part('root').className).toContain('border-l-primary');
  }
});

it('shows an icon for a status type and none for an unset or unknown type', async () => {
  for (const type of ['error', 'info', 'success', 'warning']) {
    const m = await mount('c-alert', { attrs: { type }, html: 'Note' });

    expect(
      m.part('icon').querySelector('path')!.getAttribute('d'),
      type,
    ).not.toBe('');
  }

  const neutral = await mount('c-alert', { html: 'Note' });

  const unknown = await mount('c-alert', {
    attrs: { type: 'default' },
    html: 'Note',
  });

  for (const m of [neutral, unknown]) {
    expect(m.host.shadowRoot!.querySelector('[part~="icon"]')).toBeNull();
  }
});

// The warning and error families sat 11° of hue apart (orange #ff5800 against
// red #dd0c0c) and read alike, salmon on salmon in dark mode. Their accent
// edges must be told apart by hue alone.
it('tells a warning from an error by hue in both modes', async () => {
  for (const mode of ['light', 'dark'] as const) {
    setThemeMode(mode);

    const hue = async (type: string) => {
      const m = await mount('c-alert', { attrs: { type }, html: 'Note' });

      return oklch(getComputedStyle(m.part('root')).borderLeftColor)!
        .h as number;
    };

    const apart = Math.abs((await hue('warning')) - (await hue('error')));

    expect(Math.min(apart, 360 - apart), mode).toBeGreaterThanOrEqual(45);
  }
});

// The box's tint is opaque, the type's colour mixed into the page surface
// (ADR-0082). See-through, it let the page canvas under it decide the
// heading's contrast: success read 4.29:1 on the light canvas (sunken).
it('reads its heading at AA on every surface rung, in both modes', async () => {
  for (const mode of ['light', 'dark'] as const) {
    setThemeMode(mode);

    for (const rung of [
      'surface',
      'surface-raised',
      'surface-overlay',
      'surface-muted',
      'surface-sunken',
    ]) {
      const ground = roleInMode(mode, `--c-${rung}`);

      for (const type of ['neutral', 'info', 'success', 'warning', 'error']) {
        const m = await mount('c-alert', {
          attrs: { heading: 'Quota', type },
          html: 'Your quota resets on 1 December.',
        });

        m.stage.style.background = ground;

        const box = getComputedStyle(m.part('root')).backgroundColor;

        expect(
          contrastRatio(
            getComputedStyle(m.part('heading')).color,
            over(box, ground),
          ),
          `${mode} ${rung} ${type}`,
        ).toBeGreaterThanOrEqual(4.5);

        document.body.replaceChildren();
      }
    }
  }
});

// A button in the message tints into the alert's box at half its share: mixed
// into the page surface, its patch matched the box and nearly disappeared
// (1.06:1 in a dark success alert).
it('tints a button in its message into its box at half share, at AA, in both modes', async () => {
  defineAll();

  for (const mode of ['light', 'dark'] as const) {
    setThemeMode(mode);

    const m = await mount('c-alert', {
      attrs: { type: 'success' },
      html: '<c-button appearance="ghost" variant="primary">Open</c-button><c-button appearance="text" variant="primary">Dismiss</c-button>',
    });

    await settle();

    const box = getComputedStyle(m.part('root')).backgroundColor;

    const root = (appearance: string) =>
      m.host
        .querySelector(`c-button[appearance="${appearance}"]`)!
        .shadowRoot!.querySelector<HTMLElement>('[part~="root"]')!;

    const ghost = getComputedStyle(root('ghost'));

    expect(rasterise(ghost.backgroundColor), `${mode} ghost`).toEqual(
      tintOf('primary', 7, box),
    );
    expect(
      contrastRatio(ghost.color, ghost.backgroundColor),
      `${mode} ghost`,
    ).toBeGreaterThanOrEqual(4.5);

    await userEvent.hover(root('text'));
    await settled();

    const text = getComputedStyle(root('text'));

    expect(rasterise(text.backgroundColor), `${mode} text hovered`).toEqual(
      tintOf('primary', 10, box),
    );
    expect(
      contrastRatio(text.color, text.backgroundColor),
      `${mode} text hovered`,
    ).toBeGreaterThanOrEqual(4.5);

    await parkPointer();
    document.body.replaceChildren();
  }
});
