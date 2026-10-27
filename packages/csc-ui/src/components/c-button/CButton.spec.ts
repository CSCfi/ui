import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { matchScreenshotInBothModes, mount, settled } from '../../test/harness';

describe('c-button', () => {
  it('upgrades with adopted styles and a painted root', async () => {
    const { host, part } = await mount('c-button', { html: 'Save' });

    expect(host.shadowRoot).not.toBeNull();
    expect(host.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThanOrEqual(
      1,
    );
    // The Tailwind @property defaults must be registered in the light DOM,
    // or every utility border collapses (defineElement.ts).
    expect(
      document.head.querySelector('style[data-csc-ui-tw-properties]'),
    ).not.toBeNull();

    await settled();
    expect(getComputedStyle(part('root')).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    );
  });

  it('matches its visual baseline in both theme modes', async () => {
    const { stage } = await mount('c-button', { html: 'Save' });
    await matchScreenshotInBothModes(stage, 'default');
  });
});

describe('c-button ripple', () => {
  it('clips the ripple to the same corner shape and radius as the root', async () => {
    const { part } = await mount('c-button', { html: 'Save' });

    await settled();

    const root = getComputedStyle(part('root'));

    // The ripple clip is the root's last child.
    const ripples = getComputedStyle(part('root').lastElementChild!);

    expect(ripples.borderRadius).toBe(root.borderRadius);
    // `corner-shape` (the squircle of `rounded-csc-md`) does not inherit
    // like the radius does; the clip must restate it or a round clip sits
    // inside a squircle corner.
    expect(ripples.getPropertyValue('corner-shape')).toBe(
      root.getPropertyValue('corner-shape'),
    );
  });
});

describe('c-button link (decisions #7)', () => {
  const mountLink = async (attrs: Record<string, string> = {}) => {
    const m = await mount('c-button', {
      attrs: { href: '#somewhere', ...attrs },
      html: 'Docs',
    });

    const anchor = m.part('root') as HTMLAnchorElement;

    const clicks: string[] = [];

    // Record the activation, and keep the test page where it is.
    anchor.addEventListener('click', (event) => {
      clicks.push(anchor.target);
      event.preventDefault();
    });

    return { anchor, clicks };
  };

  it('opens in the same tab unless target is set, as a native link does', async () => {
    const { anchor } = await mountLink();

    expect(anchor.hasAttribute('target') ? anchor.target : '').toBe('');
  });

  it('Space clicks the link; nothing opens a window behind its back', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    try {
      const { anchor, clicks } = await mountLink();

      anchor.focus();
      await userEvent.keyboard(' ');

      expect(clicks).toEqual(['']);
      expect(open).not.toHaveBeenCalled();
    } finally {
      open.mockRestore();
    }
  });
});

describe('c-button in a form', () => {
  const inForm = async (attrs: Record<string, boolean | string>) => {
    const form = document.createElement('form');

    const seen: string[] = [];

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      seen.push('submit');
    });
    form.addEventListener('reset', () => seen.push('reset'));
    document.body.append(form);

    const { host } = await mount('c-button', { attrs, html: 'Go' });

    form.append(host.parentElement!);

    return { button: host.shadowRoot!.querySelector('button')!, form, seen };
  };

  it('type="submit" submits and type="reset" resets the form around it', async () => {
    const submit = await inForm({ type: 'submit' });

    await userEvent.click(submit.button);

    const reset = await inForm({ type: 'reset' });

    await userEvent.click(reset.button);

    expect([...submit.seen, ...reset.seen]).toEqual(['submit', 'reset']);
    submit.form.remove();
    reset.form.remove();
  });

  it('a plain, disabled or loading button submits nothing', async () => {
    for (const attrs of [
      {},
      { disabled: true, type: 'submit' },
      { loading: true, type: 'submit' },
    ] as Record<string, boolean | string>[]) {
      const { button, form, seen } = await inForm(attrs);

      button.click();

      expect(seen, JSON.stringify(attrs)).toEqual([]);
      form.remove();
    }
  });
});
