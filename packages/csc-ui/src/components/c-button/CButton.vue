<template>
  <component
    :is="tag"
    ref="rootRef"
    :aria-pressed="asTab || slotted ? undefined : ariaPressed"
    :aria-selected="
      asTab && !slotted ? String(coerceBoolean(active)) : undefined
    "
    :class="ui.root()"
    :disabled="tag === 'button' ? disabledResolved || undefined : undefined"
    :href="tag === 'a' ? href : undefined"
    :role="asTab && !slotted ? 'tab' : undefined"
    :target="tag === 'a' ? target : undefined"
    :type="tag === 'button' ? buttonType : undefined"
    part="root"
    @click="onClick"
    @keydown="onKeydown"
  >
    <span :class="ui.content()" part="content">
      <span :class="ui.contentInner()">
        <span v-show="hasIcon" :class="ui.iconWrap()">
          <slot name="icon" />
        </span>

        <!-- A slotted button (CONTEXT.md, ADR-0085): the page's own <button>,
             which fills the root while the content wrappers step aside. -->
        <slot :class="ui.label()" />
      </span>

      <span
        v-show="hasDescription"
        :class="ui.description()"
        part="description"
      >
        <slot name="description" />
      </span>
    </span>

    <span v-if="loading" :class="ui.loader()" aria-hidden="true">
      <span
        :class="ui.spinner()"
        :style="{ width: `${spinnerSize}px`, height: `${spinnerSize}px` }"
      />
    </span>

    <span :class="ui.ripples()" aria-hidden="true">
      <span
        v-for="r in ripples"
        :key="r.id"
        :class="ui.ripple()"
        :style="r.style"
      />
    </span>
  </component>
</template>

<script lang="ts">
/**
 * How strongly a button reads: `filled` for the main action, then
 * `outlined`, `ghost` and `text`, each lighter than the last.
 */
export type CButtonAppearance = 'filled' | 'ghost' | 'outlined' | 'text';

/**
 * Size of the button.
 */
export type CButtonSize = 'default' | 'large' | 'small';

/**
 * Native `type` of the underlying `<button>` element. Ignored when `href`
 * turns the component into a link.
 */
export type CButtonType = 'button' | 'reset' | 'submit';

/**
 * The colour a button takes: `primary` (unless set) and `secondary`, the
 * brand families, or a status colour — `success`, `info`, `warning` and
 * `danger`, a destructive action in the error colour.
 */
export type CButtonVariant =
  | 'danger'
  | 'info'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning';

interface CButtonProps {
  /**
   * Pressed (toggle) state — renders the selected look and sets
   * `aria-pressed`. Leave unset for regular action buttons: only a
   * true/false value marks the button as a toggle. Driven by
   * `c-button-group` on its slotted buttons.
   */
  active?: boolean;

  /**
   * The button's look: `filled` (unless set) for the main action of a view;
   * `outlined` (a primary outline, no fill), `ghost` (a light primary tint)
   * or `text` (no fill or outline) for lower emphasis.
   */
  appearance?: CButtonAppearance;

  /**
   * Be a tab of a tablist: `role="tab"`, with `active` as `aria-selected`
   * instead of `aria-pressed`. c-tab-buttons sets it on its buttons.
   *
   * @internal
   */
  asTab?: boolean;

  /**
   * Danger look for a destructive action: the error colour.
   *
   * @deprecated Use `variant="danger"`.
   */
  danger?: boolean;

  /**
   * Grey the button out and block clicks and keys, a link button (`href`)
   * included.
   */
  disabled?: boolean;

  /**
   * Stretch the button to the full width of its container.
   */
  fit?: boolean;

  /**
   * Ghost appearance: primary text on a light primary tint, for lower emphasis.
   *
   * @deprecated Use `appearance="ghost"`.
   */
  ghost?: boolean;

  /**
   * URL to link to: the button renders as a real link (`<a>`) styled as a
   * button.
   *
   * @freeform any URL
   */
  href?: string;

  /**
   * Inverted colours for a fixed dark or brand-coloured backdrop: the
   * `inverse-*` family, the same in both theme modes. Combines with every
   * appearance.
   */
  inverted?: boolean;

