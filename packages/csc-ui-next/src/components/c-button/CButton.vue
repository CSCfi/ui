<template>
  <component
    :is="href ? 'a' : 'button'"
    ref="root"
    part="root"
    :id="hostId || undefined"
    :type="href ? undefined : type"
    :disabled="href ? undefined : disabled || undefined"
    :href="href || undefined"
    :target="href ? target : undefined"
    :class="ui.root({ class: override.root })"
    @click="onClick"
    @keydown="onKeydown"
  >
    <span part="content" :class="ui.content({ class: override.content })">
      <span :class="ui.contentInner()">
        <span v-show="hasIcon" :class="ui.iconWrap()">
          <slot name="icon" />
        </span>
        <slot />
      </span>

      <span
        v-show="hasDescription"
        part="description"
        :class="ui.description({ class: override.description })"
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
import {
  computed,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  type PropType,
} from "vue";
import { tv } from "tailwind-variants";
import { useHasSlot } from "../../shared/useHasSlot";

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * `slots` are the component's parts, `variants`/`compoundVariants` replace the
 * original `:host([…])` selector cascade, and `tailwind-variants` bundles the
 * `tailwind-merge` that powers the `override` prop's consumer-wins override.
 *
 * `compoundVariants` are ordered to mirror the original c-button.scss source
 * order so tailwind-merge's last-wins resolution reproduces the cascade.
 * Hover utilities are unguarded because the disabled state sets
 * `pointer-events-none`, so a disabled button never receives :hover.
 */
