/**
 * The landing page (plan `_plan/csc-ui-landing-page.md`). Its hero card is
 * the one interactive part: mounted against the built package as the site
 * shows it, it upgrades cleanly, passes axe in both theme modes, matches its
 * light and dark baselines, and submits and resets as a native form. The
 * component overview's group map is checked against the manifest so a new
 * component cannot go missing from the landing page.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { page, server, userEvent } from 'vitest/browser';
import { type App, createApp } from 'vue';

import LandingTaskCard from '../app/components/landing/LandingTaskCard.client.vue';
import { useManifest } from '../app/composables/useManifest';
import { COMPONENT_GROUPS } from '../app/content/component-groups';
import { axeViolations, captureConsole, expectUpgraded, settle } from './smoke';

describe('hero card', () => {
  let app: App | undefined;

  let restoreConsole: (() => void) | undefined;

  afterEach(() => {
    app?.unmount();
    restoreConsole?.();
    app = undefined;
  });

  const mountCard = async (): Promise<{
    problems: string[];
    root: HTMLElement;
  }> => {
    const { problems, restore } = captureConsole();

    restoreConsole = restore;
    app = createApp(LandingTaskCard);
    app.config.warnHandler = (message) => problems.push(`Vue warn: ${message}`);
    app.config.errorHandler = (error) =>
      problems.push(`Vue error: ${String(error)}`);

    // The hero column's width on a desktop.
    const root = document.createElement('div');

    root.style.width = '34rem';
    document.body.append(root);
    app.mount(root);
    await settle(100);

    return { problems, root };
  };

  const statusText = (root: HTMLElement) =>
    root.querySelector('c-status')?.textContent?.trim();

  it('upgrades cleanly and passes axe in both theme modes', async () => {
    const { problems, root } = await mountCard();

    expectUpgraded(root);
    expect(problems).toEqual([]);

    const violations = await axeViolations(root);

    expect(
      [...violations].flatMap(([rule, lines]) =>
        lines.map((line) => `${rule} ${line}`),
      ),
      'axe violations (WCAG 2.1 AA)',
    ).toEqual([]);

    // Baselines are compared on Linux only (devcontainer + CI, where the
    // fonts are pinned).
    if (server.platform === 'linux') {
      for (const mode of ['light', 'dark'] as const) {
        document.documentElement.setAttribute('data-theme', mode);
        await settle(350);
        await expect
          .element(page.elementLocator(root))
          .toMatchScreenshot(`landing-task-card-${mode}`);
      }
    }
  });

  it('shows the error message on an empty submit and focuses the field', async () => {
    const { problems, root } = await mountCard();

    const field = root.querySelector('c-text-field')!;

    await userEvent.click(page.getByRole('button', { name: 'Submit request' }));
    await settle();

    expect(field.invalid).toBe(true);
    expect(document.activeElement).toBe(field);
    expect(statusText(root)).toBe('Draft');
    expect(problems).toEqual([]);
  });

  it('raises a toast on a valid submit, and a reset returns to the draft', async () => {
    const { problems, root } = await mountCard();

    await userEvent.fill(
      page.getByRole('textbox', { name: 'Project name' }),
      'Climate model',
    );
    await userEvent.click(page.getByRole('button', { name: 'Submit request' }));
    await settle();

    expect(statusText(root)).toBe('Submitted');
    // The message is a text node beside the toast's heading, which
    // getByText does not match: read the toast's content part.
    await expect
      .poll(() =>
        root
          .querySelector('c-toasts')
          ?.shadowRoot?.querySelector('c-toast')
          ?.shadowRoot?.querySelector('[part="content"]')
          ?.textContent?.replace(/\s+/g, ' ')
          .trim(),
      )
      .toBe('Request submitted This is a demo: nothing was sent.');

    await userEvent.click(page.getByRole('button', { name: 'Reset' }));
    await settle();

    expect(statusText(root)).toBe('Draft');
    expect(root.querySelector('c-text-field')!.invalid).toBe(false);
    expect(problems).toEqual([]);
  });
});

describe('component groups', () => {
  const standalone = useManifest().navComponents.map(
    (component) => component.tagName,
  );

  const grouped = COMPONENT_GROUPS.flatMap((group) => group.tags);

  it('place every standalone component in exactly one group', () => {
    expect(
      standalone.filter((tag) => !grouped.includes(tag)),
      'in no group: add them to app/content/component-groups.ts',
    ).toEqual([]);
    expect(
      grouped.filter((tag, index) => grouped.indexOf(tag) !== index),
      'in two groups',
    ).toEqual([]);
  });

  it('name only standalone components', () => {
    expect(grouped.filter((tag) => !standalone.includes(tag))).toEqual([]);
  });
});
