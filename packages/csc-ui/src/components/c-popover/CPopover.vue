<template>
  <!-- Anchor wrapper: a shadow-DOM box around the slotted trigger. CSS anchor
       names are tree-scoped, so the anchor must live in the same shadow root
       as the panel — we cannot anchor to the light-DOM trigger directly.
       The wrapper carries `anchor-name`; the panel references it. -->
  <span
    ref="anchorRef"
    :class="ui.trigger()"
    part="trigger"
    style="anchor-name: --c-popover-anchor"
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
    style="anchor-name: --c-popover-designated"
  />

  <!-- Manual popover in the top layer: never clipped by overflow, no teleport,
       no z-index war. Manual, not auto: auto popovers across separate shadow
       roots dismiss each other (ADR-0008), so light-dismiss is hand-rolled —
       coordinated across nested popovers by the shared popover chain
       (ADR-0038). Positioned with CSS anchor positioning. -->
  <div
    ref="panelRef"
    :aria-label="panelLabel || undefined"
    :class="ui.panel()"
    :style="panelStyle"
    part="panel"
    popover="manual"
    role="dialog"
    @toggle="onToggle"
  >
    <div v-if="heading" :class="ui.heading()" part="heading">{{ heading }}</div>

    <slot />
  </div>
</template>

<script lang="ts">
import type { CPlacement } from '../../types';

export interface CPopoverProps {
  /** Distance from the trigger to the panel, in pixels. Defaults to `0`. */
  distance?: number | string;
  /**
   * Heading rendered at the top of the panel, doubling as its accessible
   * name. Without it, set `aria-label` on the host. Named `heading`, not
   * `title`: a `title` attribute on the host would trigger the browser's
   * native tooltip and collides with `HTMLElement.title`.
   * @freeform
   */
  heading?: string;
  /** Whether the popover is open. Two-way: emits `change:open`. */
  open?: boolean;
  /** Preferred placement of the panel relative to the trigger. */
  position?: CPlacement;
  /**
   * Designated trigger: an element elsewhere in the document that opens the
   * popover — its document ID, or the element itself. The same trigger
   * concept as the `trigger` slot, supplied by reference: the popover wires
   * click-to-toggle, ARIA and focus return onto it and anchors the panel to
   * it. When both routes are supplied, this prop wins over the slot.
   */
  trigger?: HTMLElement | string;
}
</script>

<script setup lang="ts">
/**
 * @slot trigger - The element that opens the popover (e.g. a c-button)
 * @slot default - The popover's content; may contain interactive elements
 *
 * @csspart trigger - The inline wrapper around the slotted trigger, serving as the panel's anchor
 * @csspart panel - The floating popover surface positioned against the trigger
 * @csspart heading - The heading rendered from the `heading` prop
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
import { deepActiveElement } from '../../shared/modalStack';
import {
  composedContains,
  enterChain,
  leaveChain,
  type PopoverChainEntry,
} from '../../shared/popoverChain';
import { placementAxis, POSITION_AREA } from '../../shared/positionArea';
import { useDesignatedTrigger } from '../../shared/useDesignatedTrigger';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-popover>`. */
interface CPopoverEvents {
  /**
   * Fired whenever the popover opens or closes, carrying the new open state.
   * Named `change:open`, not `update:open`: Vue's runtime silently drops
   * `onUpdate:*` listeners on custom elements (`isModelListener`), so a
   * template `@update:open` would never be attached.
   */
  'change:open': boolean;
}

/**
 * A click-opened, non-modal interactive surface anchored to its trigger
 * (the WAI-ARIA non-modal dialog pattern). Unlike `c-tooltip` its content
 * may be interactive; unlike `c-modal` it never traps focus or blocks the
 * page — light dismiss (click outside) and Escape close it (ADR-0033).
 * Focus is not moved on open; it returns to the trigger on close only when
 * it was inside the popover.
 *
 * Styling is in this `tailwind-variants` config; `::part()` is the
 * customization surface. The `<style>` block is the escape hatch for the
 * un-Tailwind-able anchor-positioning fallbacks and the popover open
 * animation.
 */
const popover = tv({
  slots: {
    heading: 'm-0 mb-2 font-semibold text-on-surface',
    panel:
      'fixed m-0 [inset:auto] box-border w-max max-w-sm overflow-visible rounded-csc-md border-0 bg-surface-overlay p-4 text-on-surface shadow-[2px_4px_10px_#00000029]',
    proxy: 'pointer-events-none fixed',
    trigger: 'inline-flex w-max max-w-full',
  },
});

const ui = popover();

const props = withDefaults(defineProps<CPopoverProps>(), {
  distance: 0,
  heading: '',
  open: false,
  position: 'bottom',
  trigger: undefined,
});

// Anchor wrapper + panel are two root nodes; opt out of attr fallthrough.
defineOptions({ inheritAttrs: false });

const host = useHost();

const anchorRef = useTemplateRef<HTMLElement>('anchorRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const proxyRef = useTemplateRef<HTMLElement>('proxyRef');

const isOpen = ref(false);

// Accessible name: the `heading` prop, or `aria-label` mirrored from the
// host — `aria-labelledby` cannot reference slotted (light DOM) content
// across the shadow boundary.
const panelLabel = ref('');

let pendingReturnFocus = false;

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
    '<c-popover> received both a slotted trigger and the trigger prop; the prop wins and the slotted element gets no wiring.',
  );
};

const setTriggerWiring = (el: HTMLElement | null, expanded: boolean) => {
  if (!el) return;

  el.setAttribute('aria-haspopup', 'dialog');
  el.setAttribute('aria-expanded', String(expanded));
};

