<template>
  <component
    :is="href ? 'a' : 'button'"
    :id="hostId || undefined"
    ref="rootRef"
    :class="ui.root()"
    :disabled="href ? undefined : disabled || undefined"
    :href="href || undefined"
    :target="href ? target : undefined"
    :type="href ? undefined : type"
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

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed, onMounted, useHost, useTemplateRef } from 'vue';

import { useHasSlot } from '../../shared/useHasSlot';
import { useRipple } from '../../shared/useRipple';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * `slots` are the component's parts and `variants`/`compoundVariants` replace
 * the original `:host([…])` selector cascade. Consumer customization is via
 * `::part()` against the stamped part names (ADR-0006); there is no `override`
 * prop.
 *
 * `compoundVariants` are ordered to mirror the original c-button.scss source
 * order so tailwind-merge's last-wins resolution reproduces the cascade.
 * Hover utilities are unguarded because the disabled state sets
 * `pointer-events-none`, so a disabled button never receives :hover.
 */
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
        root: 'bg-primary-subtle text-primary hover:bg-primary-subtle-hover focus-visible:outline-primary',
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
        root: 'bg-transparent text-primary hover:bg-primary-subtle-hover focus-visible:outline-primary',
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
        root: 'bg-transparent text-primary ring-2 ring-inset ring-primary hover:bg-primary-subtle focus-visible:outline-primary',
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
    // ---- disabled (overrides appearance bg/text/border) ------------------
    // Non-inverted disabled is the muted neutral surface; inverted disabled
    // dims the mode-invariant inverse foreground (it sits on a dark backdrop).
    {
      class: { root: 'bg-surface-muted text-on-surface-muted' },
      danger: false,
      disabled: true,
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: { root: 'bg-inverse-on/10 text-inverse-on/40' },
      danger: false,
      disabled: true,
      ghost: false,
      inverted: true,
      outlined: false,
      text: false,
    },
    {
      class: { root: 'bg-surface-muted text-on-surface-muted' },
      danger: true,
      disabled: true,
    },
    {
      class: { root: 'bg-surface-muted text-on-surface-muted' },
      disabled: true,
      ghost: true,
      inverted: false,
    },
    {
      class: { root: 'bg-inverse-on/10 text-inverse-on/40' },
      disabled: true,
      ghost: true,
      inverted: true,
    },
    {
      class: { root: 'bg-transparent text-on-surface-muted' },
      disabled: true,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-on-surface-muted ring-2 ring-inset ring-border',
      },
      disabled: true,
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on/40 ring-2 ring-inset ring-inverse-on/40',
      },
      disabled: true,
      inverted: true,
      outlined: true,
    },
  ],
  defaultVariants: {
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
    content: 'relative grid items-stretch w-full font-bold select-none',
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
    // `font-family: inherit` only — native buttons don't inherit it. Font
    // *size* is owned by the `size` variant's `text-*` (and consumer
    // overrides); inheriting the whole `font` shorthand would reset it.
    root: 'inline-grid place-items-center relative min-w-max overflow-hidden min-w-22 rounded-csc-md border-0 m-0 p-0 [font-family:inherit] no-underline cursor-pointer transform-gpu transition-colors duration-300 ease-in-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid',
    spinner:
      'inline-block border-2 border-solid border-current border-r-transparent rounded-full animate-spin',
  },
  variants: {
    danger: { true: '' },
    disabled: { true: { root: 'cursor-not-allowed pointer-events-none' } },
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
    size: {
      default: {
        contentInner: 'h-full px-4',
        iconWrap: 'text-2xl',
        root: 'min-h-11 text-base',
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
    },
    text: { true: '' },
  },
});

interface CButtonProps {
  danger?: boolean;
  disabled?: boolean;
  fit?: boolean;
  ghost?: boolean;
  hostId?: string;
  href?: string;
  inverted?: boolean;
  loading?: boolean;
  noRadius?: boolean;
  /** Suppress the click ripple (e.g. when a wrapper owns the press feedback). */
  noRipple?: boolean;
  outlined?: boolean;
  size?: string;
  /** Used when the button acts as a tab inside <c-tab-buttons>. */
  tabs?: boolean;
  target?: string;
  text?: boolean;
  type?: string;
  value?: number | string;
}

const props = withDefaults(defineProps<CButtonProps>(), {
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
  tabs: false,
  target: '_blank',
  text: false,
  type: 'button',
  value: undefined,
});

const ui = computed(() =>
  button({
    danger: props.danger,
    disabled: props.disabled,
    fit: props.fit,
    ghost: props.ghost,
    inverted: props.inverted,
    loading: props.loading,
    noRadius: props.noRadius,
    outlined: props.outlined,
    size: props.size as 'default' | 'large' | 'small',
    text: props.text,
  }),
);

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasIcon = useHasSlot(rootRef, 'icon');

const hasDescription = useHasSlot(rootRef, 'description');

const host = useHost();

// Resolve the tab value: explicit `value` prop, else the data-index that
// c-tab-buttons stamps onto each button.
const tabValue = () => props.value ?? host?.dataset.index;

const emitTab = (name: string, detail: unknown) => {
  host?.dispatchEvent(
    new CustomEvent(name, { bubbles: true, composed: true, detail }),
  );
};

// In tabs mode, mirror the Stencil c-button: emit tabFocus on focus so
// the parent <c-tab-buttons> can drive arrow-key navigation.
onMounted(() => {
  if (!host || !props.tabs) return;
  host.addEventListener('focus', () => emitTab('tabFocus', tabValue()), {
    passive: true,
  });
});

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

  if (props.tabs) {
    emitTab('tabChange', { element: host, value: tabValue() });
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.code === 'Space' || event.code === 'Enter') {
    if (props.href) {
      window.open(props.href, props.target);
      event.preventDefault();
    }
  }
};
</script>