  /**
   * Show a spinner in place of the label and ignore clicks and keys, e.g. while
   * the action runs.
   */
  loading?: boolean;

  /**
   * Square corners instead of the rounded default.
   */
  noRadius?: boolean;

  /**
   * Suppress the click ripple; the parent `<c-button-group>` sets it on its
   * buttons, whose press feedback it owns.
   *
   * @internal
   */
  noRipple?: boolean;

  /**
   * Outlined appearance: a primary outline and text with no fill, for lower
   * emphasis.
   *
   * @deprecated Use `appearance="outlined"`.
   */
  outlined?: boolean;

  /**
   * Size of the button: `small`, `default` (the control height, level with a
   * form field) or `large` (the toolbar height).
   */
  size?: CButtonSize;

  /**
   * Where the `href` opens, as on a native `<a>`: the same tab unless set —
   * `_blank` for a new one.
   *
   * @freeform any browsing-context name (e.g. _blank, _self)
   */
  target?: string;

  /**
   * Text appearance: primary text with no fill or outline, the lightest look.
   *
   * @deprecated Use `appearance="text"`.
   */
  text?: boolean;

  /**
   * Native `type` of the button: `button` unless set, `submit` or `reset`.
   * Ignored when `href` is set.
   */
  type?: CButtonType;

  /**
   * The button's value in a `c-button-group`; in `c-tab-buttons`, the `value`
   * of the `c-tab-item` panel it shows.
   */
  value?: number | string;

  /**
   * The button's colour, in every appearance: `primary` unless set (or
   * changed app-wide), `secondary`, `success`, `info`, `warning`, or `danger`
   * for a destructive action.
   *
   * @defaultable 'primary'
   */
  variant?: CButtonVariant;
}
</script>

<script setup lang="ts">
/**
 * @slot default - Button label content, or a slotted `<button>` (ADR-0085):
 * the page's own native button, which a password manager reading the form's
 * submit button finds. Its own `type`, `disabled`, `name`, `value` and
 * `form` apply; the element paints its look.
 * @slot icon - Leading icon, vertically centered before the label.
 * @slot description - Secondary text rendered below the label.
 *
 * @csspart root - The native `<button>` / `<a>` element carrying the visual styling.
 * @csspart content - Layout wrapper for the label, icon and description.
 * @csspart description - Wrapper of the `description` slot.
 */
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useHost,
  useTemplateRef,
} from 'vue';

import { useAppDefault } from '../../shared/appDefaults';
import { resolveAppearance } from '../../shared/buttonAppearance';
import { dangerAsVariant } from '../../shared/buttonVariant';
import { coerceBoolean } from '../../shared/coerceBoolean';
import { useFormAssociation } from '../../shared/useFormAssociation';
import { useHasSlot } from '../../shared/useHasSlot';
import { useIdReferences } from '../../shared/useIdReferences';
import { useRipple } from '../../shared/useRipple';
import { ensureButtonStyles } from './injectButtonStyles';

/**
 * Styling lives entirely in this `tailwind-variants` config: the
 * `slots` are the component's parts and `variants`/`compoundVariants` replace
 * the original `:host([…])` selector cascade. Consumer customization is via
 * `::part()` against the stamped part names; there is no `override`
 * prop.
 *
 * `compoundVariants` are ordered to mirror the original c-button.scss source
 * order so tailwind-merge's last-wins resolution reproduces the cascade.
 * Appearance hover utilities are cancelled in the disabled compoundVariants
 * (each re-declares `hover:bg-*` to match its own disabled bg, and wins via
 * tailwind-merge last-wins ordering). The disabled state deliberately does NOT
 * set `pointer-events-none`: that suppressed `:hover` but also removed the
 * element from hit-testing, which silently killed `cursor-not-allowed` (the
 * pointer is never "over" a `pointer-events:none` element). Interaction on a
 * disabled control is instead blocked by the native `disabled` attribute (the
 * `<button>` case) and by the guarded `onClick` / `onKeydown` handlers (the
 * `<a href>` case, which has no native disabled), so the not-allowed cursor
 * shows in both.
 */
