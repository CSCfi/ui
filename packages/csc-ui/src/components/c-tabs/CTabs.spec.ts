/**
 * Behaviour spec for c-tabs pairing each tab with its panel: `aria-controls`
 * on the tab and `aria-labelledby` on the panel need both ids, and an id the
 * consumer set on a tab or a panel used to be replaced by a generated one.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  chromiumOnly,
  mount,
  recordEvents,
  settled,
  withMotion,
} from '../../test/harness';

const panel = (value: string, id = '') =>
  `<c-tab-item value="${value}"${id ? ` id="${id}"` : ''}>${value}</c-tab-item>`;

const tab = (value: string, id = '') =>
  `<c-tab value="${value}"${id ? ` id="${id}"` : ''}>${value}</c-tab>`;

describe('tab and panel ids', () => {
  it('keeps the ids the consumer set, and pairs tab and panel with them', async () => {
    const { host } = await mount('c-tabs', {
      html: `${tab('one', 'my-tab') + tab('two')}<c-tab-items>${panel(
        'one',
        'my-panel',
      )}${panel('two')}</c-tab-items>`,
      props: { value: 'one' },
    });
    await settled();

    const [first, second] = host.querySelectorAll('c-tab');

    const [firstPanel, secondPanel] = host.querySelectorAll('c-tab-item');

    expect(first.id).toBe('my-tab');
    expect(firstPanel.id).toBe('my-panel');
    expect(first.getAttribute('aria-controls')).toBe('my-panel');
    expect(firstPanel.getAttribute('aria-labelledby')).toBe('my-tab');

    // The others get generated ids, paired the same way.
    expect(second.id).not.toBe('');
    expect(second.getAttribute('aria-controls')).toBe(secondPanel.id);
    expect(secondPanel.getAttribute('aria-labelledby')).toBe(second.id);
  });

  it('gives a tab added in front an id no other tab has', async () => {
    const { host } = await mount('c-tabs', {
      html: `${tab('one') + tab('two')}<c-tab-items>${panel('one')}${panel('two')}</c-tab-items>`,
      props: { value: 'one' },
    });
    await settled();

    host.insertAdjacentHTML('afterbegin', tab('zero'));
    host
      .querySelector('c-tab-items')!
      .insertAdjacentHTML('afterbegin', panel('zero'));
    (host as { value?: string } & HTMLElement).value = 'zero';
    await settled();

    const ids = [...host.querySelectorAll('c-tab, c-tab-item')].map(
      (el) => el.id,
    );

    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('panels', () => {
  it('slides the new panel in, then rests with it in view', () =>
    withMotion(async () => {
      const { host } = await mount('c-tabs', {
        html: `${tab('one') + tab('two') + tab('three')}<c-tab-items slot="items">${
          panel('one') + panel('two') + panel('three')
        }</c-tab-items>`,
        props: { value: 'one' },
      });

      // Panels switch without the slide while the tab set settles after mount.
      await new Promise((resolve) => setTimeout(resolve, 600));

      const items = host.querySelector('c-tab-items')!;

      const track = items.shadowRoot!.querySelector('[part~="root"]')!;

      (host.querySelectorAll('c-tab')[2] as HTMLElement).click();
      await new Promise(requestAnimationFrame);

      expect(getComputedStyle(track).translate).not.toBe('none');

      await new Promise((resolve) => setTimeout(resolve, 400));

      const shown = host.querySelectorAll('c-tab-item')[2]!;

      expect(getComputedStyle(track).translate).toBe('none');
      expect(shown.getBoundingClientRect().left).toBe(
        items.getBoundingClientRect().left,
      );
      expect(shown.getBoundingClientRect().width).toBeGreaterThan(0);
    }));

  it('a modal in a panel covers the viewport, not the panel', async () => {
    const { host } = await mount('c-tabs', {
      html:
        `${tab('one') + tab('two')}<c-tab-items slot="items">${panel('one')}` +
        '<c-tab-item value="two"><c-modal aria-label="Edit"><p>Modal body</p></c-modal></c-tab-item>' +
        '</c-tab-items>',
      props: { value: 'two' },
    });
    await settled();

    const modal = host.querySelector('c-modal') as {
      value?: boolean;
    } & HTMLElement;

    modal.value = true;
    await settled();

    const backdrop = modal
      .shadowRoot!.querySelector('[part~="backdrop"]')!
      .getBoundingClientRect();

    expect([
      backdrop.left,
      backdrop.top,
      backdrop.width,
      backdrop.height,
    ]).toEqual([0, 0, window.innerWidth, window.innerHeight]);
  });
});

describe('tab row', () => {
  const MANY = Array.from({ length: 12 }, (_, i) => `settings-${i}`);

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const mountMany = (attrs: Record<string, boolean | string> = {}) =>
    mount('c-tabs', {
      attrs,
      html: `${MANY.map((v) => tab(v)).join('')}<c-tab-items slot="items">${MANY.map(
        (v) => panel(v),
      ).join('')}</c-tab-items>`,
      props: { value: MANY[0] },
    });

  /** A tab set settled after mount, then narrowed until its row overflows. */
  const mountRow = async (attrs: Record<string, boolean | string> = {}) => {
    const m = await mountMany(attrs);

    await wait(400);
    m.stage.style.cssText = 'display:block;width:320px';
    // The row re-measures 200ms after a resize.
    await wait(400);
    expect(m.host.classList.contains('c-tabs--overflow')).toBe(true);

    return m;
  };

  const touch = (
    el: HTMLElement,
    type: string,
    clientX: number,
    clientY: number,
  ): boolean => {
    const point = new Touch({ clientX, clientY, identifier: 1, target: el });

    return el.dispatchEvent(
      new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        changedTouches: [point],
        composed: true,
        touches: type === 'touchend' ? [] : [point],
      }),
    );
  };

  it('re-measures a resize that lands while the indicator moves', async () => {
    const m = await mountMany();

    // Right after mount the indicator's first move is still pending.
    m.stage.style.cssText = 'display:block;width:320px';
    await wait(400);

    expect(m.host.classList.contains('c-tabs--overflow')).toBe(true);
  });

  it('disable-animation keeps the row from animating its scroll', async () => {
    const m = await mountRow({ 'disable-animation': true });

    (m.host.querySelectorAll('c-tab')[11] as HTMLElement).click();
    await settled();

    expect(
      getComputedStyle(m.part('tabs')).getPropertyValue(
        '--_c-tabs-transition-speed',
      ),
    ).not.toBe('200ms');
  });

  chromiumOnly(
    'builds its touch events with the Touch constructor, which desktop Firefox lacks',
  )('a vertical swipe on the row is left to the page', async () => {
    const m = await mountRow();

    const row = m.part('tabs');

    touch(row, 'touchstart', 100, 20);

    expect(touch(row, 'touchmove', 104, 80), 'vertical').toBe(true);
    touch(row, 'touchend', 104, 80);

    touch(row, 'touchstart', 100, 20);

    expect(touch(row, 'touchmove', 40, 24), 'horizontal').toBe(false);
    touch(row, 'touchend', 40, 24);
  });

  it('keeps focus in a panel while the row re-measures', async () => {
    const { host, stage } = await mount('c-tabs', {
      html: `${tab('one') + tab('two')}<c-tab-items slot="items"><c-tab-item value="one"><input aria-label="Name"></c-tab-item>${panel(
        'two',
      )}</c-tab-items>`,
      props: { value: 'one' },
    });

    stage.style.cssText = 'display:block;width:600px';
    await new Promise((resolve) => setTimeout(resolve, 400));

    const input = host.querySelector('input')!;

    input.focus();
    await userEvent.keyboard('a');
    stage.style.width = '500px';
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(document.activeElement).toBe(input);
  });
});

