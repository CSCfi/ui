import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { describeButtonVariants } from '../../test/buttonVariants';
import {
  consoleSpy,
  matchScreenshotInBothModes,
  mount,
  mountInForm,
  recordEvents,
  roleInMode,
  setThemeMode,
  settle,
  settled,
} from '../../test/harness';

describeButtonVariants('c-button', { html: 'Save', pressable: true });

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

describe('c-button keys while loading or disabled', () => {
  // Only the keys that would activate it are held back: Tab moves on, or the
  // button would trap keyboard focus while its action runs.
  it('Tab moves past a loading button and a disabled link; Enter and Space do nothing', async () => {
    for (const attrs of [
      { loading: true, type: 'submit' },
      { disabled: true, href: '#c-button-keys' },
    ] as Record<string, boolean | string>[]) {
      const label = JSON.stringify(attrs);

      const form = document.createElement('form');

      const before = document.createElement('input');

      const after = document.createElement('input');

      const seen: string[] = [];

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        seen.push('submit');
      });
      document.body.append(form);

      const m = await mount('c-button', { attrs, html: 'Go' });

      form.append(before, m.host.parentElement!, after);
      before.focus();
      await userEvent.tab();

      expect(m.host.shadowRoot!.activeElement, label).toBe(m.part('root'));

      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await userEvent.tab();

      expect(document.activeElement, label).toBe(after);
      expect(seen, label).toEqual([]);
      expect(location.hash, label).not.toBe('#c-button-keys');
      m.unmount();
      form.remove();
    }
  });
});

describe('c-button appearance', () => {
  const paint = async (attrs: Record<string, boolean | string>) => {
    const { part } = await mount('c-button', { attrs, html: 'Save' });

    await settled();

    const { backgroundColor, boxShadow, color } = getComputedStyle(
      part('root'),
    );

    return { backgroundColor, boxShadow, color };
  };

  it('paints each appearance as its deprecated boolean does', async () => {
    const filled = await paint({});

    expect(await paint({ appearance: 'filled' })).toEqual(filled);

    for (const appearance of ['ghost', 'outlined', 'text']) {
      const look = await paint({ appearance });

      expect(look, appearance).not.toEqual(filled);
      expect(look, appearance).toEqual(await paint({ [appearance]: true }));
    }
  });

  it('wins over the deprecated booleans when set', async () => {
    expect(await paint({ appearance: 'filled', outlined: true })).toEqual(
      await paint({}),
    );
    expect(await paint({ appearance: 'ghost', outlined: true })).toEqual(
      await paint({ appearance: 'ghost' }),
    );
  });

  it('leaves an unknown value to the deprecated booleans', async () => {
    expect(await paint({ appearance: 'bold', outlined: true })).toEqual(
      await paint({ appearance: 'outlined' }),
    );
    expect(await paint({ appearance: 'bold' })).toEqual(await paint({}));
  });
});

describe('c-button disabled', () => {
  // The hint inks (`on-surface-muted`, `on-surface-faint`) are held to AA
  // contrast, dark enough that a disabled label inked with them reads as
  // enabled; disabled text takes the disabled ink, exempt from AA.
  it('inks its label with the disabled ink in both modes', async () => {
    for (const mode of ['light', 'dark'] as const) {
      setThemeMode(mode);

      for (const attrs of [
        {},
        { danger: true },
        { appearance: 'ghost' },
        { appearance: 'text' },
        { appearance: 'outlined' },
      ] as Record<string, boolean | string>[]) {
        const { part } = await mount('c-button', {
          attrs: { ...attrs, disabled: true },
          html: 'Save',
        });

        expect(
          getComputedStyle(part('root')).color,
          `${mode} ${JSON.stringify(attrs)}`,
        ).toBe(roleInMode(mode, '--c-on-surface-disabled'));
      }
    }
  });
});