// Hoisted so the runtime guard below can test membership; the `satisfies`
// keeps the map complete against the public union.
//
// `--_c-button-pad-x` is the slotted button's padding (ADR-0085): each size's
// `contentInner` `px-*` written out in rem. Not Tailwind's spacing function:
// it inlines the value but still declares the spacing theme variable on
// every host, where it shadows a consumer's own Tailwind theme (ADR-0072).
// Tailwind reads that variable's bare name, even in a comment, as a use.
const sizeVariants = {
  default: {
    contentInner: 'h-full px-4',
    iconWrap: 'text-2xl',
    // The shared control height (`--_c-control-height`, 52px; ADR-0055), so a
    // button sits level beside a field. `--_c-button-min-height` is an
    // INTERNAL hook (not consumer API): a wrapping c-button-group sets it on
    // its frame so the buttons plus the frame total the control height.
    root: 'min-h-[var(--_c-button-min-height,var(--_c-control-height))] text-base [--_c-button-pad-x:1rem]',
  },
  large: {
    contentInner: 'h-full px-6',
    iconWrap: 'text-2xl',
    // The toolbar height, one step above the control height.
    root: 'min-h-toolbar text-lg [--_c-button-pad-x:1.5rem]',
  },
  small: {
    contentInner: 'h-full px-3',
    iconWrap: 'text-xl',
    root: 'min-h-7 text-sm [--_c-button-pad-x:0.75rem]',
  },
} satisfies Record<CButtonSize, object>;

// The variant's colours as private custom properties on `root`, which the
// appearance compounds below paint with — one set of compounds for every
// colour (ADR-0079). `fill`, `fill-hover` and `on-fill` paint the filled and
// pressed looks (the fill also rings the filled look's focus), tint the
// lighter ones and border the outlined one, whose edge is then the filled
// edge; `ink` is the label and focus ring of the lighter appearances: the
// role's subtle ink, as c-alert's, since the role itself drops under AA on
// its own tint (dark primary read 3.8:1 on the hover tint). `inverse` is the
// label of the inverted filled look. Hoisted, like the sizes, so the runtime
// guard below can test membership.
const variantVariants = {
  danger: {
    root: '[--_c-button-fill-hover:var(--c-error-hover)] [--_c-button-fill:var(--c-error)] [--_c-button-ink:var(--c-on-error-subtle)] [--_c-button-inverse:var(--c-inverse-error)] [--_c-button-on-fill:var(--c-on-error)]',
  },
  info: {
    root: '[--_c-button-fill-hover:var(--c-info-hover)] [--_c-button-fill:var(--c-info)] [--_c-button-ink:var(--c-on-info-subtle)] [--_c-button-inverse:var(--c-inverse-info)] [--_c-button-on-fill:var(--c-on-info)]',
  },
  primary: {
    root: '[--_c-button-fill-hover:var(--c-primary-hover)] [--_c-button-fill:var(--c-primary)] [--_c-button-ink:var(--c-on-primary-subtle)] [--_c-button-inverse:var(--c-inverse-primary)] [--_c-button-on-fill:var(--c-on-primary)]',
  },
  secondary: {
    root: '[--_c-button-fill-hover:var(--c-secondary-hover)] [--_c-button-fill:var(--c-secondary)] [--_c-button-ink:var(--c-on-secondary-subtle)] [--_c-button-inverse:var(--c-inverse-secondary)] [--_c-button-on-fill:var(--c-on-secondary)]',
  },
  success: {
    root: '[--_c-button-fill-hover:var(--c-success-hover)] [--_c-button-fill:var(--c-success)] [--_c-button-ink:var(--c-on-success-subtle)] [--_c-button-inverse:var(--c-inverse-success)] [--_c-button-on-fill:var(--c-on-success)]',
  },
  warning: {
    root: '[--_c-button-fill-hover:var(--c-warning-hover)] [--_c-button-fill:var(--c-warning)] [--_c-button-ink:var(--c-on-warning-subtle)] [--_c-button-inverse:var(--c-inverse-warning)] [--_c-button-on-fill:var(--c-on-warning)]',
  },
} satisfies Record<CButtonVariant, object>;

