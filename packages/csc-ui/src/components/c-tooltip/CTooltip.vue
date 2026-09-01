<template>
  <!-- Anchor wrapper: a shadow-DOM box around the slotted trigger. CSS anchor
       names are tree-scoped, so the anchor must live in the same shadow root
       as the panel — we cannot anchor to the light-DOM trigger directly.
       The wrapper carries `anchor-name`; the panel references it. Hover and
       focus interaction listen here: `focusin`/`focusout` bubble from the
       slotted trigger, `pointerenter`/`pointerleave` fire on the wrapper box
       itself. -->
  <span
    ref="anchorRef"
    :class="ui.trigger()"
    part="trigger"
    style="anchor-name: --c-tooltip-anchor"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @pointerenter="onTriggerPointerEnter"
    @pointerleave="onTriggerPointerLeave"
  >
    <slot name="trigger" />
  </span>

  <!-- Proxy anchor for a designated trigger (ADR-0038): anchor names are
       tree-scoped, so the panel cannot anchor to an outer-tree element
       directly. This inert box is pinned over the designated trigger's rect
       while the panel is open; the panel's position-anchor switches to it. -->
  <span
    ref="proxyRef"
    :class="ui.proxy()"
    aria-hidden="true"
    style="anchor-name: --c-tooltip-designated"
  />

  <!-- Manual popover in the top layer: never clipped by overflow, no teleport,
       no z-index war; paints above modals, which is correct for a tooltip
       triggered from inside one. Positioned with CSS anchor positioning.
       The panel keeps its own pointer listeners so the tooltip stays visible
       while the pointer travels onto it (WCAG 1.4.13 "hoverable"). -->
  <div
    ref="panelRef"
    :class="ui.panel()"
    :style="panelStyle"
    part="panel"
    popover="manual"
    role="tooltip"
    @pointerenter="onPanelPointerEnter"
    @pointerleave="onPanelPointerLeave"
    @toggle="onToggle"
  >
    <slot name="content">{{ text }}</slot>
  </div>
</template>

<script lang="ts">
import type { CPlacement } from '../../types';

export interface CTooltipProps {
  /**
   * Delay before the tooltip shows on hover, in milliseconds. Keyboard focus
   * shows the tooltip immediately, regardless of this value. Defaults to
   * `400`.
   */
  delay?: number | string;
  /** Distance from the trigger to the tooltip, in pixels. Defaults to `4`. */
  distance?: number | string;
  /** Whether the tooltip is open. Two-way: emits `change:open`. */
  open?: boolean;
  /** Preferred placement of the tooltip relative to the trigger. */
  position?: CPlacement;
  /**
   * The tooltip text. Overridden by the `content` slot when that is
   * populated.
   * @freeform
   */
  text?: string;
  /**
   * Designated trigger: an element elsewhere in the document that the
   * tooltip describes — its document ID, or the element itself. The same
   * trigger concept as the `trigger` slot, supplied by reference: the
   * tooltip wires hover/focus, mirrors `aria-description` onto it and
   * anchors the bubble to it. When both routes are supplied, this prop wins
   * over the slot.
   */
  trigger?: HTMLElement | string;
}
</script>

<script setup lang="ts">
/**
 * @slot trigger - The element the tooltip describes (e.g. a c-icon-button)
 * @slot content - Formatted tooltip content, overriding the `text` prop; must stay non-interactive (ADR-0033)
 *
 * @csspart trigger - The inline wrapper around the slotted trigger, serving as the panel's anchor
 * @csspart panel - The floating tooltip bubble positioned against the trigger
 */
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watch,
} from 'vue';

