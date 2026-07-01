<template>
  <c-button
    ref="btnRef"
    :disabled
    :size
    :value
    exportparts="root, content, description"
    fit
    no-ripple
    text
  >
    <slot />
  </c-button>
</template>

<script setup lang="ts">
import { computed, onMounted, useHost, useTemplateRef, watch } from 'vue';

/**
 * A single button inside <c-tab-buttons>. It is a thin behavioural wrapper
 * around c-button (ADR-0006): it reuses c-button's ripple / a11y / sizing and
 * forwards its `part`s via `exportparts`, while exposing a clean, semantic
 * surface to both the parent and the consumer:
 *
 *  - The parent c-tab-buttons sets `active` / `value` / `size` / `disabled` and
 *    listens for the `tabChange` / `tabFocus` events emitted here. It no longer
 *    reaches into c-button internals.
 *  - Consumers style per state with `c-tab-button[active]::part(root)` /
 *    `c-tab-button:not([active])::part(root)` (shape/layout/arbitrary values),
 *    and re-theme colour via `--c-*` tokens (ADR-0004/0006).
 *
 * The host stays `display:contents` (global) and carries no styling of its own.
 * The button itself is always the transparent `text` variant of c-button: the
 * solid active fill is drawn ONCE by the parent c-tab-buttons as a single
 * absolutely-positioned indicator that slides between buttons (so the fill can
 * animate between selections). Here we only flip the *text colour* on `active`.
 */
interface CTabButtonProps {
  /** Active (selected) state — set by the parent c-tab-buttons. */
  active?: boolean;
  disabled?: boolean;
  size?: string;
  /** Tab value. Falls back to the data-index stamped by c-tab-buttons. */
  value?: number | string;
}

const props = withDefaults(defineProps<CTabButtonProps>(), {
  active: false,
  disabled: false,
  size: 'default',
  value: undefined,
});

const host = useHost();

const btnRef = useTemplateRef<HTMLElement>('btnRef');

// Tab buttons are a touch more compact than a standalone c-button, so the
// wrapped button's min-height is driven here (per `size`) rather than letting
// c-button's own size min-height stand. Consumed by the `::part(root)` rule in
// the <style> block below via the inherited CSS var.
const minHeight = computed(() => {
  if (props.size === 'small') return '28px';

  if (props.size === 'large') return '44px';

  return '36px';
});

// The focusable native control lives in the wrapped c-button's shadow — one
// hop from here. The parent drives roving focus through `focusButton`.
const nativeControl = (): HTMLElement | null =>
  (btnRef.value?.shadowRoot?.querySelector(
    'button, a',
  ) as HTMLElement | null) ?? null;

// Resolve the tab value: explicit `value`, else the data-index c-tab-buttons
// stamps on this host (index-based mode).
const tabValue = (): number | string | undefined =>
  props.value ?? host?.dataset.index;

const emitTab = (name: string, detail: unknown) =>
  host?.dispatchEvent(
    new CustomEvent(name, { bubbles: true, composed: true, detail }),
  );

// Roving tabindex: only the active button is in the tab order; arrow-key
// navigation focuses the others programmatically (works even at tabindex -1).
const setTabbable = (tabbable: boolean) => {
  const el = nativeControl();

  if (el) el.tabIndex = tabbable ? 0 : -1;
};

const focusButton = () => nativeControl()?.focus();

// The native control IS c-button's `part="root"` element, so its box is the
// exact area the parent's sliding active-indicator must cover. Exposed so
// c-tab-buttons can measure it without reaching through two shadow boundaries.
const getButtonRect = (): DOMRect | null =>
  nativeControl()?.getBoundingClientRect() ?? null;

defineExpose({ focusButton, getButtonRect });

onMounted(() => {
  setTabbable(props.active);

  // The wrapped c-button may not have populated its shadow on the same tick.
  if (!nativeControl()) requestAnimationFrame(() => setTabbable(props.active));

  if (!host) return;
  // Emit the events c-tab-buttons listens for. We own this (rather than
  // c-button's `tabs` mode) so value/index resolution stays here and there is
  // exactly one emission per interaction.
  host.addEventListener('click', () => {
    if (props.disabled) return;
    emitTab('tabChange', { element: host, value: tabValue() });
  });
  host.addEventListener('focusin', () => emitTab('tabFocus', tabValue()));
});

watch(
  () => props.active,
  (active) => setTabbable(active),
);
</script>

<!--
  Escape-hatch CSS (ADR-0007) for styling the *wrapped* c-button from inside this
  component. c-button is a direct child of this shadow tree and forwards its
  parts (see `exportparts` in the template), so they are reachable here with
  `c-button::part(...)`. Crucially, part rules from this (outer) tree beat
  c-button's own *normal* utility declarations in the cascade — so NO `!important`
  is needed for shape / layout / colour overrides. (Colour can alternatively be
  re-themed by overriding the relevant `--c-*` token on `c-button`, which
  inherits across the shadow boundary.) Per-state variants are available via the
  `:host([active])` selector since c-tab-buttons reflects `active` onto the host.

  Uncomment / edit to restyle the tab buttons, e.g.:

  c-button::part(root) {
    border-radius: 0;
    min-width: 0;
    padding-inline: 12px;
  }
  :host([active]) c-button::part(root) {
    font-weight: 600;
  }
-->
<style>
/*
  The parent's sliding indicator paints the active fill *behind* this button,
  so the button stays transparent and we only flip the text colour to read on
  top of the (primary-600) indicator. (Outer-tree ::part rules beat c-button's
  own `text-primary-600` utility without !important — see comment above.)
  The active button suppresses its own hover bg so the indicator shows cleanly;
  inactive buttons keep a subtle hover wash.
*/
:host([active]) c-button::part(root) {
  color: #fff;
}

:host([active]) c-button::part(root):hover {
  background-color: transparent;
}

:host(:not([active])) c-button:not([disabled])::part(root):hover {
  /*
    Elevate the button off the sunken track (c-tab-buttons' `bg-surface-sunken`)
    on hover. Authored against the semantic `surface-raised` token so it themes
    itself — white in light, slate-900 in dark — via the inherited `--c-*` vars,
    covering both the data-theme and prefers-color-scheme activation paths. (A
    shadow-local `[data-theme='dark']` rule can't work: data-theme lives on the
    document root, outside this shadow tree.)

    `c-button:not([disabled])` is required: c-button no longer sets
    `pointer-events:none` when disabled (so its not-allowed cursor can show), so
    this outer ::part hover would otherwise override a disabled tab button's
    muted bg. c-button reflects `disabled` to an attribute, so the guard engages.
  */
  background-color: var(--c-surface-raised);
  color: var(--c-on-raised);
}

:host c-button::part(root) {
  min-height: v-bind(minHeight);
  /*
    c-button's base `min-w-max` is clobbered by its own `min-w-22` (88px) floor,
    so as a flex item it shrinks below its content width — the content's
    min-content then overflows the (transparent) button box and the sliding
    indicator, which tracks this box, ends up narrower than the visible label.
    Tab buttons want no artificial floor (the Stencil original set
    `--_c-button-min-width: auto`): pin the box to at least its content width so
    box, label, hover wash and indicator all coincide.
  */
  min-width: max-content;
}

:host c-button[size='small']::part(root) {
  min-height: var(--c-tab-button-min-height, 24px);
}

:host c-button[size='small'] c-icon::part(root) {
  height: 10px !important;
}
</style>