const button = tv({
  compoundVariants: [
    // ---- default (filled) --------------------------------------------------
    {
      class: {
        root: 'bg-(--_c-button-fill) text-(--_c-button-on-fill) [--_c-button-ring:var(--_c-button-fill)] hover:bg-(--_c-button-fill-hover)',
      },
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    // Hover replaces the white, so the hovered white takes 15% of the variant
    // mixed in, opaque: a see-through hover let the dark backdrop through
    // under the dark label.
    {
      class: {
        root: 'bg-inverse-surface text-(--_c-button-inverse) [--_c-button-ring:var(--c-inverse-on)] hover:bg-[color-mix(in_srgb,var(--_c-button-inverse)_15%,var(--c-inverse-surface))]',
      },
      ghost: false,
      inverted: true,
      outlined: false,
      text: false,
    },
    // ---- ghost -----------------------------------------------------------
    // The lighter appearances share one 20% hover tint over the ghost's 14%,
    // both opaque, the variant mixed into the page surface (ADR-0082), so they
    // read the same on a popover or the page canvas. None darkens further
    // while pressed (the ripple marks the press): dark secondary's label reads
    // 4.6:1 hovered and fell under AA at 22%.
    {
      class: {
        root: 'bg-tint-(--_c-button-fill)/14 text-(--_c-button-ink) [--_c-button-ring:var(--_c-button-ink)] hover:bg-tint-(--_c-button-fill)/20',
      },
      ghost: true,
      inverted: false,
    },
    {
      class: {
        root: 'bg-inverse-on/20 text-inverse-on [--_c-button-ring:var(--c-inverse-on)] hover:bg-inverse-on/30',
      },
      ghost: true,
      inverted: true,
    },
    // ---- text ------------------------------------------------------------
    {
      class: {
        root: 'bg-transparent text-(--_c-button-ink) [--_c-button-ring:var(--_c-button-ink)] hover:bg-tint-(--_c-button-fill)/20',
      },
      inverted: false,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on [--_c-button-ring:var(--c-inverse-on)] hover:bg-inverse-on/30',
      },
      inverted: true,
      text: true,
    },
    // ---- outlined --------------------------------------------------------
    {
      class: {
        root: 'bg-transparent text-(--_c-button-ink) ring-2 ring-(--_c-button-fill) [--_c-button-ring:var(--_c-button-ink)] ring-inset hover:bg-tint-(--_c-button-fill)/20',
      },
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on ring-2 ring-inverse-on [--_c-button-ring:var(--c-inverse-on)] ring-inset hover:bg-inverse-on/30',
      },
      inverted: true,
      outlined: true,
    },
    // ---- active (pressed) --------------------------------------------------
    // The selected/toggle look: the variant's fill regardless of appearance
    // flag. Authored through internal vars (falling back to the variant's
    // colours) so c-tab-buttons can retarget the fill — make it transparent
    // while its sliding indicator paints the fill instead. Ordered after the
    // appearance compounds (active wins) and before the disabled ones
    // (disabled wins).
    {
      active: true,
      class: {
        root: 'bg-[color:var(--_c-button-active-bg,var(--_c-button-fill))] text-[color:var(--_c-button-active-fg,var(--_c-button-on-fill))] hover:bg-[color:var(--_c-button-active-hover-bg,var(--_c-button-fill-hover))]',
      },
    },
    // ---- disabled (overrides appearance bg/text/border) ------------------
    // One neutral look for every variant. Non-inverted disabled is the muted
    // neutral surface; inverted disabled dims the mode-invariant inverse
    // foreground (it sits on a dark backdrop).
    // Disabled TEXT uses the disabled tier, not muted or faint: both are
    // hint-text inks held to WCAG AA contrast, so on a disabled control they
    // read as enabled. `on-surface-disabled` is the step the disabled options
    // and days use (disabled text is exempt from AA contrast).
    // Each re-declares `hover:bg-*` matching its own bg so the appearance hover
    // (all `hover:bg-*`) is neutralised now that disabled no longer relies on
    // `pointer-events-none` for hover suppression (see the tv header comment).
    {
      class: {
        root: 'bg-surface-muted text-on-surface-disabled hover:bg-surface-muted',
      },
      disabled: true,
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: {
        root: 'bg-inverse-on/10 text-inverse-on/40 hover:bg-inverse-on/10',
      },
      disabled: true,
      ghost: false,
      inverted: true,
      outlined: false,
      text: false,
    },
    {
      class: {
        root: 'bg-surface-muted text-on-surface-disabled hover:bg-surface-muted',
      },
      disabled: true,
      ghost: true,
      inverted: false,
    },
    {
      class: {
        root: 'bg-inverse-on/10 text-inverse-on/40 hover:bg-inverse-on/10',
      },
      disabled: true,
      ghost: true,
      inverted: true,
    },
    {
      class: {
        root: 'bg-transparent text-on-surface-disabled hover:bg-transparent',
      },
      disabled: true,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-on-surface-disabled ring-2 ring-border ring-inset hover:bg-transparent',
      },
      disabled: true,
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on/40 ring-2 ring-inverse-on/40 ring-inset hover:bg-transparent',
      },
      disabled: true,
      inverted: true,
      outlined: true,
    },
  ],
  defaultVariants: {
    active: false,
    disabled: false,
    fit: false,
    ghost: false,
    inverted: false,
    loading: false,
    noRadius: false,
    outlined: false,
    size: 'default',
    slotted: false,
    text: false,
    variant: 'primary',
  },
  slots: {
    content: 'grid w-full items-stretch font-bold select-none',
    contentInner:
      'flex items-center justify-center gap-2 whitespace-nowrap transition-opacity duration-200',
    description: 'px-3 pb-3 text-left text-xs font-normal',
    iconWrap: 'inline-flex items-center fill-current',
    // The default slot: a slotted button inherits the root's corners through
    // it, as through the wrappers.
    label: '',
    loader: 'pointer-events-none absolute inset-0 grid place-content-center',
    ripple:
      'pointer-events-none absolute rounded-full bg-current transition-[transform,opacity] duration-[600ms] ease-out',
    // The clip follows the root's corners: `border-radius` inherits, but
    // `corner-shape` (the squircle of `rounded-csc-md`) does not, so it is
    // inherited explicitly — a round clip inside a squircle let the ripple
    // bleed past the painted corner.
    ripples:
      'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] [corner-shape:inherit]',
    // `root` is the public part; the host itself is `display:contents`.
    // The typeface comes from the page through preflight's `font: inherit` on
    // native buttons (ADR-0072). Font *size* is owned by the `size` variant's
    // `text-*` (and consumer overrides), which outranks preflight's layer.
    root: 'relative m-0 inline-grid min-w-22 transform-gpu cursor-pointer place-items-center rounded-csc-md border-0 p-0 no-underline transition-colors duration-300 ease-in-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--_c-button-ring) focus-visible:outline-solid',
    spinner:
      'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
  },
  variants: {
    active: { true: '' },
    disabled: { true: { root: 'cursor-not-allowed' } },
    fit: { true: { root: 'w-full' } },
    // Appearance flags, one per non-filled appearance (resolved from the
    // `appearance` prop below): base look set in compoundVariants above so
    // the inverted/disabled intersections can override cleanly.
    ghost: { true: '' },
    inverted: { true: '' },
    loading: {
      true: {
        contentInner: 'opacity-0',
        root: 'pointer-events-none [--_c-button-label-opacity:0]',
      },
    },
    noRadius: { true: { root: 'rounded-none' } },
    outlined: { true: '' },
    size: sizeVariants,
    // A slotted button fills the root: the content wrappers step out of the
    // box tree (`contents`) so it is the root's grid item, and pass the
    // corners down for its focus ring. The icon and description stay hidden.
    slotted: {
      true: {
        content: 'contents rounded-[inherit] [corner-shape:inherit]',
        contentInner: 'contents rounded-[inherit] [corner-shape:inherit]',
        label: 'rounded-[inherit] [corner-shape:inherit]',
      },
    },
    text: { true: '' },
    variant: variantVariants,
  },
});

