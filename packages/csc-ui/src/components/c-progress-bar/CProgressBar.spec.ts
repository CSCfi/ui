/**
 * Behaviour spec for c-progress-bar: `label` names the progress element.
 * It used to be only the text after the percentage, so the bar itself had no
 * accessible name.
 */
import { expect, it } from 'vitest';

import { mount } from '../../test/harness';

it('names the progress element with its label', async () => {
  const m = await mount('c-progress-bar', {
    attrs: { label: 'Uploading files', value: 40 },
  });

  expect(m.shadow('progress').getAttribute('aria-label')).toBe(
    'Uploading files',
  );
});

it('an aria-label on the element names the progress bar without a label', async () => {
  const { host } = await mount('c-progress-bar', {
    attrs: { 'aria-label': 'Storage used', value: 40 },
  });

  expect(
    host.shadowRoot!.querySelector('progress')!.getAttribute('aria-label'),
  ).toBe('Storage used');
});