const button = tv({
  slots: {
    // `root` is the public part; the host itself is `display:contents`.
    // `font-family: inherit` only — native buttons don't inherit it. Font
    // *size* is owned by the `size` variant's `text-*` (and consumer
    // overrides); inheriting the whole `font` shorthand would reset it.
    root: "inline-grid place-items-center relative min-w-max overflow-hidden min-w-22 rounded border-0 m-0 p-0 [font-family:inherit] no-underline self-start justify-self-start cursor-pointer transform-gpu transition-colors duration-300 ease-in-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid",
    content:
      "relative flex flex-col items-stretch w-full font-bold select-none",
    contentInner:
      "flex items-center justify-center gap-2 whitespace-nowrap transition-opacity duration-200",
    iconWrap: "inline-flex items-center fill-current",
    description: "font-normal text-xs px-3 pb-3 text-left",
    loader: "absolute inset-0 grid place-content-center pointer-events-none",
    spinner:
      "inline-block border-2 border-solid border-current border-r-transparent rounded-full animate-spin",
    ripples:
      "absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]",
    ripple:
      "absolute rounded-full bg-current pointer-events-none transition-[transform,opacity] duration-[600ms] ease-out",
  },
  variants: {
    size: {
      small: {
        root: "min-h-7 text-sm",
        contentInner: "h-full px-3",
        iconWrap: "text-xl",
      },
      default: {
        root: "min-h-11 text-base",
        contentInner: "h-full px-4",
        iconWrap: "text-2xl",
      },
      large: {
        root: "min-h-13 text-lg",
        contentInner: "h-full px-6",
        iconWrap: "text-2xl",
      },
    },
    fit: { true: { root: "w-full" } },
    noRadius: { true: { root: "rounded-none" } },
    loading: { true: { contentInner: "opacity-0" } },
    // Appearance flags: base look set in compoundVariants below so the
    // inverted/disabled intersections can override cleanly.
    inverted: { true: "" },
    danger: { true: "" },
    ghost: { true: "" },
    text: { true: "" },
    outlined: { true: "" },
    disabled: { true: { root: "cursor-not-allowed pointer-events-none" } },
  },
  compoundVariants: [
    // ---- default (no appearance flag) -----------------------------------
    {
      inverted: false,
      danger: false,
      ghost: false,
      text: false,
      outlined: false,
      class: {
        root: "bg-primary-600 text-white hover:bg-primary-400 focus-visible:outline-primary-600",
      },
    },
    {
      inverted: true,
      danger: false,
      ghost: false,
      text: false,
      outlined: false,
      class: {
        root: "bg-white text-primary-600 hover:bg-primary-200 focus-visible:outline-white",
      },
    },
    // ---- danger ----------------------------------------------------------
    {
      danger: true,
      inverted: false,
      class: {
        root: "bg-error-600 text-white hover:bg-error-400 focus-visible:outline-error-600",
      },
    },
    {
      danger: true,
      inverted: true,
      class: {
        root: "bg-white text-error-600 hover:bg-error-100 focus-visible:outline-white",
      },
    },
    // ---- ghost -----------------------------------------------------------
    {
      ghost: true,
      inverted: false,
      class: {
        root: "bg-primary-200 text-primary-600 hover:bg-primary-100 focus-visible:outline-primary-600",
      },
    },
    {
      ghost: true,
      inverted: true,
      class: {
        root: "bg-white/20 text-white hover:bg-white/30 focus-visible:outline-white",
      },
    },
    // ---- text ------------------------------------------------------------
    {
      text: true,
      inverted: false,
      class: {
        root: "bg-transparent text-primary-600 hover:bg-primary-100 focus-visible:outline-primary-600",
      },
    },
    {
      text: true,
      inverted: true,
      class: {
        root: "bg-transparent text-white hover:bg-white/30 focus-visible:outline-white",
      },
    },
    // ---- outlined --------------------------------------------------------
    {
      outlined: true,
      inverted: false,
      class: {
        root: "bg-transparent text-primary-600 ring-2 ring-inset ring-primary-600 hover:bg-primary-200 focus-visible:outline-primary-600",
      },
    },
    {
      outlined: true,
      inverted: true,
      class: {
        root: "bg-transparent text-white ring-2 ring-inset ring-white hover:bg-white/30 focus-visible:outline-white",
      },
    },
    // ---- disabled (overrides appearance bg/text/border) ------------------
    {
      disabled: true,
      danger: false,
      ghost: false,
      text: false,
      outlined: false,
      inverted: false,
      class: { root: "bg-tertiary-100 text-tertiary-600" },
    },
    {
      disabled: true,
      danger: false,
      ghost: false,
      text: false,
      outlined: false,
      inverted: true,
      class: { root: "bg-tertiary-100 text-tertiary-500" },
    },
    {
      disabled: true,
      danger: true,
      class: { root: "bg-tertiary-100 text-tertiary-600" },
    },
    {
      disabled: true,
      ghost: true,
      inverted: false,
      class: { root: "bg-tertiary-100 text-tertiary-600" },
    },
    {
      disabled: true,
      ghost: true,
      inverted: true,
      class: { root: "bg-white/5 text-tertiary-400" },
    },
    {
      disabled: true,
      text: true,
      class: { root: "bg-transparent text-tertiary-400" },
    },
    {
      disabled: true,
      outlined: true,
      inverted: false,
      class: {
        root: "bg-transparent text-tertiary-500 ring-2 ring-inset ring-tertiary-400",
      },
    },
    {
      disabled: true,
      outlined: true,
      inverted: true,
      class: {
        root: "bg-transparent text-tertiary-400 ring-2 ring-inset ring-tertiary-400",
      },
    },
  ],
  defaultVariants: {
    size: "default",
    inverted: false,
    danger: false,
    ghost: false,
    text: false,
    outlined: false,
    disabled: false,
    fit: false,
    noRadius: false,
    loading: false,
  },
});

/** Public, overridable parts of c-button (ADR-0004). */
type ButtonParts = Partial<Record<"root" | "content" | "description", string>>;

