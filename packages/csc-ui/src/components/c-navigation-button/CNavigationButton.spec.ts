/**
 * Behaviour spec for c-navigation-button: the icon-only button has an
 * accessible name, from `texts.label` (decisions #27). A host `aria-label`
 * cannot give it one: `inheritAttrs: false` keeps host attributes off the
 * inner button.
 */
import { afterEach, expect, it } from 'vitest';

import { applyDefaults, resetDefaults } from '../../shared/appDefaults';
import { mount } from '../../test/harness';

afterEach(() => resetDefaults());

const button = (host: HTMLElement): HTMLButtonElement =>
  host
    .shadowRoot!.querySelector('c-icon-button')!
    .shadowRoot!.querySelector('button')!;

it('names the button "Menu" by default', async () => {
  const m = await mount('c-navigation-button');

  expect(button(m.host).getAttribute('aria-label')).toBe('Menu');
});

it('takes the name from texts, per element or app-wide', async () => {
  applyDefaults({ 'c-navigation-button': { texts: { label: 'Valikko' } } });

  const app = await mount('c-navigation-button');

  const own = await mount('c-navigation-button', {
    props: { texts: { label: 'Navigation' } },
  });

  expect(button(app.host).getAttribute('aria-label')).toBe('Valikko');
  expect(button(own.host).getAttribute('aria-label')).toBe('Navigation');
});
