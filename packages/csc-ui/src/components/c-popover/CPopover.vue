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

  <!-- Manual popover in the top layer: never clipped by overflow, no teleport,
       no z-index war. Manual, not auto: auto popovers across separate shadow
       roots dismiss each other (ADR-0008), so light-dismiss is hand-rolled by
       this controller. Positioned with CSS anchor positioning. -->
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
import { placementAxis, POSITION_AREA } from '../../shared/positionArea';
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
    trigger: 'inline-flex w-max max-w-full',
  },
});

const ui = popover();

const props = withDefaults(defineProps<CPopoverProps>(), {
  distance: 0,
  heading: '',
  open: false,
  position: 'bottom',
});

// Anchor wrapper + panel are two root nodes; opt out of attr fallthrough.
defineOptions({ inheritAttrs: false });

const host = useHost();

const anchorRef = useTemplateRef<HTMLElement>('anchorRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const isOpen = ref(false);

// Accessible name: the `heading` prop, or `aria-label` mirrored from the
// host — `aria-labelledby` cannot reference slotted (light DOM) content
// across the shadow boundary.
const panelLabel = ref('');

let pendingReturnFocus = false;

// The gap is applied on the placement's axis (both sides, so it survives the
// position-try flip fallbacks). Unlike c-menu there is no nested panel to
// inherit it, so it is inlined directly instead of published as a custom
// property.
const panelStyle = computed(
  () =>
    `position-anchor:--c-popover-anchor;position-area:${
      POSITION_AREA[props.position] ?? POSITION_AREA.bottom
    };inset:auto;margin-${placementAxis(props.position)}:${Number(props.distance) || 0}px;`,
);

// ---- open / close ----------------------------------------------------------

const emit = useHostEmit<CPopoverEvents>();

const openPopover = () => {
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

const getTriggerEl = (): HTMLElement | null => {
  const slot = anchorRef.value?.querySelector('slot');

  const assigned = (slot as HTMLSlotElement | null)?.assignedElements?.() ?? [];

  return (assigned[0] as HTMLElement) ?? null;
};

// Focus counts as inside when it sits in the host's light subtree (the
// slotted trigger and body content) — the shadow panel itself renders no
// focusable elements of its own.
const focusIsInside = (): boolean => {
  const active = deepActiveElement();

  return (
    !!active && (!!host?.contains(active) || !!panelRef.value?.contains(active))
  );
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
    addDismissListeners();
  } else {
    removeDismissListeners();

    if (pendingReturnFocus) getTriggerEl()?.focus?.();

    pendingReturnFocus = false;
  }
};

// ---- delegated event handlers ----------------------------------------------

const onClick = (event: MouseEvent) => {
  if (anchorRef.value && event.composedPath().includes(anchorRef.value)) {
    toggle();
  }
};

// Escape closes and returns focus to the trigger when focus was inside the
// popover. `preventDefault` claims the key so an enclosing c-modal's
// controller peels this overlay first instead of closing itself (ADR-0014).
const onDocKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape' || !isOpen.value) return;

  event.preventDefault();
  closePopover(focusIsInside());
};

// Light dismiss: everything interactive (the slotted trigger and the slotted
// body content) lives inside the host's flattened subtree, so composedPath
// cleanly separates inside from outside.
const onDocPointerDown = (event: Event) => {
  if (!isOpen.value || !host) return;

  if (!event.composedPath().includes(host)) closePopover(false);
};

const addDismissListeners = () => {
  document.addEventListener('pointerdown', onDocPointerDown, true);
  document.addEventListener('keydown', onDocKeydown, true);
};

const removeDismissListeners = () => {
  document.removeEventListener('pointerdown', onDocPointerDown, true);
  document.removeEventListener('keydown', onDocKeydown, true);
};

// ---- lifecycle -------------------------------------------------------------

const onSlotChange = () => {
  const el = getTriggerEl();

  if (!el) return;

  el.setAttribute('aria-haspopup', 'dialog');
  el.setAttribute('aria-expanded', String(isOpen.value));
};

watch(
  () => coerceBoolean(props.open),
  (value) => (value ? openPopover() : closePopover(false)),
);

onMounted(() => {
  host?.addEventListener('click', onClick);

  const slot = anchorRef.value?.querySelector('slot');

  slot?.addEventListener('slotchange', onSlotChange);
  onSlotChange();

  if (coerceBoolean(props.open)) {
    requestAnimationFrame(openPopover);
  }
});

onBeforeUnmount(() => {
  host?.removeEventListener('click', onClick);
  removeDismissListeners();
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
