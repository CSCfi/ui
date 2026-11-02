<template>
  <component
    :is="href ? 'a' : 'button'"
    ref="rootRef"
    :aria-pressed="asTab ? undefined : ariaPressed"
    :aria-selected="asTab ? String(coerceBoolean(active)) : undefined"
    :class="ui.root()"
    :disabled="href ? undefined : disabled || undefined"
    :href="href || undefined"
    :role="asTab ? 'tab' : undefined"
    :target="href ? target : undefined"
    :type="href ? undefined : buttonType"
    part="root"
    @click="onClick"
    @keydown="onKeydown"
  >
    <span :class="ui.content()" part="content">
      <span :class="ui.contentInner()">
        <span v-show="hasIcon" :class="ui.iconWrap()">
          <slot name="icon" />
        </span>

        <slot />
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
 * Size of the button.
 */
export type CButtonSize = 'default' | 'large' | 'small';

/**
 * Native `type` of the underlying `<button>` element. Ignored when `href`
 * turns the component into a link.
 */
export type CButtonType = 'button' | 'reset' | 'submit';

interface CButtonProps {
  /**
   * Pressed (toggle) state — renders the selected look and sets
   * `aria-pressed`. Leave unset for regular action buttons: only a
   * true/false value marks the button as a toggle. Driven by
   * `c-button-group` on its slotted buttons.
   */
  active?: boolean;

  /**
   * Be a tab of a tablist: `role="tab"`, with `active` as `aria-selected`
   * instead of `aria-pressed`. c-tab-buttons sets it on its buttons.
   *
   * @internal
   */
  asTab?: boolean;

  /**
   * Danger appearance for a destructive action: the filled button in the error
   * colour; no effect on `outlined`, `ghost` or `text`.
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
   * `inverse-*` family, the same in both theme modes. Combines with the other
   * appearances.
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
}
</script>

<script setup lang="ts">
/**
 * @slot default - Button label content.
 * @slot icon - Leading icon, vertically centered before the label.
 * @slot description - Secondary text rendered below the label.
 *
 * @csspart root - The native `<button>` / `<a>` element carrying the visual styling.
 * @csspart content - Layout wrapper for the label, icon and description.
 * @csspart description - Wrapper of the `description` slot.
 */
import { tv } from 'tailwind-variants';
import { computed, useHost, useTemplateRef } from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { useHasSlot } from '../../shared/useHasSlot';
import { useIdReferences } from '../../shared/useIdReferences';
import { useRipple } from '../../shared/useRipple';

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
const sizeVariants = {
  default: {
    contentInner: 'h-full px-4',
    iconWrap: 'text-2xl',
    // The shared control height (`--_c-control-height`, 52px; ADR-0055), so a
    // button sits level beside a field. `--_c-button-min-height` is an
    // INTERNAL hook (not consumer API): a wrapping c-button-group sets it on
    // its frame so the buttons plus the frame total the control height.
    root: 'min-h-[var(--_c-button-min-height,var(--_c-control-height))] text-base',
  },
  large: {
    contentInner: 'h-full px-6',
    iconWrap: 'text-2xl',
    // The toolbar height, one step above the control height.
    root: 'min-h-toolbar text-lg',
  },
  small: {
    contentInner: 'h-full px-3',
    iconWrap: 'text-xl',
    root: 'min-h-7 text-sm',
  },
} satisfies Record<CButtonSize, object>;

const button = tv({
  compoundVariants: [
    // ---- default (no appearance flag) -----------------------------------
    {
      class: {
        root: 'bg-primary text-on-primary hover:bg-primary-hover focus-visible:outline-primary',
      },
      danger: false,
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: {
        root: 'bg-inverse-surface text-inverse-primary hover:bg-inverse-primary/15 focus-visible:outline-inverse-on',
      },
      danger: false,
      ghost: false,
      inverted: true,
      outlined: false,
      text: false,
    },
    // ---- danger ----------------------------------------------------------
    {
      class: {
        root: 'bg-error text-on-error hover:bg-error-hover focus-visible:outline-error',
      },
      danger: true,
      inverted: false,
    },
    {
      class: {
        root: 'bg-inverse-surface text-inverse-error hover:bg-inverse-error/10 focus-visible:outline-inverse-on',
      },
      danger: true,
      inverted: true,
    },
    // ---- ghost -----------------------------------------------------------
    {
      class: {
        root: 'bg-primary/8 text-primary hover:bg-primary/15 focus-visible:outline-primary active:bg-primary/22',
      },
      ghost: true,
      inverted: false,
    },
    {
      class: {
        root: 'bg-inverse-on/20 text-inverse-on hover:bg-inverse-on/30 focus-visible:outline-inverse-on',
      },
      ghost: true,
      inverted: true,
    },
    // ---- text ------------------------------------------------------------
    {
      class: {
        root: 'bg-transparent text-primary hover:bg-primary/15 focus-visible:outline-primary',
      },
      inverted: false,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on hover:bg-inverse-on/30 focus-visible:outline-inverse-on',
      },
      inverted: true,
      text: true,
    },
    // ---- outlined --------------------------------------------------------
    {
      class: {
        root: 'bg-transparent text-primary ring-2 ring-primary ring-inset hover:bg-primary/15 focus-visible:outline-primary',
      },
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on ring-2 ring-inverse-on ring-inset hover:bg-inverse-on/30 focus-visible:outline-inverse-on',
      },
      inverted: true,
      outlined: true,
    },
    // ---- active (pressed) --------------------------------------------------
    // The selected/toggle look: a primary fill regardless of appearance flag.
    // Authored through internal vars (with semantic-token fallbacks) so
    // c-button-group can retarget the fill per selection mode — e.g. make it
    // transparent while its sliding indicator paints the fill instead. Ordered
    // after the appearance compounds (active wins) and before the disabled
    // ones (disabled wins).
    {
      active: true,
      class: {
        root: 'bg-[color:var(--_c-button-active-bg,var(--c-primary))] text-[color:var(--_c-button-active-fg,var(--c-on-primary))] hover:bg-[color:var(--_c-button-active-hover-bg,var(--c-primary-hover))]',
      },
    },
    // ---- disabled (overrides appearance bg/text/border) ------------------
    // Non-inverted disabled is the muted neutral surface; inverted disabled
    // dims the mode-invariant inverse foreground (it sits on a dark backdrop).
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
      danger: false,
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
      danger: false,
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
      danger: true,
      disabled: true,
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
    danger: false,
    disabled: false,
    fit: false,
    ghost: false,
    inverted: false,
    loading: false,
    noRadius: false,
    outlined: false,
    size: 'default',
    text: false,
  },
  slots: {
    content: 'grid w-full items-stretch font-bold select-none',
    contentInner:
      'flex items-center justify-center gap-2 whitespace-nowrap transition-opacity duration-200',
    description: 'px-3 pb-3 text-left text-xs font-normal',
    iconWrap: 'inline-flex items-center fill-current',
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
    root: 'relative m-0 inline-grid min-w-22 transform-gpu cursor-pointer place-items-center rounded-csc-md border-0 p-0 no-underline transition-colors duration-300 ease-in-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid',
    spinner:
      'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
  },
  variants: {
    active: { true: '' },
    danger: { true: '' },
    disabled: { true: { root: 'cursor-not-allowed' } },
    fit: { true: { root: 'w-full' } },
    ghost: { true: '' },
    // Appearance flags: base look set in compoundVariants below so the
    // inverted/disabled intersections can override cleanly.
    inverted: { true: '' },
    loading: {
      true: { contentInner: 'opacity-0', root: 'pointer-events-none' },
    },
    noRadius: { true: { root: 'rounded-none' } },
    outlined: { true: '' },
    size: sizeVariants,
    text: { true: '' },
  },
});

