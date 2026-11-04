/**
 * The colour-variant behaviour c-button and c-icon-button share (ADR-0079),
 * run from each one's spec so the variants baseline lands beside its other
 * baselines.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { applyDefaults } from '../shared/appDefaults';
import { rasterise } from './conformance/paint';
import {
  chromiumOnly,
  contrastRatio,
  defineAll,
  matchScreenshotInBothModes,
  mount,
  parkPointer,
  roleInMode,
  setThemeMode,
  settle,
  settled,
} from './harness';

const VARIANTS = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'danger',
] as const;

type Variant = (typeof VARIANTS)[number];

const APPEARANCES = ['filled', 'outlined', 'ghost', 'text'] as const;

/** The token family each variant paints with. */
const ROLE: Record<Variant, string> = {
  danger: 'error',
  info: 'info',
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
};

const MODES = ['light', 'dark'] as const;

/** A translucent colour composited over an opaque one, as the eye sees it. */
const over = (top: string, under: string): string => {
  const [r, g, b, a] = rasterise(top);

  const below = rasterise(under);

  const t = a! / 255;

  const mix = (c: number, i: number) => Math.round(c * t + below[i]! * (1 - t));

  return `rgb(${mix(r!, 0)} ${mix(g!, 1)} ${mix(b!, 2)})`;
};

/** A colour's opacity, 0–1, as painted. */
const alpha = (value: string): number => rasterise(value)[3]! / 255;

/**
 * The outlined ring's colour, rasterised: the inset shadow among the computed
 * `box-shadow` layers (Tailwind keeps transparent placeholders around it).
 */
const ringColour = (boxShadow: string): number[] => {
  const ring = boxShadow
    .split(/,(?![^(]*\))/)
    .find((layer) => layer.includes('inset'));

  return rasterise(
    (ring ?? '')
      .replace('inset', '')
      .replaceAll(/-?[\d.]+px/g, '')
      .trim(),
  );
};