const props = defineProps({
  inverted: { type: Boolean, default: false },
  outlined: { type: Boolean, default: false },
  ghost: { type: Boolean, default: false },
  danger: { type: Boolean, default: false },
  text: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  fit: { type: Boolean, default: false },
  noRadius: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: "button" },
  size: { type: String, default: "default" },
  href: { type: String, default: "" },
  target: { type: String, default: "_blank" },
  hostId: { type: String, default: "" },
  value: { type: [String, Number], default: undefined },
  // Used when the button acts as a tab inside <c-tab-buttons>.
  tabs: { type: Boolean, default: false },
  // Per-part Tailwind class overrides; merged consumer-wins (ADR-0004).
  override: { type: Object as PropType<ButtonParts>, default: () => ({}) },
});

const ui = computed(() =>
  button({
    size: props.size as "small" | "default" | "large",
    inverted: props.inverted,
    danger: props.danger,
    ghost: props.ghost,
    text: props.text,
    outlined: props.outlined,
    disabled: props.disabled,
    fit: props.fit,
    noRadius: props.noRadius,
    loading: props.loading,
  }),
);

const root = useTemplateRef<HTMLElement>("root");
const hasIcon = useHasSlot(root, "icon");
const hasDescription = useHasSlot(root, "description");
const host = useHost();

// Resolve the tab value: explicit `value` prop, else the data-index that
// c-tab-buttons stamps onto each button.
const tabValue = () => props.value ?? host?.dataset.index;

const emitTab = (name: string, detail: unknown) => {
  host?.dispatchEvent(
    new CustomEvent(name, { detail, bubbles: true, composed: true }),
  );
};

// In tabs mode, mirror the Stencil c-button: emit tabFocus on focus so
// the parent <c-tab-buttons> can drive arrow-key navigation.
onMounted(() => {
  if (!host || !props.tabs) return;
  host.addEventListener("focus", () => emitTab("tabFocus", tabValue()), {
    passive: true,
  });
});

const spinnerSize = computed(() => {
  if (props.size === "small") return 20;
  if (props.size === "large") return 28;
  return 24;
});

interface Ripple {
  id: number;
  style: Record<string, string>;
}
const ripples = ref<Ripple[]>([]);
let rippleId = 0;
const RIPPLE_DURATION_MS = 600;

// Material-style ripple. Each click spawns a <span> sized to the button's
// bounding box, centred on the click point. Instead of a CSS @keyframes
// (ADR-0004 bans bespoke keyframes), it starts at scale(0)/opacity .25 and,
// on the next frame, is mutated to scale(1)/opacity 0 — the `transition`
// utility on the `ripple` slot tweens it. JS removes it after the duration.
const spawnRipple = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  // Keyboard-triggered clicks (Enter / Space on a focused button) fire
  // with detail=0 and clientX/Y=0. Centre the ripple in those cases so it
  // doesn't get positioned off-screen and clipped.
  const isKeyboardActivation =
    event.detail === 0 && event.clientX === 0 && event.clientY === 0;
  const originX = isKeyboardActivation
    ? rect.left + rect.width / 2
    : event.clientX;
  const originY = isKeyboardActivation
    ? rect.top + rect.height / 2
    : event.clientY;
  const x = originX - rect.left - size / 2;
  const y = originY - rect.top - size / 2;
  const id = ++rippleId;
  const base = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    height: `${size}px`,
  };
  ripples.value.push({
    id,
    style: { ...base, transform: "scale(0)", opacity: "0.25" },
  });
  // Double rAF so the browser paints the initial state before the transition.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const ripple = ripples.value.find((r) => r.id === id);
      if (ripple)
        ripple.style = { ...base, transform: "scale(1)", opacity: "0" };
    });
  });
  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id);
  }, RIPPLE_DURATION_MS);
};

const onClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  spawnRipple(event);
  if (props.tabs) {
    emitTab("tabChange", { value: tabValue(), element: host });
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.code === "Space" || event.code === "Enter") {
    if (props.href) {
      window.open(props.href, props.target);
      event.preventDefault();
    }
  }
};
</script>