const clearTriggerWiring = (el: HTMLElement | null) => {
  el?.removeAttribute('aria-haspopup');
  el?.removeAttribute('aria-expanded');
};

const designated = useDesignatedTrigger({
  componentName: 'c-popover',
  listeners: { click: () => toggle() },
  onElementChange: (el, prev) => {
    clearTriggerWiring(prev);
    setTriggerWiring(el, isOpen.value);

    const slotted = getSlottedTriggerEl();

    if (el && slotted) {
      // Prop wins: the slotted element renders but gets no wiring.
      clearTriggerWiring(slotted);
      warnIfBothRoutes();
    } else if (!el) {
      setTriggerWiring(slotted, isOpen.value);
    }
  },
  proxy: proxyRef,
  source: () => props.trigger,
});

/** The trigger, whichever route supplied it — the prop wins over the slot. */
const getTriggerEl = (): HTMLElement | null =>
  designated.element.value ?? getSlottedTriggerEl();

// The gap is applied on the placement's axis (both sides, so it survives the
// position-try flip fallbacks). Unlike c-menu there is no nested panel to
// inherit it, so it is inlined directly instead of published as a custom
// property. With a designated trigger the panel anchors to the tracked proxy
// instead of the trigger-slot wrapper.
const panelStyle = computed(
  () =>
    `position-anchor:${
      designated.element.value ? '--c-popover-designated' : '--c-popover-anchor'
    };position-area:${
      POSITION_AREA[props.position] ?? POSITION_AREA.bottom
    };inset:auto;margin-${placementAxis(props.position)}:${Number(props.distance) || 0}px;`,
);

// ---- open / close ----------------------------------------------------------

const emit = useHostEmit<CPopoverEvents>();

const openPopover = () => {
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

const closePopover = (returnFocus = false) => {
  pendingReturnFocus = returnFocus;

  const p = panelRef.value;

  if (p && typeof p.hidePopover === 'function' && p.matches(':popover-open')) {
    p.hidePopover();
  }
};

const toggle = () => {
  if (isOpen.value) closePopover(false);
  else openPopover();
};

// ---- popover chain (ADR-0038) ----------------------------------------------

/** This popover's own logical inside: host subtree, panel, designated trigger. */
const insideEls = (): HTMLElement[] =>
  [host, panelRef.value, designated.element.value].filter(
    (el): el is HTMLElement => !!el,
  );

// Focus counts as inside when it sits in the host's light subtree (the
// slotted trigger and body content) or on/in the designated trigger — the
// shadow panel itself renders no focusable elements of its own.
const focusIsInside = (): boolean => {
  const active = deepActiveElement();

  return !!active && insideEls().some((el) => el.contains(active));
};

const chainEntry: PopoverChainEntry = {
  close: () => closePopover(false),
  containsNode: (node) => insideEls().some((el) => composedContains(el, node)),
  containsPath: (path) => insideEls().some((el) => path.includes(el)),
  getAnchorNode: () =>
    designated.element.value ?? getSlottedTriggerEl() ?? host ?? null,
  onEscape: () => closePopover(focusIsInside()),
};

// The panel's native `toggle` event is the single source of truth for state:
// it fires for browser-initiated closes too, so state cannot desync.
const onToggle = (event: Event) => {
  const nowOpen = (event as ToggleEvent).newState === 'open';

  isOpen.value = nowOpen;
  getTriggerEl()?.setAttribute('aria-expanded', String(nowOpen));
  emit('change:open', nowOpen);

  if (nowOpen) {
    panelLabel.value = props.heading || host?.getAttribute('aria-label') || '';

    if (!panelLabel.value) {
      console.warn(
        '<c-popover> opened without an accessible name. Set the heading prop or aria-label on the c-popover element.',
      );
    }

    void ensureAnchorPositioning(host?.shadowRoot);

    // Dismissal (light dismiss, Escape peeling, descendant closing) is owned
    // by the shared popover chain while any popover is open (ADR-0038).
    enterChain(chainEntry);
  } else {
    leaveChain(chainEntry);
    designated.stopTracking();

    if (pendingReturnFocus) getTriggerEl()?.focus?.();

    pendingReturnFocus = false;
  }
};

// ---- delegated event handlers ----------------------------------------------

const onClick = (event: MouseEvent) => {
  // Prop wins: with a designated trigger the slotted element gets no wiring.
  if (designated.element.value) return;

  if (anchorRef.value && event.composedPath().includes(anchorRef.value)) {
    toggle();
  }
};

// ---- lifecycle -------------------------------------------------------------

const onSlotChange = () => {
  const el = getSlottedTriggerEl();

  if (!el) return;

  if (designated.element.value) {
    warnIfBothRoutes();

    return;
  }

  setTriggerWiring(el, isOpen.value);
};

watch(
  () => coerceBoolean(props.open),
  (value) => (value ? openPopover() : closePopover(false)),
);

onMounted(() => {
  host?.addEventListener('click', onClick);

  designated.resolve();

  const slot = anchorRef.value?.querySelector('slot');

  slot?.addEventListener('slotchange', onSlotChange);
  onSlotChange();

  if (coerceBoolean(props.open)) {
    requestAnimationFrame(openPopover);
  }
});

onBeforeUnmount(() => {
  host?.removeEventListener('click', onClick);
  leaveChain(chainEntry);
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
  animation: c-popover-fade-in 0.12s ease-out;
}

@keyframes c-popover-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
