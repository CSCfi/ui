<template>
  <component
    :is="href ? 'a' : 'button'"
    :id="hostId || undefined"
    ref="rootRef"
    :aria-pressed
    :class="ui.root()"
    :disabled="href ? undefined : disabled || undefined"
    :href="href || undefined"
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
export interface CButtonProps {
  /**
   * Pressed (toggle) state — renders the selected look and sets
   * `aria-pressed`. Leave unset for regular action buttons: only a
   * true/false value marks the button as a toggle. Driven by
   * `c-button-group` on its slotted buttons.
   */
  active?: boolean;
  /**
   * Danger variant style
   *
   * @seeded from csc-ui — verify
   */
  danger?: boolean;
  /**
   * Disable the button
   *
   * @seeded from csc-ui — verify
   */
  disabled?: boolean;
  /**
   * Fit width to containing element
   *
   * @seeded from csc-ui — verify
   */
  fit?: boolean;
  /**
   * Light button background
   *
   * @seeded from csc-ui — verify
   */
  ghost?: boolean;
  /**
   * Id of the button
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hostId?: string;
  /**
   * Hyperlink url
   *
   * @seeded from csc-ui — verify
   * @freeform any URL
   */
  href?: string;
  /**
   * Inverted button style for dark backgrounds
   *
   * @seeded from csc-ui — verify
   */
  inverted?: boolean;
  /**
   * Display loader on the button
   *
   * @seeded from csc-ui — verify
   */
  loading?: boolean;
  /**
   * Remove the default border radius
   *
   * @seeded from csc-ui — verify
   */
  noRadius?: boolean;
  /** Suppress the click ripple (e.g. when a wrapper owns the press feedback). */
  noRipple?: boolean;
  /**
   * Outlined button style
   *
   * @seeded from csc-ui — verify
   */
  outlined?: boolean;
  /**
   * Size of the button
   *
   * @seeded from csc-ui — verify
   */
  size?: CButtonSize;
  /**
   * Hyperlink target
   *
   * @seeded from csc-ui — verify
   * @freeform any browsing-context name (e.g. _blank, _self)
   */
  target?: string;
  /**
   * Transparent button background
   *
   * @seeded from csc-ui — verify
   */
  text?: boolean;
  /**
   * Button type
   *
   * @seeded from csc-ui — verify
   */
  type?: CButtonType;
  /**
   * Value for the button
   * - for use in the c-button-group
   *
   * @seeded from csc-ui — verify
   */
  value?: number | string;
}

/**
 * Size of the button.
 */
export type CButtonSize = 'default' | 'large' | 'small';

/**
 * Native `type` of the underlying `<button>` element. Ignored when `href`
 * turns the component into a link.
 */
export type CButtonType = 'button' | 'reset' | 'submit';
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
 *
 * @cssprop --c-font-family - Font stack applied to the label (native buttons do not inherit it).
 */
import { tv } from 'tailwind-variants';
import { computed, useTemplateRef } from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { useHasSlot } from '../../shared/useHasSlot';
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
    // `--_c-button-min-height` is an INTERNAL hook (not consumer API): a
    // wrapping c-button-group sets it on its frame so the buttons plus the
    // 4px frame padding total the 44px field height of c-text-field.
    root: 'min-h-[var(--_c-button-min-height,2.75rem)] text-base',
  },
  large: {
    contentInner: 'h-full px-6',
    iconWrap: 'text-2xl',
    root: 'min-h-13 text-lg',
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
        root: 'bg-primary/8 text-primary hover:bg-primary/15 active:bg-primary/22 focus-visible:outline-primary',
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
        root: 'bg-transparent text-primary ring-2 ring-inset ring-primary hover:bg-primary/15 focus-visible:outline-primary',
      },
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on ring-2 ring-inset ring-inverse-on hover:bg-inverse-on/30 focus-visible:outline-inverse-on',
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
    // Disabled TEXT uses the faint tier, not muted: `on-surface-muted` is the
    // hint-text role and is pinned bright in dark mode by the WCAG AA contrast
    // pass, so on a disabled control it reads as enabled. `on-surface-faint`
    // equals it in light mode (both tertiary-500) and is properly dim in dark
    // (disabled text is exempt from AA contrast).
    // Each re-declares `hover:bg-*` matching its own bg so the appearance hover
    // (all `hover:bg-*`) is neutralised now that disabled no longer relies on
    // `pointer-events-none` for hover suppression (see the tv header comment).
    {
      class: {
        root: 'bg-surface-muted text-on-surface-faint hover:bg-surface-muted',
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
        root: 'bg-surface-muted text-on-surface-faint hover:bg-surface-muted',
      },
      danger: true,
      disabled: true,
    },
    {
      class: {
        root: 'bg-surface-muted text-on-surface-faint hover:bg-surface-muted',
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
        root: 'bg-transparent text-on-surface-faint hover:bg-transparent',
      },
      disabled: true,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-on-surface-faint ring-2 ring-inset ring-border hover:bg-transparent',
      },
      disabled: true,
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on/40 ring-2 ring-inset ring-inverse-on/40 hover:bg-transparent',
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
    content: 'grid items-stretch w-full font-bold select-none',
    contentInner:
      'flex items-center justify-center gap-2 whitespace-nowrap transition-opacity duration-200',
    description: 'font-normal text-xs px-3 pb-3 text-left',
    iconWrap: 'inline-flex items-center fill-current',
    loader: 'absolute inset-0 grid place-content-center pointer-events-none',
    ripple:
      'absolute rounded-full bg-current pointer-events-none transition-[transform,opacity] duration-[600ms] ease-out',
    ripples:
      'absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]',
    // `root` is the public part; the host itself is `display:contents`.
    // Set only `font-family` (via the `--c-font-family` token, consistent with
    // every other component) — native buttons don't inherit it. Font *size* is
    // owned by the `size` variant's `text-*` (and consumer overrides);
    // inheriting the whole `font` shorthand would reset it.
    root: 'inline-grid place-items-center relative min-w-max min-w-22 rounded-csc-md border-0 m-0 p-0 [font-family:var(--c-font-family)] no-underline cursor-pointer transform-gpu transition-colors duration-300 ease-in-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid',
    spinner:
      'inline-block border-2 border-solid border-current border-r-transparent rounded-full animate-spin',
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
  danger: false,
  disabled: false,
  fit: false,
  ghost: false,
  hostId: '',
  href: '',
  inverted: false,
  loading: false,
  noRadius: false,
  noRipple: false,
  outlined: false,
  size: 'default',
  target: '_blank',
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

const onClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    event.stopPropagation();

    return;
  }

  if (!props.noRipple) spawnRipple(event);
};

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    event.stopPropagation();

    return;
  }

  if (event.code === 'Space' || event.code === 'Enter') {
    if (props.href) {
      window.open(props.href, props.target);
      event.preventDefault();
    }
  }
};
</script>