import { ensureAnchorPositioning } from '../../shared/anchorPolyfill';
import { coerceBoolean } from '../../shared/coerceBoolean';
import { placementAxis, POSITION_AREA } from '../../shared/positionArea';
import { useDesignatedTrigger } from '../../shared/useDesignatedTrigger';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-tooltip>`. */
interface CTooltipEvents {
  /**
   * Fired whenever the tooltip shows or hides, carrying the new open state.
   * Named `change:open`, not `update:open`: Vue's runtime silently drops
   * `onUpdate:*` listeners on custom elements (`isModelListener`), so a
   * template `@update:open` would never be attached.
   */
  'change:open': boolean;
}

/**
 * A non-interactive text hint on the inverted surface tier (ADR-0032),
 * shown on hover/focus of the slotted trigger. Implements the WCAG 1.4.13
 * contract: dismissable with Escape (without moving focus), hoverable (the
 * pointer can travel onto the bubble), persistent while hovered or focused.
 *
 * The tooltip's accessible wiring is `aria-description` mirrored onto the
 * slotted trigger, not `aria-describedby`: ARIA ID references are
 * tree-scoped, so the light-DOM trigger cannot reference the shadow-DOM
 * panel (ADR-0033).
 *
 * Styling is in this `tailwind-variants` config; `::part()` is the
 * customization surface. The `<style>` block is the escape hatch for the
 * un-Tailwind-able anchor-positioning fallbacks and the popover open
 * animation.
 */
const tooltip = tv({
  slots: {
    panel:
      'fixed m-0 [inset:auto] box-border w-max max-w-xs overflow-visible rounded-csc-sm border-0 bg-surface-inverted px-2 py-1 text-sm text-on-surface-inverted shadow-[2px_4px_10px_#00000029]',
    proxy: 'pointer-events-none fixed',
    trigger: 'inline-flex w-max max-w-full',
  },
});

const ui = tooltip();

const props = withDefaults(defineProps<CTooltipProps>(), {
  delay: 400,
  distance: 4,
  open: false,
  position: 'top',
  text: '',
  trigger: undefined,
});

// Anchor wrapper + panel are two root nodes; opt out of attr fallthrough.
defineOptions({ inheritAttrs: false });

const host = useHost();

const anchorRef = useTemplateRef<HTMLElement>('anchorRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const proxyRef = useTemplateRef<HTMLElement>('proxyRef');

const isOpen = ref(false);

// Grace period before hiding, so the pointer can cross the trigger→panel gap
// without the tooltip vanishing (WCAG 1.4.13 "hoverable").
const HIDE_GRACE = 150;

let showTimer: null | number = null;

let hideTimer: null | number = null;

const clearTimers = () => {
  if (showTimer !== null) clearTimeout(showTimer);

  if (hideTimer !== null) clearTimeout(hideTimer);

  showTimer = hideTimer = null;
};

// The gap is applied on the placement's axis (both sides, so it survives the
// position-try flip fallbacks). Unlike c-menu there is no nested panel to
// inherit it, so it is inlined directly instead of published as a custom
// property.
// With a designated trigger the panel anchors to the tracked proxy instead
// of the trigger-slot wrapper (ADR-0038).
const panelStyle = computed(
  () =>
    `position-anchor:${
      designated.element.value ? '--c-tooltip-designated' : '--c-tooltip-anchor'
    };position-area:${
      POSITION_AREA[props.position] ?? POSITION_AREA.top
    };inset:auto;margin-${placementAxis(props.position)}:${Number(props.distance) || 0}px;`,
);

// ---- show / hide -----------------------------------------------------------

const emit = useHostEmit<CTooltipEvents>();

const show = () => {
  clearTimers();

  // Re-resolve a designated trigger ID (its element may have appeared since)
  // and pin the proxy anchor before the panel shows, so the first paint is
  // already in place.
  if (props.trigger) designated.resolve();

  designated.startTracking();

  const p = panelRef.value;

  if (p && typeof p.showPopover === 'function' && !p.matches(':popover-open')) {
    p.showPopover();
  }
};

const hide = () => {
  clearTimers();

  const p = panelRef.value;

  if (p && typeof p.hidePopover === 'function' && p.matches(':popover-open')) {
    p.hidePopover();
  }
};

const scheduleShow = () => {
  if (hideTimer !== null) clearTimeout(hideTimer);

  hideTimer = null;

  if (isOpen.value || showTimer !== null) return;

  showTimer = window.setTimeout(show, Number(props.delay) || 0);
};

const scheduleHide = () => {
  if (showTimer !== null) clearTimeout(showTimer);

  showTimer = null;

  if (!isOpen.value || hideTimer !== null) return;

  hideTimer = window.setTimeout(hide, HIDE_GRACE);
};

// ---- interaction -----------------------------------------------------------

// Prop wins: with a designated trigger the slotted element gets no wiring —
// the wrapper's hover/focus events are ignored.
const onTriggerPointerEnter = () => {
  if (!designated.element.value) scheduleShow();
};

const onTriggerPointerLeave = () => {
  if (!designated.element.value) scheduleHide();
};

const onPanelPointerEnter = () => {
  if (hideTimer !== null) clearTimeout(hideTimer);

  hideTimer = null;
};

const onPanelPointerLeave = () => scheduleHide();

// Keyboard focus shows the tooltip immediately — the hover delay exists to
// avoid flicker on pointer travel, which does not apply to focus.
const onFocusIn = () => {
  if (!designated.element.value) show();
};

const onFocusOut = () => {
  if (!designated.element.value) hide();
};

// WCAG 1.4.13 "dismissable": Escape hides the tooltip without moving focus.
// `preventDefault` claims the key so an enclosing c-modal's controller peels
// this overlay first instead of closing itself (ADR-0014).
const onDocKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape' || !isOpen.value) return;

  event.preventDefault();
  hide();
};

// The panel's native `toggle` event is the single source of truth for state:
// it fires for browser-initiated closes too, so state cannot desync.
const onToggle = (event: Event) => {
  const nowOpen = (event as ToggleEvent).newState === 'open';

  isOpen.value = nowOpen;
  emit('change:open', nowOpen);

  if (nowOpen) {
    void ensureAnchorPositioning(host?.shadowRoot);
    document.addEventListener('keydown', onDocKeydown, true);
  } else {
    document.removeEventListener('keydown', onDocKeydown, true);
    designated.stopTracking();
  }
};

// ---- trigger a11y ----------------------------------------------------------

const getSlottedTriggerEl = (): HTMLElement | null => {
  const slot = anchorRef.value?.querySelector('slot');

  const assigned = (slot as HTMLSlotElement | null)?.assignedElements?.() ?? [];

  return (assigned[0] as HTMLElement) ?? null;
};

// ---- designated trigger (ADR-0038) -----------------------------------------

let warnedBothRoutes = false;

const warnIfBothRoutes = () => {
  if (warnedBothRoutes) return;

  warnedBothRoutes = true;
  console.warn(
    '<c-tooltip> received both a slotted trigger and the trigger prop; the prop wins and the slotted element gets no wiring.',
  );
};

const designated = useDesignatedTrigger({
  componentName: 'c-tooltip',
  listeners: {
    focusin: () => show(),
    focusout: () => hide(),
    pointerenter: () => scheduleShow(),
    pointerleave: () => scheduleHide(),
  },
  onElementChange: (el, prev) => {
    prev?.removeAttribute('aria-description');

    if (el && getSlottedTriggerEl()) warnIfBothRoutes();

    syncTriggerDescription();
  },
  proxy: proxyRef,
  source: () => props.trigger,
});

const contentSlotText = (): string => {
  const slot = panelRef.value?.querySelector<HTMLSlotElement>(
    'slot[name="content"]',
  );

  const assigned = slot?.assignedNodes({ flatten: true }) ?? [];

  return assigned
    .map((node) => node.textContent ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Mirror the tooltip content onto the trigger as `aria-description` (a plain
// string). `aria-describedby` cannot be used: ARIA ID references are
// tree-scoped, so a light-DOM trigger cannot point at the shadow-DOM panel
// (ADR-0033). The prop wins over the slot: with a designated trigger the
// description moves there and the slotted element is unwired.
const syncTriggerDescription = () => {
  const designatedEl = designated.element.value;

  const slotted = getSlottedTriggerEl();

  if (designatedEl && slotted) slotted.removeAttribute('aria-description');

  const el = designatedEl ?? slotted;

  if (!el) return;

  const description = contentSlotText() || props.text;

  if (description) el.setAttribute('aria-description', description);
  else el.removeAttribute('aria-description');
};

watch(() => props.text, syncTriggerDescription);

// ---- lifecycle -------------------------------------------------------------

watch(
  () => coerceBoolean(props.open),
  (value) => (value ? show() : hide()),
);

onMounted(() => {
  designated.resolve();

  const triggerSlot = anchorRef.value?.querySelector('slot');

  triggerSlot?.addEventListener('slotchange', syncTriggerDescription);

  const contentSlot = panelRef.value?.querySelector('slot[name="content"]');

  contentSlot?.addEventListener('slotchange', syncTriggerDescription);
  syncTriggerDescription();

  if (coerceBoolean(props.open)) {
    requestAnimationFrame(show);
  }
});

onBeforeUnmount(() => {
  clearTimers();
  document.removeEventListener('keydown', onDocKeydown, true);
});
</script>

<!--
  Escape-hatch CSS — constructs utilities cannot express (ADR-0007):
   - `position-try-fallbacks` on the panel: native flip/shift when the
     preferred placement lacks room (the `position-area` itself is set inline
     from the `position` prop). Un-Tailwind-able at-rule-adjacent syntax.
   - the popover open animation (`@keyframes`).
  The host keeps the global `:host{display:contents}`; the slotted trigger is
  the visible inline box, so no host override is needed here.
-->
<style>
[part='panel'] {
  position-try-fallbacks:
    flip-block,
    flip-inline,
    flip-block flip-inline;
}

[part='panel']:popover-open {
  animation: c-tooltip-fade-in 0.12s ease-out;
}

@keyframes c-tooltip-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
