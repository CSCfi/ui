/**
 * Behaviour spec for c-status (ADR-0087): the appearance, marker and size
 * axes, the haloed status icon, the slotted icon that replaces the marker,
 * app defaults, and the contrast the colour gate signed off.
 */
import { mdiArchive } from '@mdi/js';
import { afterEach, describe, expect, it } from 'vitest';

import { applyDefaults, resetDefaults } from '../../shared/appDefaults';
import { STATUS_ICONS } from '../../shared/statusIcons';
import {
  contrastRatio,
  defineAll,
  matchScreenshotInBothModes,
  mount,
  roleInMode,
  setThemeMode,
  settle,
} from '../../test/harness';

const TYPES = ['error', 'info', 'success', 'warning'] as const;

const hidden = (el: HTMLElement): boolean =>
  getComputedStyle(el).display === 'none';

const height = (el: HTMLElement): number => el.getBoundingClientRect().height;

describe('c-status', () => {
  afterEach(() => {
    resetDefaults();
    setThemeMode('light');
  });

  it('draws no marker unless one is set', async () => {
    const { part } = await mount('c-status', {
      attrs: { type: 'success' },
      html: 'Active',
    });

    expect(hidden(part('marker'))).toBe(true);
  });

  it('marker="icon" draws the status icon on a halo, hidden from assistive technology', async () => {
    for (const type of TYPES) {
      const { part, unmount } = await mount('c-status', {
        attrs: { marker: 'icon', type },
        html: type,
      });

      const marker = part('marker');

      expect(hidden(marker), type).toBe(false);
      expect(marker.getAttribute('aria-hidden'), type).toBe('true');
      expect(marker.querySelector('path')?.getAttribute('d'), type).toBe(
        STATUS_ICONS[type],
      );
      expect(getComputedStyle(marker).width, type).toBe('18px');

      unmount();
    }
  });

  it('a neutral pill’s icon marker is a dot in the halo', async () => {
    const { part } = await mount('c-status', {
      attrs: { marker: 'icon' },
      html: 'Draft',
    });

    const marker = part('marker');

    expect(marker.querySelector('svg')).toBeNull();
    expect(getComputedStyle(marker).width).toBe('18px');
    expect(marker.querySelector('span')).not.toBeNull();
  });

  it('marker="dot" draws a dot in the status fill colour', async () => {
    for (const type of TYPES) {
      const { part, unmount } = await mount('c-status', {
        attrs: { marker: 'dot', type },
        html: type,
      });

      const dot = getComputedStyle(part('marker'));

      expect(dot.width, type).toBe('8px');
      expect(dot.backgroundColor, type).toBe(
        roleInMode('light', `--c-${type}`),
      );

      unmount();
    }
  });

  it('sizes the pill 20, 24 and 32px tall, with the halo to match', async () => {
    for (const [size, pill, halo] of [
      ['small', 20, '14px'],
      ['default', 24, '18px'],
      ['large', 32, '24px'],
    ] as const) {
      const { part, unmount } = await mount('c-status', {
        attrs: { marker: 'icon', size, type: 'info' },
        html: 'Pending',
      });

      expect(height(part('root')), size).toBe(pill);
      expect(getComputedStyle(part('marker')).width, size).toBe(halo);

      unmount();
    }
  });

  it('outlined keeps the ground behind it and inks the text on-surface', async () => {
    const { part } = await mount('c-status', {
      attrs: { appearance: 'outlined', type: 'error' },
      html: 'Failed',
    });

    const root = getComputedStyle(part('root'));

    expect(root.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(root.color).toBe(roleInMode('light', '--c-on-surface'));
  });

  it('unknown attribute values fall back to the built-ins', async () => {
    const plain = await mount('c-status', { html: 'Draft' });

    const expected = getComputedStyle(plain.part('root')).backgroundColor;

    plain.unmount();

    const { part } = await mount('c-status', {
      attrs: {
        appearance: 'ghost',
        marker: 'star',
        size: 'huge',
        type: 'urgent',
      },
      html: 'Draft',
    });

    expect(getComputedStyle(part('root')).backgroundColor).toBe(expected);
    expect(height(part('root'))).toBe(24);
    expect(hidden(part('marker'))).toBe(true);
  });

  describe('a slotted icon', () => {
    const icon = `<c-icon slot="icon" path="${mdiArchive}"></c-icon>`;

    it('replaces the marker, whatever marker says', async () => {
      for (const marker of ['none', 'dot', 'icon']) {
        const { part, unmount } = await mount('c-status', {
          attrs: { marker, type: 'info' },
          html: `${icon}Archived`,
        });

        const box = part('marker');

        expect(hidden(box), marker).toBe(false);
        expect(getComputedStyle(box).width, marker).toBe('18px');
        // The halo holds the slotted icon, not the status glyph.
        expect(box.querySelector('svg'), marker).toBeNull();

        unmount();
      }
    });

    it('is sized to the pill, whatever its own size says', async () => {
      const svg = `<svg slot="icon" viewBox="0 0 24 24"><path d="${mdiArchive}" /></svg>`;

      for (const [size, px] of [
        ['small', 11],
        ['default', 14],
        ['large', 18],
      ] as const) {
        for (const [kind, html] of [
          [
            'c-icon',
            `<c-icon slot="icon" path="${mdiArchive}" size="24"></c-icon>`,
          ],
          ['svg', svg],
        ] as const) {
          const { host, part, unmount } = await mount('c-status', {
            attrs: { size, type: 'info' },
            html: `${html}Archived`,
          });

          const slotted = host.querySelector('c-icon')
            ? host.querySelector('c-icon')!.shadowRoot!.querySelector('svg')!
            : host.querySelector('svg')!;

          const box = slotted.getBoundingClientRect();

          const halo = part('marker').getBoundingClientRect();

          expect([box.width, box.height], `${size} ${kind}`).toEqual([px, px]);
          // Centred in the halo, not spilling out of it.
          expect(box.left - halo.left, `${size} ${kind}`).toBe(
            (halo.width - px) / 2,
          );

          unmount();
        }
      }
    });

    it('replaces an app-wide dot', async () => {
      applyDefaults({ 'c-status': { marker: 'dot' } });

      const { part } = await mount('c-status', {
        attrs: { type: 'info' },
        html: `${icon}Archived`,
      });

      expect(getComputedStyle(part('marker')).width).toBe('18px');
    });

    it('hands the marker back when it is removed, and takes it again when added', async () => {
      const { host, part } = await mount('c-status', {
        attrs: { marker: 'dot', type: 'info' },
        html: `${icon}Archived`,
      });

      const slotted = host.querySelector('c-icon')!;

      slotted.remove();
      await settle();

      expect(getComputedStyle(part('marker')).width).toBe('8px');

      host.prepend(slotted);
      await settle();

      expect(getComputedStyle(part('marker')).width).toBe('18px');
    });
  });

  describe('app defaults', () => {
    it('set the house style for every pill', async () => {
      applyDefaults({
        'c-status': { appearance: 'outlined', marker: 'dot', size: 'small' },
      });

      const { part } = await mount('c-status', {
        attrs: { type: 'success' },
        html: 'Active',
      });

      expect(getComputedStyle(part('root')).backgroundColor).toBe(
        'rgba(0, 0, 0, 0)',
      );
      expect(height(part('root'))).toBe(20);
      expect(hidden(part('marker'))).toBe(false);
    });

    it('give way to an instance, so marker="none" opts one pill out', async () => {
      applyDefaults({ 'c-status': { marker: 'icon' } });

      const { part } = await mount('c-status', {
        attrs: { marker: 'none', type: 'success' },
        html: 'Active',
      });

      expect(hidden(part('marker'))).toBe(true);
    });
  });

  // The colour gate's figures (ADR-0087): every label at AA, every icon at
  // 3:1 against its halo. The dot is decoration and is not held to 3:1.
  it('holds its text at AA and its icon at 3:1 in both modes', async () => {
    for (const mode of ['light', 'dark'] as const) {
      setThemeMode(mode);

      for (const appearance of ['filled', 'outlined'] as const) {
        for (const type of ['', ...TYPES]) {
          const label = `${mode} ${appearance} ${type || 'neutral'}`;

          const { part, unmount } = await mount('c-status', {
            attrs: { appearance, marker: 'icon', type },
            html: 'Label',
          });

          const root = getComputedStyle(part('root'));

          const ground =
            appearance === 'filled'
              ? root.backgroundColor
              : roleInMode(mode, '--c-surface');

          expect(
            contrastRatio(root.color, ground),
            label,
          ).toBeGreaterThanOrEqual(4.5);

          const marker = part('marker');

          const ink = getComputedStyle(
            marker.querySelector('svg') ?? marker.querySelector('span')!,
          );

          expect(
            contrastRatio(
              type ? ink.color : ink.backgroundColor,
              getComputedStyle(marker).backgroundColor,
            ),
            label,
          ).toBeGreaterThanOrEqual(3);

          unmount();
        }
      }
    }
  });

  it('matches its visual baseline in both theme modes', async () => {
    defineAll();

    const types: [string, string][] = [
      ['', 'Draft'],
      ['info', 'Pending'],
      ['success', 'Active'],
      ['warning', 'Expiring'],
      ['error', 'Failed'],
    ];

    const row = (attrs: string): string =>
      types
        .map(
          ([type, text]) =>
            `<c-status ${attrs}${type ? ` type="${type}"` : ''}>${text}</c-status>`,
        )
        .join('');

    const rows = (['filled', 'outlined'] as const).flatMap((appearance) =>
      ['none', 'dot', 'icon'].map((marker) =>
        row(`appearance="${appearance}" marker="${marker}"`),
      ),
    );

    const sizes = (['small', 'default', 'large'] as const)
      .map(
        (size) =>
          `<c-status size="${size}" marker="icon" type="success">Active</c-status>` +
          `<c-status size="${size}" marker="dot" appearance="outlined" type="warning">Expiring</c-status>`,
      )
      .join('');

    const slotted =
      `<c-status marker="dot" type="info"><c-icon slot="icon" path="${mdiArchive}"></c-icon>Archived</c-status>` +
      `<c-status appearance="outlined" marker="icon"><c-icon slot="icon" path="${mdiArchive}"></c-icon>Archived</c-status>`;

    const matrix = document.createElement('div');

    matrix.style.cssText =
      'display:inline-grid;grid-template-columns:repeat(5,max-content);gap:8px;align-items:center;justify-items:start;padding:8px;background:var(--c-surface)';
    matrix.innerHTML = [...rows, sizes, slotted].join('');
    document.body.append(matrix);

    await customElements.whenDefined('c-status');
    await settle();

    await matchScreenshotInBothModes(matrix, 'matrix');

    matrix.remove();
  });
});
