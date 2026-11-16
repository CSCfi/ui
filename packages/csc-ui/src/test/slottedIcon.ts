/**
 * The icon-slot size contract c-button, c-icon-button, c-menu-item,
 * c-accordion-item and c-breadcrumb-item share (c-icon's SIZE HOOKS): the
 * slot sizes a `c-icon` that sets no `size`, and a plain `<svg>`, to its own
 * icon size; a `c-icon` with a `size`, set as an attribute or a property,
 * keeps it. Run from each one's spec.
 */
import { mdiStar } from '@mdi/js';
import { expect } from 'vitest';

import { mount, settle } from './harness';

/** The drawn box of the element's slotted icon: a `c-icon`'s own svg, or a plain one. */
export const slottedIconBox = (host: Element): DOMRect => {
  const icon = host.querySelector('c-icon');

  return (
    icon ? icon.shadowRoot!.querySelector('svg')! : host.querySelector('svg')!
  ).getBoundingClientRect();
};

interface SlottedIconOptions {
  /** Attributes of the element under test, such as its `size`. */
  attrs?: Record<string, string>;

  /** Text beside the icon. */
  label?: string;

  /** The slot the icon goes in; `default` for the element's own content. */
  slot?: string;
}

/**
 * Mounts `tag` with each kind of icon and expects the drawn size: `px` for a
 * `c-icon` without `size` and for a plain `<svg>`, 16 for a `c-icon` given
 * `size="16"` or `.size = 16`.
 */
export const expectSlottedIconSize = async (
  tag: string,
  px: number,
  { attrs = {}, label = 'Label', slot = 'icon' }: SlottedIconOptions = {},
): Promise<void> => {
  const slotAttr = slot === 'default' ? '' : ` slot="${slot}"`;

  const icon = `<c-icon${slotAttr} path="${mdiStar}"></c-icon>`;

  const cases = [
    ['c-icon', icon, px],
    ['c-icon size="16"', icon.replace('></', ' size="16"></'), 16],
    [
      'svg',
      `<svg${slotAttr} viewBox="0 0 24 24"><path d="${mdiStar}" /></svg>`,
      px,
    ],
  ] as const;

  for (const [kind, html, expected] of cases) {
    const name = `${tag} ${JSON.stringify(attrs)} ${kind}`;

    const { host, unmount } = await mount(tag, {
      attrs,
      html: `${html}${label}`,
    });

    const box = slottedIconBox(host);

    expect([box.width, box.height], name).toEqual([expected, expected]);

    // A framework sets `size` as a property.
    if (kind === 'c-icon') {
      Object.assign(host.querySelector('c-icon')!, { size: 16 });
      await settle();

      const sized = slottedIconBox(host);

      expect([sized.width, sized.height], `${name} .size = 16`).toEqual([
        16, 16,
      ]);
    }

    unmount();
  }
};
