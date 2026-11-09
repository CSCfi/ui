/**
 * Behaviour spec for the element's one `ElementInternals`
 * (useElementInternals): `attachInternals()` may be called only once per
 * element, so an element taken off the page and put back — which mounts a new
 * component instance — must reach the internals the first instance attached.
 */
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, settle } from '../test/harness';

it('custom states follow the instance mounted after the element comes back', async () => {
  const m = await mount('c-checkbox', { props: { label: 'Agree' } });

  const parent = m.host.parentNode!;

  m.host.remove();
  await settle(100);
  parent.append(m.host);
  await settle(100);

  await userEvent.click(m.part('label'));
  await settle();

  expect(m.host.matches(':state(checked)')).toBe(true);
});