describe('APG tabs', () => {
  const tabs = (m: { host: HTMLElement }): HTMLElement[] => [
    ...m.host.querySelectorAll<HTMLElement>('c-tab'),
  ];

  const mountSet = (
    attrs: Record<string, boolean | string> = {},
    value = 'one',
    extra = '',
  ) =>
    mount('c-tabs', {
      attrs,
      html: `${tab('one') + tab('two')}${extra}${tab('three')}<c-tab-items slot="items">${
        panel('one') + panel('two') + panel('three')
      }</c-tab-items>`,
      props: { value },
    });

  it('the tab row is the tablist; arrows and panels are outside it', async () => {
    const m = await mountSet({ 'aria-label': 'Project views' });
    await settled();

    const tablist = m.shadow('[role="tablist"]');

    expect(m.host.hasAttribute('role')).toBe(false);
    expect(tablist.getAttribute('aria-label')).toBe('Project views');
    expect(tablist.querySelector('slot[name="items"]')).toBeNull();
    expect(tablist.querySelector('c-icon-button')).toBeNull();
    expect(
      tabs(m).every((t) => t.assignedSlot?.closest('[role="tablist"]')),
    ).toBe(true);
  });

  it('marks a vertical tablist with aria-orientation', async () => {
    const m = await mountSet({ vertical: true });
    await settled();

    expect(m.shadow('[role="tablist"]').getAttribute('aria-orientation')).toBe(
      'vertical',
    );
  });

  it('arrows, Home and End move focus over enabled tabs; Enter selects', async () => {
    const m = await mountSet(
      {},
      'one',
      '<c-tab value="off" disabled>off</c-tab>',
    );
    await settled();

    const events = recordEvents(m.host, ['change']);

    const focused = () => document.activeElement?.getAttribute('value');

    tabs(m)[0]!.focus();
    await userEvent.keyboard('{ArrowRight}');
    await settled();
    expect(focused()).toBe('two');

    // The disabled tab is skipped.
    await userEvent.keyboard('{ArrowRight}');
    await settled();
    expect(focused()).toBe('three');

    await userEvent.keyboard('{Home}');
    await settled();
    expect(focused()).toBe('one');

    await userEvent.keyboard('{End}');
    await settled();
    expect(focused()).toBe('three');

    // Moving focus selects nothing; Enter does.
    expect(events.records).toEqual([]);
    await userEvent.keyboard('{Enter}');
    await settled();
    expect(events.records.map((r) => r.detail)).toEqual(['three']);
  });

  it('Up and Down move focus in the vertical layout', async () => {
    const m = await mountSet({ vertical: true });
    await settled();

    tabs(m)[0]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    await settled();

    expect(document.activeElement?.getAttribute('value')).toBe('two');
  });

  it('a disabled tab is announced as disabled, not hidden', async () => {
    const m = await mountSet(
      {},
      'one',
      '<c-tab value="off" disabled>off</c-tab>',
    );
    await settled();

    const off = m.host.querySelector('c-tab[value="off"]')!;

    expect(off.getAttribute('aria-disabled')).toBe('true');
    expect(off.hasAttribute('aria-hidden')).toBe(false);
  });

  it('with no tab matching the value, the first enabled tab is the Tab stop', async () => {
    const m = await mountSet({}, 'nothing');
    await settled();

    expect(tabs(m).map((t) => t.getAttribute('tabindex'))).toEqual([
      '0',
      '-1',
      '-1',
    ]);
  });
});
