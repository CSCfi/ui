/**
 * The appearance of c-button and c-icon-button. `appearance` names it; until
 * 5.0 the deprecated `outlined` / `ghost` / `text` booleans still choose one
 * when `appearance` is unset (ADR-0074).
 */

const APPEARANCES = new Set(['filled', 'ghost', 'outlined', 'text']);

type Appearance = 'filled' | 'ghost' | 'outlined' | 'text';

interface AppearanceProps {
  appearance?: string;
  ghost?: boolean;
  outlined?: boolean;
  text?: boolean;
}

/**
 * The appearance a button paints: `appearance` when it names one (an
 * attribute can deliver any string), else the deprecated booleans —
 * `outlined` over `text` over `ghost`, the order their styles used to
 * override each other in — else `filled`.
 */
export const resolveAppearance = (props: AppearanceProps): Appearance => {
  if (props.appearance && APPEARANCES.has(props.appearance)) {
    return props.appearance as Appearance;
  }

  if (props.outlined) return 'outlined';

  if (props.text) return 'text';

  if (props.ghost) return 'ghost';

  return 'filled';
};
