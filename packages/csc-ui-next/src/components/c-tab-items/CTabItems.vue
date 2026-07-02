<template>
  <div :class="ui.root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot
 *
 * @csspart root - The sliding track that lays out the c-tab-item panels
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { onBeforeUnmount, onMounted, useHost, watch } from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); customization
 * is via `::part()` (ADR-0006). The `root` element is the sliding flex track.
 * Its var-driven `translate` + `transition` (fed `--_c-tab-items-position-left`
 * / `--_c-tab-items-animation-duration` imperatively from the script) and the
 * host box (`overflow:hidden` clips the slide) can't be utilities, so they
 * remain in the escape-hatch <style> below (ADR-0007).
 */
const tabItems = tv({
  slots: {
    // `position: relative` is load-bearing: it makes this div the offsetParent
    // of the slotted c-tab-item children (see the script's slide math).
    root: 'flex items-start relative h-full',
  },
});

const ui = tabItems();

interface CTabItemsProps {
  /**
   * Disable animation
   *
   * @seeded from csc-ui — verify
   */
  disableAnimation?: boolean;
  /**
   * Currently active tab
   *
   * @seeded from csc-ui — verify
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

let initialized = false;

const isAnimating = false;

let debounce: null | ReturnType<typeof setTimeout> = null;

let resizeObserver: null | ResizeObserver = null;

// `:scope >` so a nested c-tabs (e.g. an example rendered inside an
// outer page-level c-tabs) doesn't bleed its own panels into our query
// — without scoping, our setActiveTab would iterate the nested panels
// too and flip their active state based on OUR value, breaking them.
const tabs = () =>
  Array.from(
    host?.querySelectorAll(':scope > c-tab-item') ?? [],
  ) as HTMLElement[];

// Mark the matching panel active and slide the flex track so it sits in
// view. The horizontal offset is the active panel's offsetLeft negated.
//
// The position update happens *synchronously* with the active state
// change — wrapping it in requestAnimationFrame causes a 1-frame gap
// where the new panel is already display:block but the track is still
// translated to the old panel's offset. The new panel ends up
// container-width to the right and overflow:hidden clips it. With the
// 300ms slide that gap is invisible; with disable-animation it shows up
// as "content not showing" plus a page reflow as c-tab-items briefly
// collapses to 0 height. Each panel has min-width:100% regardless of
// active state, so offsetLeft is stable and safe to read sync.
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

  if (activeIndex < 0) return;

  // Slide the track so the active panel sits at the start of the container.
  // The two layouts are the same carousel on different axes: horizontally the
  // panels are a row (each min-width:100%) and we move along X; vertically they
  // are stacked (each is the full container height) and we move along Y. Either
  // way the offset is N fully-sized panels' worth in that axis, so the incoming
  // panel travels through the whole container from the opposite edge — the
  // vertical slide mirrors the horizontal one.
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

  if (vertical) {
    host.style.setProperty('--_c-tab-items-position-left', '0px');
    host.style.setProperty(
      '--_c-tab-items-position-top',
      `${-visibleBefore * host.clientHeight}px`,
    );
  } else {
    host.style.setProperty('--_c-tab-items-position-top', '0px');
    host.style.setProperty(
      '--_c-tab-items-position-left',
      `${-visibleBefore * host.clientWidth}px`,
    );
  }

  if (!isAnimationDisabled() && !initialized) {
    initialized = true;
    setTimeout(() => {
      host.style.setProperty('--_c-tab-items-animation-duration', '300ms');
    }, 500);
  }
};

const handleResize = () => {
  if (isAnimating || !initialized) return;

  if (debounce !== null) clearTimeout(debounce);
  debounce = setTimeout(setActiveTab, 50);
};

onMounted(() => {
  if (isAnimationDisabled() && host) {
    host.style.setProperty('--c-tab-items-animation-duration', '0ms');
  }

  // contentChange bubbles up from child panels when they resize.
  host?.addEventListener('contentChange', (e) => e.stopPropagation());

  if (host) {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(host);
  }

  setActiveTab();
});

onBeforeUnmount(() => resizeObserver?.disconnect());

watch(() => props.value, setActiveTab);
</script>

<!--
  Escape-hatch CSS (ADR-0007): the host must be a real box (`overflow:hidden`
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

/* Vertical layout: stack the panels in a column (instead of the default
   horizontal flex row) so the carousel slides on the Y axis. Each panel is the
   full container height, so the track is taller than the host and the inherited
   `overflow:hidden` clips it to the active panel — exactly as the horizontal
   row is clipped on the X axis. */
:host(.c-tab-items--vertical) > [part='root'] {
  display: block;
}
</style>