export function describeButtonVariants(
  tag: 'c-button' | 'c-icon-button',
  { html = '', pressable = false }: { html?: string; pressable?: boolean } = {},
): void {
  // A fresh element paints its look at once (its colour transition only runs
  // on a change), so no transition wait.
  const paint = async (attrs: Record<string, boolean | string> = {}) => {
    const { part } = await mount(tag, { attrs, html });

    return getComputedStyle(part('root'));
  };

  const role = (mode: (typeof MODES)[number], name: string) =>
    rasterise(roleInMode(mode, name));

  describe(`${tag} variant`, () => {
    // The lighter appearances ink with the role's subtle ink: the role itself
    // drops under AA on its own tint (dark primary read 3.8:1 on hover).
    it('fills with each variant and inks the lighter appearances with its subtle ink, in both modes', async () => {
      for (const mode of MODES) {
        setThemeMode(mode);

        for (const variant of VARIANTS) {
          const filled = await paint({ variant });

          const at = `${mode} ${variant}`;

          expect(rasterise(filled.backgroundColor), at).toEqual(
            role(mode, `--c-${ROLE[variant]}`),
          );
          expect(rasterise(filled.color), at).toEqual(
            role(mode, `--c-on-${ROLE[variant]}`),
          );

          for (const appearance of ['outlined', 'ghost', 'text']) {
            const lighter = await paint({ appearance, variant });

            expect(rasterise(lighter.color), `${at} ${appearance}`).toEqual(
              role(mode, `--c-on-${ROLE[variant]}-subtle`),
            );
          }

          document.body.replaceChildren();
        }
      }
    });

    it('is primary unless set, and an unknown value is primary too', async () => {
      const primary = role('light', '--c-primary');

      expect(rasterise((await paint()).backgroundColor)).toEqual(primary);
      expect(
        rasterise((await paint({ variant: 'plum' })).backgroundColor),
      ).toEqual(primary);
    });

    it('takes the deprecated danger while variant is unset', async () => {
      const fill = async (attrs: Record<string, boolean | string>) =>
        rasterise((await paint(attrs)).backgroundColor);

      expect(await fill({ danger: true })).toEqual(role('light', '--c-error'));
      expect(await fill({ danger: true, variant: 'success' })).toEqual(
        role('light', '--c-success'),
      );
      expect(await fill({ danger: 'false' })).toEqual(
        role('light', '--c-primary'),
      );
    });

    it('takes an app default, which the element’s own variant or danger beats', async () => {
      const { host, part } = await mount(tag, { html });

      const fill = () =>
        rasterise(getComputedStyle(part('root')).backgroundColor);

      applyDefaults({ [tag]: { variant: 'secondary' } });
      await settled();
      expect(fill(), 'live').toEqual(role('light', '--c-secondary'));

      host.setAttribute('danger', '');
      await settled();
      expect(fill(), 'danger').toEqual(role('light', '--c-error'));

      host.setAttribute('variant', 'info');
      await settled();
      expect(fill(), 'variant').toEqual(role('light', '--c-info'));

      host.removeAttribute('variant');
      host.removeAttribute('danger');
      applyDefaults({ [tag]: { variant: undefined } });
      await settled();
      expect(fill(), 'cleared').toEqual(role('light', '--c-primary'));
    });

    it('reads at AA in every variant and appearance, inverted too, in both modes', async () => {
      for (const mode of MODES) {
        setThemeMode(mode);

        const surface = roleInMode(mode, '--c-surface');

        for (const variant of VARIANTS) {
          for (const appearance of APPEARANCES) {
            const { backgroundColor, color } = await paint({
              appearance,
              variant,
            });

            expect(
              contrastRatio(color, over(backgroundColor, surface)),
              `${mode} ${variant} ${appearance}`,
            ).toBeGreaterThanOrEqual(4.5);
          }

          // Inverted, only the filled look carries the variant: its colour
          // on the mode-invariant white.
          const inverted = await paint({ inverted: true, variant });

          expect(
            contrastRatio(inverted.color, inverted.backgroundColor),
            `${mode} ${variant} inverted`,
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            rasterise(inverted.color),
            `${mode} ${variant} inverted`,
          ).toEqual(role(mode, `--c-inverse-${ROLE[variant]}`));

          document.body.replaceChildren();
        }
      }
    });

    // Hover replaces the inverted look's white, so a see-through hover let the
    // dark backdrop through under the dark label. Mode-invariant: light only.
    it('stays light under the pointer, inverted, on a dark backdrop, in every variant', async () => {
      for (const variant of VARIANTS) {
        const { part, stage } = await mount(tag, {
          attrs: { inverted: true, variant },
          html,
        });

        stage.style.background = 'black';

        const root = part('root');

        await userEvent.hover(root);
        await settled();

        const { backgroundColor, color } = getComputedStyle(root);

        expect(alpha(backgroundColor), `${variant} opaque`).toBe(1);
        expect(
          contrastRatio(color, backgroundColor),
          variant,
        ).toBeGreaterThanOrEqual(4.5);

        await parkPointer();
        document.body.replaceChildren();
      }
    });

    // A filled hover moves away from its label (ADR-0081): darker under a
    // white label, lighter under a dark one. Light mode had lightened every
    // fill, so white read 2.5–3.8:1 hovered.
    it('reads at AA hovered, filled, in every variant and both modes', async () => {
      for (const mode of MODES) {
        setThemeMode(mode);

        for (const variant of VARIANTS) {
          const { part } = await mount(tag, { attrs: { variant }, html });

          const root = part('root');

          await userEvent.hover(root);
          await settled();

          const { backgroundColor, color } = getComputedStyle(root);

          expect(
            rasterise(backgroundColor),
            `${mode} ${variant} hover fill`,
          ).toEqual(role(mode, `--c-${ROLE[variant]}-hover`));
          expect(
            contrastRatio(color, backgroundColor),
            `${mode} ${variant} hovered`,
          ).toBeGreaterThanOrEqual(4.5);

          await parkPointer();
          document.body.replaceChildren();
        }
      }
    });

    // The outlined edge is the filled edge: a border is not text, so it takes
    // the role, as every other border does (ADR-0080). The label's ink read
    // near-black in light mode (primary-700).
    it('borders the outlined look with the variant’s fill, in both modes', async () => {
      for (const mode of MODES) {
        setThemeMode(mode);

        for (const variant of VARIANTS) {
          const { boxShadow } = await paint({
            appearance: 'outlined',
            variant,
          });

          expect(ringColour(boxShadow), `${mode} ${variant}`).toEqual(
            role(mode, `--c-${ROLE[variant]}`),
          );

          document.body.replaceChildren();
        }
      }
    });

    it('washes the ghost look at 14%, in both modes', async () => {
      for (const mode of MODES) {
        setThemeMode(mode);

        for (const variant of VARIANTS) {
          const { backgroundColor } = await paint({
            appearance: 'ghost',
            variant,
          });

          expect(alpha(backgroundColor), `${mode} ${variant}`).toBeCloseTo(
            0.14,
            2,
          );

          document.body.replaceChildren();
        }
      }
    });

    // One hover wash for the three lighter appearances, over the ghost's
    // resting one. The labels keep AA on it over the page surface (dark
    // secondary is the lowest, 4.6:1); on a dark popover they do not, a known
    // case in ADR-0079. One test per appearance: each hover waits out the
    // transition.
    for (const appearance of ['outlined', 'ghost', 'text']) {
      it(`washes the ${appearance} look at 20% hovered, at AA, in both modes`, async () => {
        for (const mode of MODES) {
          setThemeMode(mode);

          const surface = roleInMode(mode, '--c-surface');

          for (const variant of VARIANTS) {
            const { part } = await mount(tag, {
              attrs: { appearance, variant },
              html,
            });

            const root = part('root');

            await userEvent.hover(root);
            await settled();

            const { backgroundColor, color } = getComputedStyle(root);

            const at = `${mode} ${variant} hovered`;

            expect(alpha(backgroundColor), at).toBeCloseTo(0.2, 2);
            expect(
              contrastRatio(color, over(backgroundColor, surface)),
              at,
            ).toBeGreaterThanOrEqual(4.5);

            await parkPointer();
            document.body.replaceChildren();
          }
        }
      });
    }

    // No pressed step: a darker pressed wash took dark secondary under AA
    // (4.5:1 at 22%), and the ripple already marks the press.
    chromiumOnly(
      'holds the button :active with a held Space, which Firefox’s WebDriver BiDi input does not, even on a plain <button>',
    )('keeps a held ghost button’s wash', async () => {
      const { part } = await mount(tag, {
        attrs: { appearance: 'ghost', variant: 'primary' },
        html,
      });

      const root = part('root');

      root.focus();

      const rest = getComputedStyle(root).backgroundColor;

      await userEvent.keyboard('[Space>]');
      expect(root.matches(':active'), 'held').toBe(true);
      expect(rasterise(getComputedStyle(root).backgroundColor)).toEqual(
        rasterise(rest),
      );
      await userEvent.keyboard('[/Space]');
    });

    if (pressable) {
      it('fills a pressed button with its variant', async () => {
        for (const variant of VARIANTS) {
          const pressed = await paint({
            active: true,
            appearance: 'text',
            variant,
          });

          expect(rasterise(pressed.backgroundColor), variant).toEqual(
            role('light', `--c-${ROLE[variant]}`),
          );
        }
      });
    }

    it('matches its variants baseline in both theme modes', async () => {
      defineAll();

      const stage = document.createElement('div');

      stage.style.cssText =
        'display:inline-grid;grid-template-columns:repeat(4,auto);gap:8px;padding:8px';

      for (const variant of VARIANTS) {
        for (const appearance of APPEARANCES) {
          const button = document.createElement(tag);

          button.setAttribute('appearance', appearance);
          button.setAttribute('variant', variant);
          button.innerHTML = html;
          stage.append(button);
        }
      }

      document.body.append(stage);
      await customElements.whenDefined(tag);
      await settle();
      await matchScreenshotInBothModes(stage, 'variants');
    });
  });
}
