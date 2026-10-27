/**
 * Behaviour spec for c-steps: the lines it inserts between your c-step
 * elements follow the steps you render, including ones added or removed after
 * it mounts.
 */
import { describe, expect, it } from 'vitest';

import { mount, settle } from '../../test/harness';

const STEPS = '<c-step>One</c-step><c-step>Two</c-step>';

/** The host's light-DOM children, steps and lines, in order. */
const sequence = (host: HTMLElement): string[] =>
  [...host.children].map((child) =>
    child.classList.contains('divider')
      ? `line${child.classList.contains('complete') ? ' complete' : ''}`
      : child.localName,
  );

describe('c-steps', () => {
  it('joins a step added after mount with a line, and keeps following value', async () => {
    const { host } = await mount('c-steps', {
      attrs: { value: 1 },
      html: STEPS,
    });

    host.insertAdjacentHTML('beforeend', '<c-step>Three</c-step>');
    await settle();

    expect(sequence(host)).toEqual([
      'c-step',
      'line',
      'c-step',
      'line',
      'c-step',
    ]);

    host.setAttribute('value', '3');
    await settle();

    expect(sequence(host)).toEqual([
      'c-step',
      'line complete',
      'c-step',
      'line complete',
      'c-step',
    ]);
  });

  it('drops the line of a removed step', async () => {
    const { host } = await mount('c-steps', {
      attrs: { value: 1 },
      html: `${STEPS}<c-step>Three</c-step>`,
    });

    host.querySelectorAll('c-step')[2]!.remove();
    await settle();

    expect(sequence(host)).toEqual(['c-step', 'line', 'c-step']);
  });
});

describe('c-steps for assistive technology', () => {
  it('is no Tab stop, and announces its summary politely as the step changes', async () => {
    const { host, shadow } = await mount('c-steps', {
      attrs: { value: 1 },
      html: `${STEPS}<c-step>Three</c-step>`,
    });

    expect(host.hasAttribute('tabindex')).toBe(false);

    const status = shadow('[role="status"]');

    expect(status.textContent).toContain('step 1 of 3');

    host.setAttribute('value', '2');
    await settle();

    expect(status.textContent).toContain('step 2 of 3');
  });
});