const props = withDefaults(defineProps<CButtonProps>(), {
  // `active` deliberately defaults to undefined — "not a toggle button" (no
  // aria-pressed), which a false default could not express. The explicit
  // entry matters: without ANY default, Vue's Boolean casting turns an
  // absent prop into `false`, which would stamp aria-pressed="false" on
  // every regular action button.
  active: undefined,
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
});

// Attributes can deliver any string at runtime; unknown values fall back to
// the defaults.
const ui = computed(() =>
  button({
    active: props.active === undefined ? false : coerceBoolean(props.active),
    danger: props.danger,
    disabled: props.disabled,
    fit: props.fit,
    ghost: props.ghost,
    inverted: props.inverted,
    loading: props.loading,
    noRadius: props.noRadius,
    outlined: props.outlined,
    size: props.size in sizeVariants ? props.size : 'default',
    text: props.text,
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

// The nearest <form> around the element, across shadow roots: the native
// button sits in this shadow root, where it has no form owner.
const closestForm = (): HTMLFormElement | null => {
  let el: Element | null = host;

  while (el) {
    const form = el.closest('form');

    if (form) return form;

    const root = el.getRootNode();

    el = root instanceof ShadowRoot ? root.host : null;
  }

  return null;
};

const onClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    event.stopPropagation();

    return;
  }

  if (!props.noRipple) spawnRipple(event);

  // `type` acts on the form around the element, as on a native button (3.x
  // did it through a hidden submit button): submit validates and submits it,
  // reset resets it.
  if (props.href) return;

  if (buttonType.value === 'submit') closestForm()?.requestSubmit();
  else if (buttonType.value === 'reset') closestForm()?.reset();
};

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    event.stopPropagation();

    return;
  }

  // A link activates natively on Enter, honouring `target`. Space, which a
  // button answers and a link does not, clicks it the same way —
  // `window.open(href, '')` would open a new tab for the empty target.
  if (props.href && event.code === 'Space') {
    event.preventDefault();
    rootRef.value?.click();
  }
};

// The page's id references on the element reach the element carrying its role.
useIdReferences(() => rootRef.value);
</script>
