<template>
  <div ref="track">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useHost, useTemplateRef, watch } from 'vue';
import { coerceBoolean } from '../../shared/coerceBoolean';

const props = defineProps({
  value: { type: [Number, String], default: 0 },
  disableAnimation: { type: Boolean, default: false },
});

const host = useHost();
const track = useTemplateRef<HTMLElement>('track');

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

let initialized = false;
let isAnimating = false;
let debounce: ReturnType<typeof setTimeout> | null = null;
let resizeObserver: ResizeObserver | null = null;

// `:scope >` so a nested c-tabs (e.g. an example rendered inside an
// outer page-level c-tabs) doesn't bleed its own panels into our query
// — without scoping, our setActiveTab would iterate the nested panels
// too and flip their active state based on OUR value, breaking them.
const tabs = () =>
  Array.from(host?.querySelectorAll(':scope > c-tab-item') ?? []) as HTMLElement[];

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
  // Compute the slide offset from the host's clientWidth × the visual
  // index of the active panel — NOT from activeTab.offsetLeft. For a
  // slotted element, browsers don't consistently resolve offsetParent
  // through the shadow boundary; Chrome in particular has been observed
  // returning the page-X coordinate (relative to <body>), which would
  // make the translate slide the track hundreds of pixels off-screen
  // and overflow:hidden then clips the active panel entirely. Each
  // c-tab-item has min-width:100% so visible panels sit at multiples of
  // the host width. Disabled panels collapse to width:0 and don't take
  // up a slot, so we count only non-disabled tabs before the active one.
  const visibleBefore = all
    .slice(0, activeIndex)
    .filter((t) => !t.hasAttribute('disabled')).length;
  const hostWidth = host.clientWidth;
  host.style.setProperty(
    '--_c-tab-items-position-left',
    `${-visibleBefore * hostWidth}px`,
  );
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

<style>
:host {
  --_c-tab-items-position-left: 0;
  --_c-tab-items-animation-duration: 0.001ms;

  display: block;
  overflow: hidden;
  width: 100%;
}

:host > div {
  align-items: flex-start;
  display: flex;
  /* `position: relative` so this div becomes the `offsetParent` of the
   * slotted c-tab-item children — otherwise their `offsetLeft` measures
   * up through unpositioned ancestors all the way to <body> and the
   * translate below slides the track off-screen by the page-relative X
   * of the active panel, clipping content via the host's overflow:hidden. */
  position: relative;
  transition: translate var(--_c-tab-items-animation-duration)
    cubic-bezier(0.075, 0.82, 0.165, 1);
  translate: var(--_c-tab-items-position-left);
}
</style>
