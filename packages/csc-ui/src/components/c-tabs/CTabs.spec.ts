/**
 * Behaviour spec for c-tabs pairing each tab with its panel: `aria-controls`
 * on the tab and `aria-labelledby` on the panel need both ids, and an id the
 * consumer set on a tab or a panel used to be replaced by a generated one.
 */
import { describe, expect, it } from 'vitest';

import { mount, settled } from '../../test/harness';

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
