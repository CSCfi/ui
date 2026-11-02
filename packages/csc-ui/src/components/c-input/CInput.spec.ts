/**
 * Behaviour spec for c-input, the field box behind c-text-field, c-select,
 * c-autocomplete and c-tree-select.
 *
 * Firefox 140 ESR paints nothing of an element moved by `translateY` when it
 * clips on one axis only (`overflow-x: clip` with `overflow-y: visible`): the
 * floating label, lifted onto the top border once the field is focused or
 * filled, vanished there. Chromium paints that combination, so the spec holds
 * the label to the combination Firefox renders — clipping on both axes, with
 * 4px of headroom past the line box for tall glyphs. Safari has no
 * `overflow-clip-margin`, so the headroom is the clip box's own.
 */
import { describe, expect, it } from 'vitest';

import { mount } from '../../test/harness';

describe('c-input floating label', () => {
  it.each([
    ['filled', { filled: true }],
    ['active', { active: true }],
  ])('clips on both axes once lifted (%s)', async (_state, props) => {
    const m = await mount('c-input', {
      html: '<input value="Ada">',
      props: { label: 'Display name', ...props },
    });

    const label = m.shadow('.c-input__label--floating');

    expect(label.hasAttribute('data-lifted')).toBe(true);

    const style = getComputedStyle(label);

    expect(
      [style.overflowX, style.overflowY],
      'single-axis clip hides the lifted label in Firefox 140',
    ).toEqual(['clip', 'clip']);
    // The clip is the padding box: it reaches 4px past the line box on both
    // sides, in every engine.
    expect(
      (label.clientHeight - parseFloat(style.lineHeight)) / 2,
    ).toBeGreaterThanOrEqual(4);
    expect(style.textOverflow).toBe('ellipsis');
  });
});
