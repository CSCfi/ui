<template>
  <div ref="trackRef" :class="ui.track()" part="root">
    <div
      ref="indicatorRef"
      :class="ui.indicator()"
      aria-hidden="true"
      part="indicator"
    />

    <c-button-group
      :disabled
      :size
      :value.prop
      mandatory
      @change="onGroupChange"
    >
      <slot />
    </c-button-group>
  </div>
</template>

<script lang="ts">
export interface CTabButtonsProps {
  /** Disable the whole tab strip — every slotted c-button is disabled and the selection can no longer be changed. */
  disabled?: boolean;
  /**
   * Size of the buttons
   *
   * @seeded from csc-ui — verify
   */
  size?: CTabButtonsSize;
  /**
   * Value of the active tab — pushed down by the parent c-tabs.
   *
   * @seeded from csc-ui — verify
   */
  value?: number | string;
}

/**
 * Size of the tab strip. `small` renders a more compact control; the size is
 * also propagated to every slotted `<c-button>`. Omitting the attribute
 * renders the default size.
 */
export type CTabButtonsSize = 'default' | 'small';
</script>

<script setup lang="ts">
/**
 * @slot default - Default slot for the c-button elements
 * @csspart root - The segmented-control box framing the buttons
 * @csspart indicator - The sliding fill highlighting the active tab
 */
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  useHost,
  useTemplateRef,
} from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-tab-buttons>`. */
interface CTabButtonsEvents {
  /**
   * Fired when the user activates a tab button, carrying the newly selected
   * value. The parent `<c-tabs>` listens for it and pushes the accepted value
   * back down; consumers should listen to `c-tabs` instead.
   */
  tabChange: {
    element: HTMLElement | null;
    value: number | string;
  };
}

// We write to the slotted <c-button> children (the inline
// `--_c-button-active-*` vars) below — keep fallthrough attrs on the host
// element rather than the inner elements, so consumer attributes/styles
// target the custom element as expected.
defineOptions({ inheritAttrs: false });

/**
 * The sliding indicator lives HERE, not in the wrapped c-button-group: the
 * group is a form control whose active buttons paint their own fill; the
 * sliding motion is a tab-strip affordance. This adapter therefore owns the
 * whole indicator composition:
 *
 * - `track` draws the sunken fill AND the 1px `divider` hairline frame
 *   itself — the same opaque-fill + load-bearing-hairline construction as
 *   the group (ADR-0042, see the group's tv header); the inner group's own
 *   `root` box is made transparent and its frame neutralised through the
 *   `::part(root)` rule in the `<style>` block below (an outer-tree part rule
 *   beats the group's shadow styles for normal declarations).
 * - The pill is a `-z-10` child of the `isolate` track, so it paints above
 *   the track background but below the (transparent) buttons — a sibling
 *   could never interleave into the group's own stacking context, which is
 *   why the track ownership moves up here.
 * - Each slotted button's active fill is retargeted to transparent through
 *   the inherited `--_c-button-active-*` vars, keeping only the text flip;
 *   the pill is the single active fill.
 */
// Hoisted so the runtime guard below can test membership; the `satisfies`
// keeps the map complete against the public union.
const sizeVariants = {
  default: {
    // The buttons sit 3px inside this track's padding box: the wrapped
    // group's 1px (transparent) border is pulled over this track's own
    // border by the `::part(root)` margin below, leaving its 3px padding —
    // so the pill covers the button vertically.
    indicator: 'top-0.75 bottom-0.75',
  },
  small: {
    indicator: 'top-0.25 bottom-0.25',
  },
} satisfies Record<CTabButtonsSize, object>;

const tabButtons = tv({
  defaultVariants: {
    disabled: false,
  },
  slots: {
    // The single sliding active fill. JS sets width + translateX to the
    // active button's measured box. Radius matches c-button's
    // `rounded-csc-md`.
    indicator:
      'pointer-events-none absolute left-0 -z-10 w-0 origin-left rounded-csc-md bg-primary opacity-0 transition-[transform,width,opacity] duration-300 ease-out',
    // `relative isolate` so the `-z-10` pill is contained in this box's
    // stacking context and paints above this track background but below the
    // (transparent) buttons inside the wrapped group. The border is the
    // load-bearing hairline, clipped out of the fill so it composites over
    // the parent surface and reads on every rung (ADR-0042).
    track:
      'relative isolate rounded-csc-lg border border-solid border-divider bg-clip-padding bg-surface-sunken',
  },
  variants: {
    disabled: {
      true: {
        indicator: 'bg-border-strong',
        track: 'bg-surface-muted pointer-events-none',
      },
    },
    size: sizeVariants,
  },
});

const props = withDefaults(defineProps<CTabButtonsProps>(), {
  disabled: false,
  size: 'default',
  value: 0,
});

const host = useHost();

const emit = useHostEmit<CTabButtonsEvents>();

// Attributes can deliver any string at runtime; unknown values fall back to
// the default size.
const ui = computed(() =>
  tabButtons({
    disabled: coerceBoolean(props.disabled),
    size: props.size in sizeVariants ? props.size : 'default',
  }),
);

const trackRef = useTemplateRef<HTMLElement>('trackRef');

const indicatorRef = useTemplateRef<HTMLElement>('indicatorRef');

type CTabButtonEl = {
  disabled?: boolean;
} & HTMLElement;

// Our own slot outlet (it lives in this shadow root, slot-forwarding the
// consumer's buttons into the wrapped group). Its assigned elements are the
// host's light-DOM children — the same buttons the group drives.
const slotEl = (): HTMLSlotElement | null =>
  trackRef.value?.querySelector('slot') ?? null;

const buttons = (): CTabButtonEl[] =>
  (slotEl()?.assignedElements() ?? []).filter(
    (el): el is CTabButtonEl => el.tagName === 'C-BUTTON',
  );

// The focusable native control lives in the slotted c-button's shadow — the
// exact box the pill must cover (the c-button host itself is
// display:contents and has no box).
const nativeControlOf = (btn: CTabButtonEl): HTMLElement | null =>
  (btn.shadowRoot?.querySelector('button, a') as HTMLElement | null) ?? null;

/* --- indicator geometry --- */

// Slide the pill over the currently-active button (the wrapped group flips
// the buttons' `active` attribute; we only follow it). `animate=false`
// (initial mount, resize) snaps without a transition so the pill doesn't fly
// in from the left.
const moveIndicator = (animate = true) => {
  const track = trackRef.value;

  const ind = indicatorRef.value;

  if (!track || !ind) return;

  const active = buttons().find((b) => b.hasAttribute('active'));

  if (!active) {
    ind.style.opacity = '0';

    return;
  }

  const box =
    nativeControlOf(active)?.getBoundingClientRect() ??
    active.getBoundingClientRect();

  if (!box || box.width === 0) return;

  const trackBox = track.getBoundingClientRect();

  // A hidden pill (no prior selection) must snap to its first position, not
  // animate from left-0/width-0.
  const wasHidden = ind.style.opacity === '' || ind.style.opacity === '0';

  const snap = !animate || wasHidden;

  if (snap) ind.style.transition = 'none';
  ind.style.width = `${box.width}px`;
  // Absolute children are placed from the track's padding box, while
  // `trackBox` is its border box — subtract the 1px hairline.
  ind.style.transform = `translateX(${box.left - trackBox.left - track.clientLeft}px)`;
  ind.style.opacity = '1';

  if (snap) {
    // Force a reflow so the snapped geometry commits before transitions
    // resume.
    void ind.offsetWidth;
    ind.style.transition = '';
  }
};

// Re-snap the pill (no animation) whenever geometry changes that no
// attribute flip announces: the viewport resizing, the panel that holds us
// expanding from display:none, fonts loading, or a sibling button appearing —
// which reflows the group's equal-width columns and shrinks the active
// button.
//
// We observe the track AND each button's native control box: when a sibling
// appears the track width is unchanged (it's the full container), only the
// per-button column width shifts, so a track-only observer would miss it.
let resizeObserver: null | ResizeObserver = null;

// The group flips the buttons' `active` attribute asynchronously (its own
// value watch); observing that flip is the one sync point that covers both
// user clicks and values pushed down by c-tabs.
let activeObserver: MutationObserver | null = null;

const observeButtons = () => {
  if (resizeObserver) {
    resizeObserver.disconnect();

    if (trackRef.value) resizeObserver.observe(trackRef.value);
  }

  activeObserver?.disconnect();

  buttons().forEach((b) => {
    activeObserver?.observe(b, {
      attributeFilter: ['active'],
      attributes: true,
    });

    const ctrl = nativeControlOf(b);

    if (ctrl) resizeObserver?.observe(ctrl);
  });
};

// Retarget each slotted button's active fill to transparent (text flip only);
// the pill is the single active fill. The vars inherit across the shadow
// boundary into c-button. The wrapped group imposes the rest of the shared
// appearance (text/no-ripple/fit/size); these vars are the adapter's only
// addition.
const suppressActiveFill = () => {
  buttons().forEach((button) => {
    button.style.setProperty('--_c-button-active-bg', 'transparent');
    button.style.setProperty('--_c-button-active-hover-bg', 'transparent');
    button.style.setProperty('--_c-button-active-fg', 'var(--c-on-primary)');
  });
};

const setupButtons = () => {
  suppressActiveFill();
  observeButtons();
};

// Bridge the group's selection to the c-tabs contract: c-tabs listens for
// `tabChange` bubbling from its light-DOM children and pushes the accepted
// value back via the `value` property, which flows down to the group through
// the template binding. The group knows nothing about tabs.
const onGroupChange = (e: Event) => {
  const value = (e as CustomEvent<number | string>).detail;
  // The group's own change/update:value stay inside this shadow root (they
  // are dispatched non-bubbling on the group element); only the tab contract
  // crosses the host boundary.
  e.stopPropagation();

  emit(
    'tabChange',
    { element: host, value },
    { bubbles: true, composed: true },
  );
};

onMounted(() => {
  resizeObserver = new ResizeObserver(() => moveIndicator(false));
  activeObserver = new MutationObserver(() => moveIndicator(true));

  // Late-appearing buttons (v-if'd/async children) re-run the driving pass.
  slotEl()?.addEventListener('slotchange', () => {
    setupButtons();
    moveIndicator(false);
  });

  // Place the pill under the initial selection without animating it in.
  // Double rAF so the wrapped group has driven the buttons and their shadow
  // roots report real boxes before we measure.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      setupButtons();
      moveIndicator(false);
    }),
  );
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  activeObserver?.disconnect();
  activeObserver = null;
});
</script>

<style>
/* The adapter owns the visible track — fill and hairline; the wrapped
   group's own box must not paint over the pill nor draw a second frame. An
   outer-tree ::part rule wins over the group's shadow styles for normal
   declarations, in every state (the group's disabled variant repaints its
   background too, so `background` — not `background-color` shorthand
   mismatches — is overridden here). The group keeps its 1px border (made
   transparent) and 3px padding; the -1px margin pulls its border box over
   this track's own border, so the buttons land exactly where a standalone
   group puts them and the pill offsets in `sizeVariants` stay true. */
c-button-group::part(root) {
  background: transparent;
  border-color: transparent;
  margin: -1px;
}
</style>
