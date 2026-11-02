<template>
  <div :class="ui.root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - The `c-tab-item` panels
 *
 * @csspart root - The track the panels slide on
 */
import { tv } from 'tailwind-variants';
import { nextTick, onBeforeUnmount, onMounted, useHost, watch } from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { prefersReducedMotion } from '../../shared/reducedMotion';

/**
 * Styling lives in this `tailwind-variants` config; customization
 * is via `::part()`. The `root` element is the sliding flex track.
 * Its var-driven `translate` + `transition` (fed `--_c-tab-items-position-left`
 * / `--_c-tab-items-animation-duration` imperatively from the script) and the
 * host box (`overflow:hidden` clips the slide) can't be utilities, so they
 * remain in the escape-hatch <style> below.
 */
const tabItems = tv({
  slots: {
    // `position: relative` is load-bearing: it makes this div the offsetParent
    // of the slotted c-tab-item children (see the script's slide math).
    root: 'relative flex h-full items-start',
  },
});

const ui = tabItems();

interface CTabItemsProps {
  /**
   * Switch panels without the slide; the parent `<c-tabs>` sets it from its
   * own `disable-animation`.
   *
   * @internal
   */
  disableAnimation?: boolean;

  /**
   * Value of the shown panel; the parent `<c-tabs>` sets it.
   *
   * @internal
   */
  value?: number | string;
}

const props = withDefaults(defineProps<CTabItemsProps>(), {
  disableAnimation: false,
  value: 0,
});

const host = useHost();

// Resolve disableAnimation from two sources without depending on c-tabs
// to imperatively push it: our own prop (set directly or by c-tabs) AND
// the parent c-tabs's `disable-animation` attribute. Reading the parent
// attribute directly sidesteps the timing race where c-tabs.onMounted
// runs *before* its light-DOM children are connected — leaving
// items.disableAnimation as the default `false` when setActiveTab first
// fires and the setTimeout(500) would otherwise re-enable the 300ms
// slide on every switch.
const isAnimationDisabled = (): boolean => {
  if (coerceBoolean(props.disableAnimation)) return true;

  const parent = host?.closest('c-tabs') as HTMLElement | null;

  if (!parent) return false;

  if (parent.hasAttribute('disable-animation')) return true;

  return coerceBoolean(
    (parent as unknown as { disableAnimation?: unknown }).disableAnimation,
  );
};

// Whether the parent c-tabs is in vertical layout. Read straight off the
// parent (its `vertical` attribute reflects the initial markup; the
// `c-tabs--vertical` class is the reactive mirror it toggles) so we don't
// depend on c-tabs imperatively pushing the flag down to us — same rationale
// as isAnimationDisabled above.
const isVertical = (): boolean => {
  const parent = host?.closest('c-tabs') as HTMLElement | null;

  if (!parent) return false;

  return (
    parent.classList.contains('c-tabs--vertical') ||
    parent.hasAttribute('vertical')
  );
};

/** Length of the slide between two panels. */
const SLIDE_MS = 300;

// Panels switch without the slide until the tab set has settled after mount.
let ready = false;

let readyTimer: null | ReturnType<typeof setTimeout> = null;

// The panel index (counting visible panels) shown last, -1 before the first.
let shownBefore = -1;

// Set while a slide plays; it puts the track back at rest when it ends.
let slideTimer: null | ReturnType<typeof setTimeout> = null;

// `:scope >` so a nested c-tabs (e.g. an example rendered inside an
// outer page-level c-tabs) doesn't bleed its own panels into our query
// — without scoping, our setActiveTab would iterate the nested panels
// too and flip their active state based on OUR value, breaking them.
const tabs = () =>
  Array.from(
    host?.querySelectorAll(':scope > c-tab-item') ?? [],
  ) as HTMLElement[];

const setOffset = (before: number, vertical: boolean) => {
  if (!host) return;

  host.style.setProperty(
    '--_c-tab-items-position-left',
    vertical ? '0px' : `${-before * host.clientWidth}px`,
  );
  host.style.setProperty(
    '--_c-tab-items-position-top',
    vertical ? `${-before * host.clientHeight}px` : '0px',
  );
};

// At rest the track has no `translate` and only the active panel takes space.
// Any `translate`, even a zero one, makes the track the containing block of
// `position: fixed` content: a c-modal in a panel (it does not use the top
// layer, ADR-0014) was positioned and clipped inside the panel. The panels
// line up as a carousel only while one slides in.
const rest = () => {
  slideTimer = null;
  // No transition back from the slide's offset to no translate at all.
  host?.style.setProperty('--_c-tab-items-animation-duration', '0ms');
  host?.classList.add('c-tab-items--rest');
};