const props = withDefaults(defineProps<CButtonProps>(), {
  // `active` deliberately defaults to undefined — "not a toggle button" (no
  // aria-pressed), which a false default could not express. The explicit
  // entry matters: without ANY default, Vue's Boolean casting turns an
  // absent prop into `false`, which would stamp aria-pressed="false" on
  // every regular action button.
  active: undefined,
  // Unset, so the deprecated booleans still choose until 5.0.
  appearance: undefined,
  asTab: false,
  danger: false,
  disabled: false,
  fit: false,
  ghost: false,
  href: '',
  inverted: false,
  loading: false,
  noRadius: false,
  noRipple: false,
  outlined: false,
  size: 'default',
  target: '',
  text: false,
  type: 'button',
  value: undefined,
  // Unset, so an app default or the deprecated `danger` can choose.
  variant: undefined,
});

const appearance = computed(() => resolveAppearance(props));

// Defaultable props resolve host attribute → own property → app default →
// built-in (see src/shared/appDefaults.ts). The variant reads the element's
// own `variant`, then its deprecated `danger`, before the app default.
const appDefault = useAppDefault('c-button', props);

const variantResolved = appDefault(
  'variant',
  'primary',
  'danger',
  dangerAsVariant,
);

// Attributes can deliver any string at runtime; unknown values fall back to
// the defaults.
const ui = computed(() =>
  button({
    active: props.active === undefined ? false : coerceBoolean(props.active),
    disabled: disabledResolved.value,
    fit: props.fit,
    ghost: appearance.value === 'ghost',
    inverted: props.inverted,
    loading: props.loading,
    noRadius: props.noRadius,
    outlined: appearance.value === 'outlined',
    size: props.size in sizeVariants ? props.size : 'default',
    slotted: !!slotted.value,
    text: appearance.value === 'text',
    variant:
      variantResolved.value in variantVariants
        ? variantResolved.value
        : 'primary',
  }),
);