describe('c-button form association (ADR-0084)', () => {
  it('a disabled fieldset disables it, and it submits nothing', async () => {
    const m = await mountInForm('c-button', {
      attrs: { type: 'submit' },
      html: 'Go',
    });

    const submits = recordEvents(m.form, ['submit']);

    m.fieldset.disabled = true;
    await settle();

    const button = m.shadow<HTMLButtonElement>('button');

    expect(button.disabled).toBe(true);
    button.click();
    expect(submits.records).toHaveLength(0);
    m.unmount();
  });

  it('`form` names a form elsewhere on the page', async () => {
    const form = document.createElement('form');

    form.id = 'elsewhere';

    const seen: string[] = [];

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      seen.push('submit');
    });
    document.body.append(form);

    const m = await mount('c-button', {
      attrs: { form: 'elsewhere', type: 'submit' },
      html: 'Go',
    });

    await userEvent.click(m.shadow('button'));

    expect(seen).toEqual(['submit']);
    m.unmount();
    form.remove();
  });
});

describe('slotted button (ADR-0085)', () => {
  const slottedButton = async (
    html = '<button type="submit" name="intent" value="signup">Create account</button>',
    attrs: Record<string, boolean | string> = {},
  ) => {
    const m = await mountInForm('c-button', { attrs, html });

    await settled();

    return { ...m, button: m.host.querySelector('button')! };
  };

  const submitters = (form: HTMLFormElement) => {
    const seen: (HTMLElement | null)[] = [];

    form.addEventListener('submit', (event) =>
      seen.push((event as SubmitEvent).submitter),
    );

    return seen;
  };

  it('frames the page’s own button, which submits its form natively', async () => {
    const m = await slottedButton();

    const seen = submitters(m.form);

    expect(m.button.parentElement).toBe(m.host);
    expect(m.button.form).toBe(m.form);
    expect(m.button.classList.contains('c-button__slotted')).toBe(true);
    expect(m.host.shadowRoot!.querySelector('button')).toBeNull();
    expect(m.part('root').localName).toBe('span');
    // What a password manager looks for: a submit button in the form.
    expect([...m.form.querySelectorAll('button[type="submit"]')]).toEqual([
      m.button,
    ]);

    await userEvent.click(m.button);

    expect(seen).toEqual([m.button]);
    m.unmount();
  });

  it('fills the painted root, so a press anywhere on it is the button’s', async () => {
    const m = await slottedButton();

    const root = m.part('root').getBoundingClientRect();

    const button = m.button.getBoundingClientRect();

    expect(button.toJSON()).toEqual(root.toJSON());
    expect(
      document.elementFromPoint(root.left + 2, root.top + root.height / 2),
    ).toBe(m.button);
    m.unmount();
  });

  it('paints as the element’s own button does, in every appearance and size', async () => {
    for (const mode of ['light', 'dark'] as const) {
      setThemeMode(mode);

      for (const attrs of [
        {},
        { appearance: 'ghost', size: 'small' },
        { appearance: 'outlined', variant: 'danger' },
        { appearance: 'text', size: 'large' },
        { inverted: true },
      ] as Record<string, boolean | string>[]) {
        const own = await mount('c-button', { attrs, html: 'Save' });

        const m = await mount('c-button', {
          attrs,
          html: '<button>Save</button>',
        });

        await settled();

        const label = m.host.querySelector('button')!;

        const look = (root: HTMLElement, text: HTMLElement) => {
          const box = getComputedStyle(root);

          const ink = getComputedStyle(text);

          return {
            backgroundColor: box.backgroundColor,
            boxShadow: box.boxShadow,
            color: ink.color,
            fontSize: ink.fontSize,
            fontWeight: ink.fontWeight,
            height: box.height,
            width: box.width,
          };
        };

        expect(
          look(m.part('root'), label),
          `${mode} ${JSON.stringify(attrs)}`,
        ).toEqual(look(own.part('root'), own.part('content')));
        own.unmount();
        m.unmount();
      }
    }
  });

  it('rings the focused button as the element rings its own, and hovers its root', async () => {
    const before = document.createElement('input');

    document.body.prepend(before);

    const ring = async (html: string) => {
      const m = await mount('c-button', {
        attrs: { appearance: 'ghost' },
        html,
      });

      before.focus();
      await userEvent.tab();

      const focused = m.host.querySelector('button') ?? m.shadow('button');

      const { outlineColor, outlineOffset, outlineStyle, outlineWidth } =
        getComputedStyle(focused);

      await userEvent.hover(focused);

      const hovered = m.part('root').matches(':hover');

      m.unmount();

      return {
        hovered,
        outlineColor,
        outlineOffset,
        outlineStyle,
        outlineWidth,
      };
    };

    const own = await ring('Save');

    expect(own.outlineStyle).toBe('solid');
    expect(await ring('<button>Save</button>')).toEqual(own);
    before.remove();
  });

  it('takes the disabled look from the button’s own disabled, a fieldset’s included', async () => {
    const disabledInk = roleInMode('light', '--c-on-surface-disabled');

    setThemeMode('light');

    const m = await slottedButton();

    const ink = () => getComputedStyle(m.button).color;

    expect(ink()).not.toBe(disabledInk);

    m.button.disabled = true;
    await settled();
    expect(ink()).toBe(disabledInk);

    m.button.disabled = false;
    m.fieldset.disabled = true;
    await settled();
    expect(ink()).toBe(disabledInk);
    m.unmount();
  });

  it('loading cancels the button’s clicks, the page’s own handler and Enter in a field included', async () => {
    const m = await slottedButton();

    const field = document.createElement('c-text-field');

    field.setAttribute('label', 'User');
    field.innerHTML = '<input name="user">';
    m.fieldset.prepend(field);

    const seen = submitters(m.form);

    const clicks: string[] = [];

    m.button.addEventListener('click', () => clicks.push('click'));
    (m.host as { loading: boolean } & HTMLElement).loading = true;
    await settled();

    m.button.click();
    await userEvent.type(field.querySelector('input')!, 'ada{Enter}');
    await settle();

    expect(seen).toEqual([]);
    expect(clicks).toEqual([]);

    (m.host as { loading: boolean } & HTMLElement).loading = false;
    await settled();
    await userEvent.type(field.querySelector('input')!, '{Enter}');
    await settle();

    expect(seen).toEqual([m.button]);
    m.unmount();
  });

  it('host props the button replaces are ignored, with a warning', async () => {
    const m = await slottedButton('<button type="submit">Go</button>', {
      target: '_blank',
      type: 'reset',
    });

    consoleSpy.expect(/target, type ignored beside a slotted <button>/);

    const seen = submitters(m.form);

    await userEvent.click(m.button);

    expect(seen).toEqual([m.button]);
    m.unmount();

    const icon = await slottedButton(
      '<span slot="icon">+</span><button>Go</button>',
    );

    consoleSpy.expect(/icon and description slots are ignored/);
    icon.unmount();
  });

  it('the element’s own disabled still disables it, with a warning to set the button’s', async () => {
    const m = await slottedButton(undefined, { disabled: true });

    consoleSpy.expect(/disabled beside a slotted <button> blocks its clicks/);

    const seen = submitters(m.form);

    m.button.click();
    m.button.focus();
    await userEvent.keyboard('{Enter}');

    expect(seen).toEqual([]);
    expect(getComputedStyle(m.button).color).toBe(
      roleInMode('light', '--c-on-surface-disabled'),
    );
    m.unmount();
  });

  it('renders its own button again when the slotted one leaves', async () => {
    const m = await slottedButton();

    const button = m.button;

    button.remove();
    m.host.textContent = 'Save';
    await settled();

    expect(button.classList.contains('c-button__slotted')).toBe(false);
    expect(m.part('root').localName).toBe('button');
    m.unmount();
  });
});
