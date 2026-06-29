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
        root: 'bg-primary-600 text-white hover:bg-primary-400 focus-visible:outline-primary-600',
      },
      danger: false,
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: {
        root: 'bg-white text-primary-600 hover:bg-primary-200 focus-visible:outline-white',
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
        root: 'bg-error-600 text-white hover:bg-error-400 focus-visible:outline-error-600',
      },
      danger: true,
      inverted: false,
    },
    {
      class: {
        root: 'bg-white text-error-600 hover:bg-error-100 focus-visible:outline-white',
      },
      danger: true,
      inverted: true,
    },
    // ---- ghost -----------------------------------------------------------
    {
      class: {
        root: 'bg-primary-200 text-primary-600 hover:bg-primary-100 focus-visible:outline-primary-600',
      },
      ghost: true,
      inverted: false,
    },
    {
      class: {
        root: 'bg-white/20 text-white hover:bg-white/30 focus-visible:outline-white',
      },
      ghost: true,
      inverted: true,
    },
    // ---- text ------------------------------------------------------------
    {
      class: {
        root: 'bg-transparent text-primary-600 hover:bg-primary-100 focus-visible:outline-primary-600',
      },
      inverted: false,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-white hover:bg-white/30 focus-visible:outline-white',
      },
      inverted: true,
      text: true,
    },
    // ---- outlined --------------------------------------------------------
    {
      class: {
        root: 'bg-transparent text-primary-600 ring-2 ring-inset ring-primary-600 hover:bg-primary-200 focus-visible:outline-primary-600',
      },
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-white ring-2 ring-inset ring-white hover:bg-white/30 focus-visible:outline-white',
      },
      inverted: true,
      outlined: true,
    },
    // ---- disabled (overrides appearance bg/text/border) ------------------
    {
      class: { root: 'bg-tertiary-100 text-tertiary-600' },
      danger: false,
      disabled: true,
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: { root: 'bg-tertiary-100 text-tertiary-500' },
      danger: false,
      disabled: true,
      ghost: false,
      inverted: true,
      outlined: false,
      text: false,
    },
    {
      class: { root: 'bg-tertiary-100 text-tertiary-600' },
      danger: true,
      disabled: true,
    },
    {
      class: { root: 'bg-tertiary-100 text-tertiary-600' },
      disabled: true,
      ghost: true,
      inverted: false,
    },
    {
      class: { root: 'bg-white/5 text-tertiary-400' },
      disabled: true,
      ghost: true,
      inverted: true,
    },
    {
      class: { root: 'bg-transparent text-tertiary-400' },
      disabled: true,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-tertiary-500 ring-2 ring-inset ring-tertiary-400',
      },
      disabled: true,
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-tertiary-400 ring-2 ring-inset ring-tertiary-400',
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