// Guard the native passthrough too: an invalid `type` attribute would
// otherwise hit the browser default state, which is `submit` — not our
// declared default of `button`.
const buttonTypes: Record<CButtonType, true> = {
  button: true,
  reset: true,
  submit: true,
};

const buttonType = computed(() =>
  props.type in buttonTypes ? props.type : 'button',
);

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const host = useHost();

const hasIcon = useHasSlot(rootRef, 'icon');

const hasDescription = useHasSlot(rootRef, 'description');

// aria-pressed marks the button as a toggle, so it is stamped only when the
// consumer (or c-button-group) has actually given `active` a value — a
// regular action button must not carry aria-pressed="false".
const ariaPressed = computed(() =>
  props.active === undefined ? undefined : String(coerceBoolean(props.active)),
);

const spinnerSize = computed(() => {
  if (props.size === 'small') return 20;

  if (props.size === 'large') return 28;

  return 24;
});

// Material-style click ripple (shared logic in useRipple). The `ripple` tv
// slot carries the transition utilities that tween each <span>.
const { ripples, spawn: spawnRipple } = useRipple({
  container: () => rootRef.value,
});

// The element is form-associated without a value (ADR-0084): its form owner
// is the form a native button there would have — the `<form>` around it, or
// the one its `form` attribute names — and a disabled `<fieldset>` around it
// disables it, a link excepted, as native links are.
const { form, formDisabled } = useFormAssociation({
  name: () => undefined,
  reset: () => {},
  value: () => null,
});

// ---- slotted button (ADR-0085): state ---------------------------------------

/** The page's own `<button>` the element frames, if any. */
const slotted = shallowRef<HTMLButtonElement | null>(null);

/** The slotted button's own `disabled`. */
const slottedDisabled = ref(false);

// The root is the native control, a link, or — framing a slotted button — a
// box that only paints.
const tag = computed(() => {
  if (slotted.value) return 'span';

  return props.href ? 'a' : 'button';
});

// A disabled fieldset disables a slotted button natively and the element
// with it. The element's own `disabled` still disables it too: the browser
// keeps clicks from the content of a disabled form-associated element.
const disabledResolved = computed(() =>
  slotted.value
    ? slottedDisabled.value || props.disabled || formDisabled.value
    : props.disabled || (formDisabled.value && !props.href),
);