// Mark the matching panel active, and slide the track from the old panel to
// it. The position update happens *synchronously* with the active state
// change — wrapping it in requestAnimationFrame causes a 1-frame gap where the
// new panel is already display:block but the track is still at the old
// panel's offset (or, at rest, the old panel still takes the space): the new
// panel ends up out of view and c-tab-items briefly collapses to 0 height.
const setActiveTab = () => {
  if (!host) return;

  // Reflect the layout mode up front (before any early return) so the CSS that
  // stacks the panels is in place even on the first call / when no panel matches.
  const vertical = isVertical();
  host.classList.toggle('c-tab-items--vertical', vertical);

  const all = tabs();

  let activeIndex = -1;
  all.forEach((tab, i) => {
    const tabVal = (tab as unknown as { value: number | string }).value;

    const isActive = tabVal === props.value;

    if (isActive) activeIndex = i;
    (tab as unknown as { active: boolean }).active = isActive;
    tab.classList.toggle('is-active', isActive);

    // Last-resort: set the inner div's display directly in the shadow
    // root. Both Vue's prop reflection (-> `:host([active])`) AND our
    // classList.toggle (-> `:host(.is-active)`) have been observed to
    // NOT land in this nested-CE setup — the host ends up without
    // either marker and the CSS hides the inner div. An inline style
    // with !important on the actual inner element cannot be wiped by
    // any external reflection or render cycle.
    const innerDiv = tab.shadowRoot?.querySelector('div');

    if (innerDiv) {
      (innerDiv as HTMLElement).style.setProperty(
        'display',
        isActive ? 'block' : 'none',
        'important',
      );
    }
  });

  if (activeIndex < 0) {
    shownBefore = -1;
    rest();

    return;
  }

  // The panels are a carousel: a row of panels each one container wide
  // (stacked, each one container high, in the vertical layout) on a track
  // that slides so the active one sits in view. The offset is N fully-sized
  // panels' worth in the slide axis, so the incoming panel travels through the
  // whole container from the opposite edge — the vertical slide mirrors the
  // horizontal one.
  //
  // The offset is computed from the host's client size × the visual index, NOT
  // from offsetLeft/offsetTop: for a slotted element browsers don't resolve
  // offsetParent consistently across the shadow boundary (Chrome has returned
  // page coordinates), which would fling the track off-screen and overflow
  // would then clip the active panel entirely. Each panel is exactly one
  // container in the slide axis, so panels sit at integer multiples of it.
  // Disabled panels collapse (width/height 0) and take no slot, so we count
  // only the non-disabled panels before the active one.
  const visibleBefore = all
    .slice(0, activeIndex)
    .filter((t) => !t.hasAttribute('disabled')).length;

  const from = shownBefore;

  // The same panel again (c-tabs pushes its value more than once): nothing
  // moves, and a slide under way finishes on its own.
  if (from === visibleBefore) return;

  shownBefore = visibleBefore;

  if (slideTimer !== null) clearTimeout(slideTimer);

  if (!ready || from < 0 || isAnimationDisabled() || prefersReducedMotion()) {
    rest();

    return;
  }

  // Line the panels up at the old panel's offset, commit that without a
  // transition, then slide to the new one.
  host.style.setProperty('--_c-tab-items-animation-duration', '0ms');
  setOffset(from, vertical);
  host.classList.remove('c-tab-items--rest');
  void host.offsetWidth;
  host.style.setProperty('--_c-tab-items-animation-duration', `${SLIDE_MS}ms`);
  setOffset(visibleBefore, vertical);
  slideTimer = setTimeout(rest, SLIDE_MS);
};

onMounted(() => {
  // contentchange bubbles up from child panels when they resize.
  host?.addEventListener('contentchange', (e) => e.stopPropagation());

  setActiveTab();
  // HTML-authored panels upgrade after this element, so their `value` is not
  // readable yet and no panel matched; they are upgraded by the next tick.
  void nextTick(setActiveTab);
  readyTimer = setTimeout(() => {
    ready = true;
  }, 500);
});

onBeforeUnmount(() => {
  if (readyTimer !== null) clearTimeout(readyTimer);

  if (slideTimer !== null) clearTimeout(slideTimer);
});

watch(() => props.value, setActiveTab);
</script>

<!--
  Escape-hatch CSS: the host must be a real box (`overflow:hidden`
  clips the sliding track — a structural requirement), and the track's
  `translate`/`transition` read `--_c-tab-items-position-left` /
  `--_c-tab-items-position-top` / `--_c-tab-items-animation-duration` set
  imperatively by the script, which no static utility can express. The two
  layouts are the same carousel on different axes: horizontally the panels are a
  row and the track slides on X via `--_c-tab-items-position-left`; in the
  parent's vertical layout they are stacked in a column (`display:block`) and the
  track slides on Y via `--_c-tab-items-position-top` (the other offset is 0).
  Either way the incoming panel travels through the whole container from the
  opposite edge. This :host overrides the global `:host{display:contents}`; the
  per-type sheet is adopted after the shared sheet, so it wins. The custom easing
  here (ease-out-quart curve) intentionally differs from the shared
  `ease-standard` token.
-->
<style>
:host {
  --_c-tab-items-position-left: 0;
  --_c-tab-items-position-top: 0;
  --_c-tab-items-animation-duration: 0.001ms;

  display: block;
  overflow: hidden;
  width: 100%;
}

:host > [part='root'] {
  transition: translate var(--_c-tab-items-animation-duration)
    cubic-bezier(0.075, 0.82, 0.165, 1);
  translate: var(--_c-tab-items-position-left) var(--_c-tab-items-position-top);
}

/* At rest: no translate (see the script's rest()), and only the active panel
   takes space, so it sits at the start of the track. */
:host(.c-tab-items--rest) > [part='root'] {
  translate: none;
}

:host(.c-tab-items--rest) ::slotted(c-tab-item:not([active]):not(.is-active)) {
  display: none;
}

/* Vertical layout: stack the panels in a column (instead of the default
   horizontal flex row) so the carousel slides on the Y axis. Each panel is the
   full container height, so the track is taller than the host and the inherited
   `overflow:hidden` clips it to the active panel — exactly as the horizontal
   row is clipped on the X axis. */
:host(.c-tab-items--vertical) > [part='root'] {
  display: block;
}
</style>
