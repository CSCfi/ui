/**
 * Behaviour spec for c-radio-group.
 */
import { describe, expect, it } from 'vitest';

import { mount } from '../../test/harness';

describe('hide-message', () => {
  const message = async (attrs: Record<string, boolean | string> = {}) =>
    (
      await mount('c-radio-group', {
        attrs,
        html: '<c-radio value="a">A</c-radio>',
      })
    ).host.shadowRoot!.querySelector('[part~="message"]');

  it('hides the message line, and wins over the deprecated hide-details', async () => {
    expect(await message()).not.toBeNull();
    expect(await message({ 'hide-message': true })).toBeNull();
    expect(await message({ 'hide-details': true })).toBeNull();
    expect(
      await message({ 'hide-details': true, 'hide-message': 'false' }),
    ).not.toBeNull();
    expect(
      await message({ 'hide-details': 'false', 'hide-message': true }),
    ).toBeNull();
  });
});