const onClick = (event: MouseEvent) => {
  if (disabledResolved.value || props.loading) {
    event.preventDefault();
    event.stopPropagation();

    return;
  }

  if (!props.noRipple) spawnRipple(event);

  // `type` acts on the element's form, as on a native button (3.x did it
  // through a hidden submit button): submit validates and submits it, reset
  // resets it. A slotted button acts on its own.
  if (props.href || slotted.value) return;

  if (buttonType.value === 'submit') form()?.requestSubmit();
  else if (buttonType.value === 'reset') form()?.reset();
};

const onKeydown = (event: KeyboardEvent) => {
  // A loading slotted button's clicks are cancelled where they start (adopt).
  if (slotted.value) return;

  // Disabled or loading, the keys that would activate it do nothing; every
  // other key goes on its way — Tab held back would trap the focus here.
  if (disabledResolved.value || props.loading) {
    if (event.key === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      event.stopPropagation();
    }

    return;
  }

  // A link activates natively on Enter, honouring `target`. Space, which a
  // button answers and a link does not, clicks it the same way —
  // `window.open(href, '')` would open a new tab for the empty target.
  if (tag.value === 'a' && event.code === 'Space') {
    event.preventDefault();
    rootRef.value?.click();
  }
};

// The page's id references on the element reach the element carrying its role.
useIdReferences(() => slotted.value ?? rootRef.value);

// ---- slotted button (ADR-0085): adoption -------------------------------------

/**
 * Host props a slotted button's own attributes replace: set beside one, they
 * are ignored.
 */
const REPLACED_PROPS = {
  href: '',
  target: '',
  type: 'button',
  value: undefined,
} as const;

const warnReplaced = () => {
  const set = Object.entries(REPLACED_PROPS)
    .filter(([key, unset]) => {
      const value = props[key as keyof typeof REPLACED_PROPS];

      return value !== unset && value !== undefined;
    })
    .map(([key]) => key);

  if (set.length)
    console.warn(
      `c-button: ${set.join(', ')} ignored beside a slotted <button>, whose own attributes apply (ADR-0085)`,
    );

  if (props.disabled)
    console.warn(
      'c-button: disabled beside a slotted <button> blocks its clicks but leaves it enabled to assistive technology; set the button’s own (ADR-0085)',
    );

  if (
    host?.querySelector(':scope > [slot="icon"], :scope > [slot="description"]')
  )
    console.warn(
      'c-button: the icon and description slots are ignored beside a slotted <button>; put an icon inside the button (ADR-0085)',
    );
};

let release: (() => void) | null = null;

/** Frame `button` as the element's control, or go back to its own. */
function adopt(button: HTMLButtonElement | null): void {
  if (button === slotted.value) return;

  release?.();
  release = null;
  slotted.value = button;

  if (!button) return;

  ensureButtonStyles();
  warnReplaced();

  const readDisabled = () => {
    slottedDisabled.value = button.disabled;
  };

  readDisabled();

  const attrObserver = new MutationObserver(readDisabled);

  attrObserver.observe(button, { attributeFilter: ['disabled'] });

  // While loading, or disabled through the element, the button stays enabled
  // and its clicks are cancelled before anything hears them — a press, a
  // key, Enter in a field — so it neither submits nor runs the page's own
  // handler.
  const onClickCapture = (event: MouseEvent) => {
    if (!props.loading && !props.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  button.addEventListener('click', onClickCapture, { capture: true });
  button.classList.add('c-button__slotted');

  release = () => {
    attrObserver.disconnect();
    button.removeEventListener('click', onClickCapture, { capture: true });
    button.classList.remove('c-button__slotted');
  };
}

const refreshSlotted = () =>
  adopt(
    host?.querySelector<HTMLButtonElement>(':scope > button:not([slot])') ??
      null,
  );

let childObserver: MutationObserver | null = null;

onMounted(() => {
  refreshSlotted();

  if (host && typeof MutationObserver !== 'undefined') {
    childObserver = new MutationObserver(refreshSlotted);
    childObserver.observe(host, { childList: true });
  }
});

onBeforeUnmount(() => {
  childObserver?.disconnect();
  adopt(null);
});
</script>
