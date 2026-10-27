/**
 * Behaviour spec for c-tabs pairing each tab with its panel: `aria-controls`
 * on the tab and `aria-labelledby` on the panel need both ids, and an id the
 * consumer set on a tab or a panel used to be replaced by a generated one.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, settled, withMotion } from '../../test/harness';

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

  it('a vertical swipe on the row is left to the page', async () => {
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
