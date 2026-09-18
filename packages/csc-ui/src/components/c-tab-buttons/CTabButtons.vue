<template>
  <div :class="ui.wrapper()">
    <!-- Edge arrows (CONTEXT.md "Tab buttons"): shown only while the strip
         overflows, for pointer users without a horizontal wheel — keyboard
         users rove with the arrow keys and the focused tab scrolls itself
         into view. -->
    <c-icon-button
      v-if="strip.overflowing.value"
      :aria-label="t.scrollBack"
      :disabled="!strip.canBack.value || isDisabled"
      part="scroll-back"
      size="x-small"
      ghost
      @click="strip.back()"
    >
      <c-icon :path="mdiChevronLeft" />
    </c-icon-button>

    <div ref="trackRef" :class="ui.track()" part="root">
      <div
        ref="scrollerRef"
        :class="ui.scroller()"
        @pointerdown="strip.onPointerDown"
        @wheel="strip.onWheel"
      >
        <div ref="contentRef" :class="ui.content()">
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
      </div>
    </div>

    <c-icon-button
      v-if="strip.overflowing.value"
      :aria-label="t.scrollForward"
      :disabled="!strip.canForward.value || isDisabled"
      part="scroll-forward"
      size="x-small"
      ghost
      @click="strip.forward()"
    >
      <c-icon :path="mdiChevronRight" />
    </c-icon-button>
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
 * @csspart scroll-back - The edge arrow that scrolls an overflowing strip back
 * @csspart scroll-forward - The edge arrow that scrolls an overflowing strip forward
 */
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
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
import { useScrollStrip } from '../../shared/useScrollStrip';

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
 * - The pill is a `-z-10` child of the `isolate` content box, so it paints
 *   above the track background but below the (transparent) buttons — a
 *   sibling could never interleave into the group's own stacking context,
 *   which is why the track ownership moves up here.
 * - Each slotted button's active fill is retargeted to transparent through
 *   the inherited `--_c-button-active-*` vars, keeping only the text flip;
 *   the pill is the single active fill.
 * - The strip never wraps (the pill's geometry assumes one row): inside the
 *   track a native horizontal scroller with a hidden scrollbar holds the
 *   group, laid out as a single row of equal columns through the
 *   `::part(root)` rule below, and `useScrollStrip` adds the edge arrows,
 *   mouse drag, wheel translation and the reveal of the active tab.
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
    // The scrolled content: as wide as the one-row group (`w-max`), never
    // narrower than the scroller (`min-w-full`) so the columns share a wide
    // track. `relative isolate` so the `-z-10` pill is contained in this
    // box's stacking context and paints above the track background but
    // below the (transparent) buttons inside the wrapped group; the pill
    // scrolls with the buttons because it lives here, not on the track.
    content: 'relative isolate w-max min-w-full',
    // The single sliding active fill. JS sets width + translateX to the
    // active button's measured box. Radius matches c-button's
    // `rounded-csc-md`.
    indicator:
      'pointer-events-none absolute left-0 -z-10 w-0 origin-left rounded-csc-md bg-primary opacity-0 transition-[transform,width,opacity] duration-300 ease-out',
    // The native horizontal scroller (CONTEXT.md "Tab buttons"): scrollbar
    // hidden, the edge arrows and the peeking buttons are the cue. Not
    // rounded itself: the track clips it (see `track`).
    scroller:
      'overflow-x-auto overflow-y-hidden scrollbar-hidden overscroll-x-contain cursor-default',
    // The frame. The border is the load-bearing hairline, clipped out of the
    // fill so it composites over the parent surface and reads on every rung
    // (ADR-0042). `min-w-0` lets a flex parent squeeze it below the one-row
    // width — that is when the strip scrolls. `overflow-clip` makes the
    // track the corner clip of the scrolled buttons and pill: an element's
    // overflow clip follows its own `border-radius` AND `corner-shape` at
    // the padding edge, i.e. the inner curve of the hairline. Rounding the
    // scroller instead gave a round 16px clip 1px inside a 15px squircle —
    // `rounded-[inherit]` inherits the radius, not the corner shape.
    track:
      'rounded-csc-lg border border-solid border-divider bg-clip-padding bg-surface-sunken overflow-clip min-w-0 flex-1',
    // Arrows and frame in one row; as wide as the frame wants, at most the
    // container.
    wrapper: 'flex items-center gap-1 max-w-full',
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

const isDisabled = computed(() => coerceBoolean(props.disabled));

// Attributes can deliver any string at runtime; unknown values fall back to
// the default size.
const ui = computed(() =>
  tabButtons({
    disabled: isDisabled.value,
    size: props.size in sizeVariants ? props.size : 'default',
  }),
);

// Labels of the edge arrows. Not consumer-facing text in the tab-strip sense
// (the arrows are out of the tab order); kept in one place for the day they
// become props.
const t = {
  scrollBack: 'Scroll tabs back',
  scrollForward: 'Scroll tabs forward',
};

const trackRef = useTemplateRef<HTMLElement>('trackRef');

const scrollerRef = useTemplateRef<HTMLElement>('scrollerRef');

const contentRef = useTemplateRef<HTMLElement>('contentRef');

const indicatorRef = useTemplateRef<HTMLElement>('indicatorRef');

const strip = useScrollStrip(scrollerRef);

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
  const content = contentRef.value;

  const ind = indicatorRef.value;

  if (!content || !ind) return;

  const active = buttons().find((b) => b.hasAttribute('active'));

  if (!active) {
    ind.style.opacity = '0';

    return;
  }

  const box =
    nativeControlOf(active)?.getBoundingClientRect() ??
    active.getBoundingClientRect();

  if (!box || box.width === 0) return;

  // The pill is placed from the scrolled content box (no border of its
  // own), so it follows the buttons through the scroller.
  const contentBox = content.getBoundingClientRect();

  // A hidden pill (no prior selection) must snap to its first position, not
  // animate from left-0/width-0.
  const wasHidden = ind.style.opacity === '' || ind.style.opacity === '0';

  const snap = !animate || wasHidden;

  if (snap) ind.style.transition = 'none';
  ind.style.width = `${box.width}px`;
  ind.style.transform = `translateX(${box.left - contentBox.left}px)`;
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

    if (contentRef.value) resizeObserver.observe(contentRef.value);
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

// The active tab is brought into view — scrolling the strip, never the page
// — whenever c-tabs (or a click on a half-visible tab) changes it.
const revealActive = () => {
  const active = buttons().find((b) => b.hasAttribute('active'));

  if (active) strip.reveal(nativeControlOf(active));
};

onMounted(() => {
  resizeObserver = new ResizeObserver(() => moveIndicator(false));
  activeObserver = new MutationObserver(() => {
    moveIndicator(true);
    revealActive();
  });

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
      strip.update();
      revealActive();
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
   mismatches — is overridden here). The group loses its 1px border and
   keeps its 3px padding inside this track's own 1px border, so the buttons
   land exactly where a standalone group puts them and the pill offsets in
   `sizeVariants` stay true.

   A tab strip never wraps (the pill assumes one row): the group's auto-fit
   columns become one row of equal columns as wide as the longest label
   (`width: max-content`), filling the scroller when it is wider
   (`min-width: 100%`) and scrolling inside it when it is narrower. */
c-button-group::part(root) {
  background: transparent;
  border-width: 0;
  grid-template-columns: none;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  width: max-content;
  min-width: 100%;
}
</style>
