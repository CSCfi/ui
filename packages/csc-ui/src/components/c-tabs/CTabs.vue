<template>
  <div :class="ui.container()" class="c-tabs__container" part="container">
    <c-icon-button
      v-if="isOverflowing && !vertical"
      appearance="ghost"
      aria-label="Scroll tabs back"
      size="x-small"
      @click="onBackClick"
    >
      <c-icon :path="arrowLeft" />
    </c-icon-button>

    <div :class="ui.clip()">
      <div
        ref="tabsRef"
        :class="ui.tabs()"
        class="c-tabs__tabs"
        part="tabs"
        @touchend="onTouchEnd"
        @touchmove="onTouchMove"
        @touchstart="onTouchStart"
      >
        <!-- The tablist is the row of tabs alone (APG Tabs): the scroll arrows
             and the panels sit outside it. In buttons mode c-tab-buttons is
             the tablist itself, around its own buttons. -->
        <div
          ref="scrollRef"
          :aria-label="buttonsMode ? undefined : tablistLabel"
          :aria-orientation="!buttonsMode && vertical ? 'vertical' : undefined"
          :class="ui.scroll()"
          :role="buttonsMode ? undefined : 'tablist'"
          class="c-tabs__scroll"
        >
          <slot />
        </div>
      </div>
    </div>

    <c-icon-button
      v-if="isOverflowing && !vertical"
      appearance="ghost"
      aria-label="Scroll tabs forward"
      size="x-small"
      @click="onForwardClick"
    >
      <c-icon :path="arrowRight" />
    </c-icon-button>
  </div>

  <div :class="ui.content()" class="c-tabs__content" part="content">
    <slot name="items" />
  </div>
</template>

<script lang="ts">
/**
 * Justification of the tab headers along the tab row. `stretch` grows the
 * tabs to fill the full row width.
 */
export type CTabsJustify = 'center' | 'end' | 'start' | 'stretch';

interface CTabsProps {
  /**
   * Remove the line along the tab row.
   */
  borderless?: boolean;

  /**
   * Switch off the underline's glide and the panels' slide; both also stop
   * under the reduced-motion preference.
   */
  disableAnimation?: boolean;

  /**
   * Placement of the tabs along the row: `stretch` grows them to fill it;
   * `start`, `center` and `end` keep each tab at its own width. No effect on
   * `vertical` tabs.
   */
  justify?: CTabsJustify;

  /**
   * Width in pixels of the `c-tabs` element (not the viewport) below which
   * `vertical` tabs move above the panels. No effect on horizontal tabs.
   */
  mobileBreakpoint?: number;

  /**
   * Value of the active tab: the `c-tab` and the `c-tab-item` with the same
   * `value` are shown. With no match, no tab is active and no panel is shown.
   */
  value?: number | string;

  /**
   * Stack the tabs in a column beside the panels, which slide vertically; below
   * `mobile-breakpoint` the column moves above the panels.
   */
  vertical?: boolean;
}
</script>

<script setup lang="ts">
/**
 * @slot default - The `c-tab` headers, or one `c-tab-buttons`
 * @slot items - The `c-tab-items` holding the panels
 * @csspart container - The tab row: the tabs plus the overflow arrows
 * @csspart tabs - The viewport the tab list scrolls inside; it clips with room for a tab's focus ring and a slotted corner badge
 * @csspart content - The wrapper around the panels
 *
 * @subcomponents c-tab, c-tab-items, c-tab-item, c-tab-buttons
 */
import { mdiArrowLeft, mdiArrowRight } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useHost,
  useId,
  useTemplateRef,
  watch,
  watchEffect,
} from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { prefersReducedMotion } from '../../shared/reducedMotion';
import { useIdReferences } from '../../shared/useIdReferences';
import { emitModelChange } from '../../shared/valueEvents';

/** Events dispatched by `<c-tabs>`. */
interface CTabsEvents {
  /**
   * Fired when the user activates another tab (click, or Enter/Space on a
   * focused tab), carrying the newly selected tab value.
   */
  change: number | string;

  /** Native bubbling input event dispatched for plain `v-model` support; carries no detail. */
  input: void;

  /**
   * Fired alongside `change` with the same detail — the `v-model` contract.
   */
  'update:value': number | string;
}

/**
 * Styling lives in this `tailwind-variants` config for the parts
 * whose layout is static utilities; customization is via `::part()`.
 *
 * The rest of this component is irreducibly escape-hatch, kept in
 * the <style> block below: the host must be a real box (the whole grid/flex
 * layout, the `vertical`/`justify`/`overflow`/`mobile`/`borderless` state, and
 * the active-tab indicator all hang off it); the sliding indicator is an
 * `::after`/`::before` pseudo-element animated via `--_c-tabs-indicator-*` vars
 * the script sets imperatively (and whose `transitionend` the script listens
 * for); the `--_c-tabs-scroll-position-x` / `--_c-tabs-transition-speed`
 * var-driven transforms can't be static utilities; and `::slotted(...)` rules
 * style the consumer-provided c-tab / c-tab-buttons / c-tab-items children.
 * The structural class names (`c-tabs__tabs`, `c-tabs__scroll`,
 * `c-tabs__container`) are also DOM hooks the script queries in the shadow
 * root, so they are retained alongside the part/tv classes.
 */
const tabs = tv({
  slots: {
    // The clip around `tabs`, the viewport the translated `scroll` track
    // hides behind. `-m-2.5 p-2.5` sets its edge 10px outside the row at no
    // layout cost: room for a tab's 2px focus outline at its 2px offset, and
    // for the 8px a `c-badge` slotted into a tab overhangs by (`-right-1.5
    // -top-1.5` plus its 2px ring), with 2px of slack for antialiasing. A box
    // of its own, because `tabs` itself is measured (below), and because an
    // `overflow-clip-margin` would need no box but Safari has none. `clip`
    // rather than `hidden` because nothing here scrolls natively — the track
    // is a transform on `scroll`.
    //
    // `min-w-0` is what `hidden` used to give for free: an `overflow: hidden`
    // box is a scroll container, so its `min-width: auto` as a grid item
    // resolved to 0. `clip` is not a scroll container, so without this the
    // automatic minimum becomes the min-content width of the whole tab row —
    // this box then outgrows its grid cell instead of clipping, and in buttons
    // mode the strip's frame is no longer squeezed to the row (CTabButtons
    // spec: "the strip is squeezed to the tab row, not clipped by it").
    clip: '-m-2.5 flex min-w-0 overflow-clip p-2.5',
    // base container layout; the overflow/vertical reshaping lives on the host
    // selectors in the escape-hatch <style>.
    container: 'grid items-center gap-1',
    content: 'flex',
    scroll: 'relative m-0 flex grow p-0',
    // The strip: its `clientWidth` drives the overflow arrows and the scroll
    // range, and `::after` draws the underline 4px up from its bottom edge,
    // all tuned to this 4px `p-1 -m-1` frame. `min-w-0` lets it shrink inside
    // the clip, which it no longer does itself.
    tabs: 'relative -m-1 flex min-w-0 grow p-1',
  },
});

const ui = tabs();

// Two root nodes (`.c-tabs__container` + `.c-tabs__content`) make this a
// fragment root, and we write `class`/`role`/style to the host below — keep
// those (and any consumer fallthrough attrs) on the host element instead of
// tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

const arrowLeft = mdiArrowLeft;

const arrowRight = mdiArrowRight;

const props = withDefaults(defineProps<CTabsProps>(), {
  borderless: false,
  disableAnimation: false,
  justify: 'stretch',
  mobileBreakpoint: 640,
  value: 0,
  vertical: false,
});

const justifyValues = [
  'center',
  'end',
  'start',
  'stretch',
] as const satisfies readonly CTabsJustify[];

// Attributes can deliver any string at runtime; unknown values fall back to
// stretch.
const justify = computed<CTabsJustify>(() =>
  justifyValues.includes(props.justify) ? props.justify : 'stretch',
);

const host = useHost();

const tabsRef = useTemplateRef<HTMLElement>('tabsRef');

const scrollRef = useTemplateRef<HTMLElement>('scrollRef');

const autoId = useId();

const internalValue = ref<number | string>(props.value);

// A user's tab pick, its own commit. Called only from interaction handlers;
// the value/internalValue watches are visuals-only (+ push-down), so the host
// `value` mirror doesn't loop. Activating the current tab changes nothing,
// so it emits nothing — Enter reaches both the keydown handler below and the
// tab's own.
const select = (value: CTabsEvents['change']) => {
  if (value === internalValue.value) return;

  internalValue.value = value;
  emitModelChange(host, value);
};

const isOverflowing = ref(false);

const isMobile = ref(false);

const scrollOffset = ref(0);

let initialized = false;

let previousWidth = 0;

let maxScrollOffset = 0;

let moveDebounce: null | ReturnType<typeof setTimeout> = null;

let debounce: null | ReturnType<typeof setTimeout> = null;

let resizeObserver: null | ResizeObserver = null;

let startX = 0;

let startY = 0;

// The axis a touch on the row moves along, decided by its first move: a
// horizontal drag scrolls the row, a vertical one is left to the page.
let touchAxis: '' | 'x' | 'y' = '';

let touchOffset = 0;

type CTabButtonsEl = { value: number | string } & HTMLElement;

type CTabEl = {
  active?: boolean;
  disabled?: boolean;
  tabStop?: boolean;
  value: number | string;
} & HTMLElement;

// An aria-label on the element names the tablist.
const attrs = useAttrs();

const tablistLabel = computed(() => attrs['aria-label'] as string | undefined);

// A tab's `disabled` reads back as the raw attribute string ('' when set).
const isDisabled = (tab: CTabEl) => coerceBoolean(tab.disabled);

// Buttons mode: a slotted c-tab-buttons is the tab strip, and the tablist.
const buttonsMode = ref(false);

type CTabItemsEl = {
  disableAnimation?: boolean;
  value: number | string;
} & HTMLElement;

// Vue defineCustomElement leaks the raw attribute string (e.g. "" for
// `<c-tabs disable-animation>`) instead of coercing to Boolean. Combine
// both signals: the prop (in case it ever does coerce, or it was set
// later via property) and the actual host attribute (always reliable
// for the initial markup intent).
const boolFromHost = (attr: string): boolean => {
  if (!host) return false;

  if (!host.hasAttribute(attr)) return false;

  const v = host.getAttribute(attr);

  return v !== 'false';
};

const disableAnimation = computed(
  () =>
    coerceBoolean(props.disableAnimation) || boolFromHost('disable-animation'),
);

const borderless = computed(
  () => coerceBoolean(props.borderless) || boolFromHost('borderless'),
);

const vertical = computed(
  () => coerceBoolean(props.vertical) || boolFromHost('vertical'),
);

const motionDisabled = () => prefersReducedMotion() || disableAnimation.value;

/** The row's scroll transition: none while motion is off. */
const rowSpeed = () => (motionDisabled() ? '0ms' : '200ms');

const tabItemsEl = () =>
  host?.querySelector('c-tab-items') as CTabItemsEl | null;

const tabButtonsEl = () =>
  host?.querySelector(':scope > c-tab-buttons') as CTabButtonsEl | null;

const tabsList = (): CTabEl[] => {
  const tb = tabButtonsEl();

  // Buttons mode: the tabs are the adapter's slotted plain c-buttons
  // — they stay light-DOM children of <c-tab-buttons>.
  if (tb) {
    return Array.from(tb.querySelectorAll(':scope > c-button')) as CTabEl[];
  }

  return Array.from(host?.querySelectorAll(':scope > c-tab') ?? []) as CTabEl[];
};

const availableValues = () => tabsList().map((t) => t.value);

const getTabIndex = (value: number | string) =>
  availableValues().findIndex((v) => v === value);

const setIndicatorVar = (name: string, value: string) => {
  (
    host?.shadowRoot?.querySelector('.c-tabs__tabs') as HTMLElement
  )?.style.setProperty(name, value);
};

// Push the current value down to c-tab-items and c-tab-buttons
// synchronously. Wrapping this in requestAnimationFrame causes a gap
// where c-tab-items has already run its own onMounted (with the default
// value 0, so no panel matches and all are flagged inactive) before the
// rAF fires to deliver the real value — which the user perceives as a
// flicker right after initial paint. Sync delivery means c-tab-items
// sees the correct value by the time its onMounted runs.
const updateItemsValue = () => {
  const items = tabItemsEl();

  if (items) items.value = internalValue.value;

  const tb = tabButtonsEl();

  if (tb) tb.value = internalValue.value;
};

const handleOverflow = () => {
  if (tabButtonsEl()) {
    isOverflowing.value = false;

    return;
  }

  const content = host?.shadowRoot?.querySelector('.c-tabs__scroll');

  const container = host?.shadowRoot?.querySelector('.c-tabs__tabs');

  if (!content || !container) return;
  isOverflowing.value = container.clientWidth + 1 < content.scrollWidth;
};

// Where a tab sits in the strip, whose pseudo-element is the indicator.
// Measured from the boxes, NOT from offsetLeft/offsetTop: a slotted tab's
// offsetParent lies outside this shadow tree (Chrome skips the strip for the
// page, or whatever positioned ancestor the page has), so its offsets moved
// with the tab set's place on the page. The row's scroll translate moves both
// boxes alike, and the scroll arrows sit outside the strip.
const placeInStrip = (tab: HTMLElement, strip: HTMLElement) => {
  const t = tab.getBoundingClientRect();

  const s = strip.getBoundingClientRect();

  return { left: t.left - s.left, top: t.top - s.top };
};

// The tab a pending move starts from: the first one asked for while the
// indicator waits, since it has not moved since.
let moveFrom: HTMLElement | null = null;

// A move asked for while another waits replaces it. Dropping it instead left
// the indicator under the previous tab, as a click right after the
// re-measure of a mount or resize did.
const moveIndicator = (oldTab: HTMLElement, newTab: HTMLElement) => {
  moveFrom ??= oldTab;

  if (moveDebounce !== null) clearTimeout(moveDebounce);
  moveDebounce = setTimeout(() => {
    moveDebounce = null;

    const fromTab = moveFrom ?? oldTab;

    moveFrom = null;

    requestAnimationFrame(() => {
      const content = host?.shadowRoot?.querySelector(
        '.c-tabs__scroll',
      ) as HTMLElement;

      const container = host?.shadowRoot?.querySelector(
        '.c-tabs__tabs',
      ) as HTMLElement;

      if (!content || !container) return;

      // Where the indicator comes to rest, under the new tab.
      const land = () => {
        const at = placeInStrip(newTab, content);

        setIndicatorVar('--_c-tabs-indicator-left', `${at.left}px`);
        setIndicatorVar('--_c-tabs-indicator-top', `${at.top}px`);
        setIndicatorVar(
          '--_c-tabs-indicator-width',
          String(
            vertical.value
              ? newTab.offsetHeight / content.offsetHeight
              : newTab.offsetWidth / content.offsetWidth,
          ),
        );

        if (!initialized) host?.classList.add('c-tabs--initialized');
        initialized = true;
      };

      // Without motion it lands at once: the row's speed is then 0ms under
      // disable-animation, and a zero-length transition fires no
      // transitionend to land on.
      if (motionDisabled()) {
        land();

        return;
      }

      if (initialized) {
        container.style.setProperty('--_c-tabs-transition-speed', '200ms');
      }

      const newTabPosition = fromTab.compareDocumentPosition(newTab);

      const from = placeInStrip(fromTab, content);

      const to = placeInStrip(newTab, content);

      let transitionWidth = 0;

      // DOCUMENT_POSITION_FOLLOWING (4) = new tab is after the old one.
      if (newTabPosition === 4) {
        transitionWidth = vertical.value
          ? to.top + newTab.offsetHeight - from.top
          : to.left + newTab.offsetWidth - from.left;
      } else {
        transitionWidth = vertical.value
          ? from.top + fromTab.offsetHeight - to.top
          : from.left + fromTab.offsetWidth - to.left;
        setIndicatorVar('--_c-tabs-indicator-left', `${to.left}px`);
        setIndicatorVar('--_c-tabs-indicator-top', `${to.top}px`);
      }

      setIndicatorVar(
        '--_c-tabs-indicator-width',
        String(
          vertical.value
            ? transitionWidth / content.offsetHeight
            : transitionWidth / content.offsetWidth,
        ),
      );

      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.propertyName !== 'scale') return;
        land();
        content.removeEventListener('transitionend', onTransitionEnd);
      };

      content.addEventListener('transitionend', onTransitionEnd);
    });
  }, 200);
};

let generatedIds = 0;

// The id that pairs a tab with its panel (`aria-controls` and
// `aria-labelledby`). An id the consumer set stays; a generated one is
// unique per element, so it survives tabs being added or reordered.
const ensureId = (el: HTMLElement, prefix: string): string => {
  if (!el.id) {
    generatedIds += 1;
    el.id = `${prefix}-${autoId}-${generatedIds}`;
  }

  return el.id;
};

// With no tab matching the value, the first enabled tab is the row's Tab
// stop, so the row stays reachable (c-tab: `tabStop`).
const updateTabStop = () => {
  if (tabButtonsEl()) return;

  const list = tabsList();

  const entry = list.some(
    (t) => t.value === internalValue.value && !isDisabled(t),
  )
    ? null
    : list.find((t) => !isDisabled(t));

  for (const t of list) t.tabStop = t === entry;
};

const handleActiveTab = () => {
  requestAnimationFrame(() => {
    updateTabStop();

    const items = tabItemsEl();

    if (!items) return;

    const oldTab =
      (host?.querySelector('[aria-selected="true"]') as HTMLElement) ??
      tabsList()[0];

    const tabItems = Array.from(
      items.querySelectorAll(':scope > c-tab-item'),
    ) as ({ active: boolean; value: number | string } & HTMLElement)[];

    const tb = tabButtonsEl();

    tabItems.forEach((item) => {
      const tab = tabsList().find((t) => t.value === item.value);

      const tabItemId = ensureId(item, 'c-tab-item');

      const isActive = item.value === internalValue.value;

      if (tab) {
        const tabId = ensureId(tab, 'c-tab');
        item.setAttribute('aria-labelledby', tabId);

        // A c-tab is the tab itself; in buttons mode the tab is the c-button's
        // inner button, which an id reference on its host never reaches, and
        // a host carrying one is a stray child of the tablist.
        if (!tb) tab.setAttribute('aria-controls', tabItemId);

        if (!tb) {
          tab.active = isActive;
        } else if (isActive) {
          tb.value = tab.value;
        }

        if (isActive && !tb) {
          moveIndicator(oldTab, tab);
          requestAnimationFrame(() => {
            if (!isOverflowing.value) return;

            const selected = host?.querySelector(
              'c-tab[aria-selected="true"]',
            ) as HTMLElement;
            moveToTab(selected);
            tabsRef.value?.style.setProperty(
              '--_c-tabs-transition-speed',
              rowSpeed(),
            );
          });
        }

        // No focus moves here: with manual activation focus stays where the
        // keys put it (a re-measure used to pull it back to the active tab).
      }

      item.active = isActive;
    });
  });
};

const getDimensions = (item: HTMLElement) => {
  const { width, x } = item.getBoundingClientRect();

  const tEl = tabsRef.value as HTMLElement;

  const { width: containerWidth, x: containerX } = tEl.getBoundingClientRect();

  return { containerWidth, containerX, width, x };
};

// Scroll the row so `tab` is in view. It moves no focus: a value set from
// code scrolls the selected tab into view too, and focus waiting for the
// scroll's transitionend never came without motion.
const moveToTab = (tab: HTMLElement) => {
  if (!tab) return;

  requestAnimationFrame(() => {
    const tabIndex = getTabIndex((tab.dataset.value as string) ?? '');

    if (tabIndex === 0) {
      scrollOffset.value = 0;

      return;
    }

    if (tabIndex === availableValues().length - 1) {
      scrollOffset.value = maxScrollOffset - 8;

      return;
    }

    const { containerWidth, containerX, width, x } = getDimensions(tab);

    const tabEnd = x + width;

    const containerEnd = containerX + containerWidth;

    if (x < containerX) {
      const tabInside = tabEnd - containerX;
      scrollOffset.value = scrollOffset.value - (tabInside - width) + 4;
    }

    if (tabEnd > containerEnd) {
      scrollOffset.value -= tabEnd - containerEnd + 4;
    }
  });
};

// Focus a tab at once, without the browser scrolling the clipped row; the row
// then scrolls a tab out of view into it.
const focusTab = (value: number | string) => {
  if (tabButtonsEl()) return;

  const item = tabsList().find((t) => t.value === value) as HTMLElement;

  if (!item) return;
  item.focus({ preventScroll: true });

  if (vertical.value) return;

  const { containerWidth, containerX, width, x } = getDimensions(item);

  if (x < containerX || x + width > containerX + containerWidth) {
    moveToTab(item);
  }
};

// A resize while the indicator moves is re-measured too: dropping it left a
// row that shrank in that window without its overflow arrows.
const handleResize = (width: number) => {
  if (debounce !== null) clearTimeout(debounce);
  debounce = setTimeout(() => {
    const content = host?.shadowRoot?.querySelector('.c-tabs__scroll');

    const container = host?.shadowRoot?.querySelector('.c-tabs__tabs');
    requestAnimationFrame(() => {
      if (width === previousWidth || !content || !container) return;
      handleOverflow();
      isMobile.value = width < props.mobileBreakpoint;
      maxScrollOffset = -1 * (content.scrollWidth - container.clientWidth);
      handleActiveTab();
      previousWidth = width;
    });
  }, 200);
};

/* --- touch dragging (horizontal only) --- */
const onTouchStart = (event: TouchEvent) => {
  handleOverflow();

  touchAxis = '';

  if (!isOverflowing.value) return;
  touchOffset = scrollOffset.value * -1;
  startX = event.touches[0].clientX;
  startY = event.touches[0].clientY;
};

const onTouchMove = (event: TouchEvent) => {
  if (vertical.value || !isOverflowing.value) return;

  if (!touchAxis) {
    const dx = Math.abs(event.touches[0].clientX - startX);

    const dy = Math.abs(event.touches[0].clientY - startY);

    if (dx < 4 && dy < 4) return;
    touchAxis = dx > dy ? 'x' : 'y';
  }

  if (touchAxis === 'y') return;
  event.preventDefault();
  tabsRef.value?.style.setProperty('--_c-tabs-transition-speed', '0ms');

  const offset = -1 * (touchOffset + startX - event.touches[0].clientX);

  if (offset <= 0 && offset >= maxScrollOffset) scrollOffset.value = offset;
  else if (offset > 0 || !isOverflowing.value) scrollOffset.value = 0;
  else if (offset < maxScrollOffset) scrollOffset.value = maxScrollOffset;
};

const onTouchEnd = () => {
  tabsRef.value?.style.setProperty('--_c-tabs-transition-speed', rowSpeed());
};

const onBackClick = () => {
  const step = (tabsRef.value?.clientWidth ?? 0) / 2;
  scrollOffset.value = Math.min(scrollOffset.value + step, 0);
};

const onForwardClick = () => {
  const max =
    ((scrollRef.value?.scrollWidth ?? 0) - (tabsRef.value?.clientWidth ?? 0)) *
    -1;

  const step = (tabsRef.value?.clientWidth ?? 0) / 2;
  scrollOffset.value = Math.max(-1 * step + scrollOffset.value, max);
};

/* --- reactive wiring --- */
watch(scrollOffset, (offset) => {
  tabsRef.value?.style.setProperty(
    '--_c-tabs-scroll-position-x',
    `${offset}px`,
  );
});

watch(
  () => props.value,
  (v) => {
    internalValue.value = v;
  },
);

watch(internalValue, () => {
  handleActiveTab();
  updateItemsValue();
});

watch(justify, handleActiveTab);

// In buttons mode c-tab-buttons is the tablist; it takes the tab set's name.
watch([tablistLabel, buttonsMode], () => {
  const tb = tabButtonsEl();

  if (tb && tablistLabel.value)
    tb.setAttribute('aria-label', tablistLabel.value);
});

// Host class list reflects the current variant/state set.
watchEffect(() => {
  if (!host) return;
  host.classList.add('c-tabs');
  host.classList.toggle('c-tabs--borderless', borderless.value);
  host.classList.toggle('c-tabs--vertical', vertical.value);
  host.classList.toggle('c-tabs--overflow', isOverflowing.value);
  host.classList.toggle('c-tabs--mobile', isMobile.value);
  justifyValues.forEach((j) =>
    host.classList.toggle(`c-tabs--justify-${j}`, justify.value === j),
  );
});

onMounted(() => {
  if (!host) return;
  buttonsMode.value = !!tabButtonsEl();

  // Defer reaching into slotted/light-DOM children: c-tabs.onMounted
  // runs in a microtask after its own connectedCallback, which can fire
  // *before* the HTML parser has appended c-tab-items / c-tab-buttons.
  // A rAF hop lets the parser finish and the children upgrade.
  // updateItemsValue (called below) also uses rAF, so we line up with it.
  requestAnimationFrame(() => {
    const items = tabItemsEl();

    if (items) items.disableAnimation = motionDisabled();

    const tb = tabButtonsEl();

    // The adapter needs no mode flag: c-tab-buttons is always the
    // tab-strip controller; only the host class for the indicator-suppressing
    // styles below is ours to set.
    buttonsMode.value = !!tb;

    if (tb) host.classList.add('c-tabs--buttons');
  });

  updateItemsValue();

  // Selection: a c-tab emits tabchange on click.
  host.addEventListener('tabchange', (e) => {
    const ev = e as CustomEvent<{ value: number | string }>;
    ev.stopPropagation();
    select(ev.detail.value);
  });
  // A tab's focus wiring event ends here (the keys read the focused tab
  // off the event target).
  host.addEventListener('tabfocus', (e) => e.stopPropagation());

  // APG Tabs with manual activation: Enter and Space select the focused tab;
  // the arrow keys (Up and Down in the vertical layout) move focus over the
  // enabled tabs, stopping at the ends, and Home and End go to the first and
  // the last. On keydown, as native controls act. In buttons mode the
  // adapter's wrapped c-button-group owns the keys, so this stands down.
  host.addEventListener(
    'keydown',
    (e) => {
      if (tabButtonsEl()) return;

      const ev = e as KeyboardEvent;

      const target = ev.target as CTabEl;

      if (!tabsList().includes(target)) return;

      if (ev.key === 'Enter' || ev.code === 'Space') {
        if (!isDisabled(target)) select(target.value);

        return;
      }

      const enabled = tabsList().filter((t) => !isDisabled(t));

      const at = enabled.indexOf(target);

      let next: CTabEl | undefined;

      if (ev.key === (vertical.value ? 'ArrowUp' : 'ArrowLeft')) {
        next = enabled[at - 1];
      } else if (ev.key === (vertical.value ? 'ArrowDown' : 'ArrowRight')) {
        next = enabled[at + 1];
      } else if (ev.key === 'Home') {
        next = enabled[0];
      } else if (ev.key === 'End') {
        next = enabled.at(-1);
      } else {
        return;
      }

      ev.preventDefault();

      if (next && next !== target) focusTab(next.value);
    },
    true,
  );

  resizeObserver = new ResizeObserver((entries) => {
    handleResize(entries[0].contentRect.width);
  });
  resizeObserver.observe(host);

  requestAnimationFrame(handleOverflow);
  handleActiveTab();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

// The page's id references on the element reach the tablist: the row's own,
// or c-tab-buttons' in buttons mode.
useIdReferences(() =>
  buttonsMode.value
    ? tabButtonsEl()?.shadowRoot?.querySelector('[role="tablist"]')
    : scrollRef.value,
);
</script>

<!--
  Escape-hatch CSS. c-tabs is irreducibly host-box + pseudo-element +
  ::slotted driven:
   - The host must be a real box: its display/grid drives the whole layout and
     all the `c-tabs--vertical/justify-*/overflow/mobile/borderless/buttons/
     initialized` state classes (toggled imperatively by the script) reshape it.
   - The active-tab indicator is a `.c-tabs__scroll::after` (horizontal) /
     `::before` (vertical) pseudo-element animated through `--_c-tabs-indicator-*`
     vars the script sets, with a `transitionend` the script listens for.
   - The scroll track transform reads `--_c-tabs-scroll-position-x` /
     `--_c-tabs-transition-speed` set imperatively.
   - `::slotted(...)` rules style the consumer's c-tab / c-tab-buttons /
     c-tab-items light-DOM children.
  None of these are expressible as static utilities. Token colours are authored
  directly: the `--c-tabs-*` indirection vars were dropped in favour
  of the design tokens, the dead `--c-icon-button-border-radius` override was
  removed (c-icon-button owns its own radius now), and `--c-tabs-border-color` /
  `--c-tabs-indicator-color` were reduced to a `borderless` toggle var + the
  `border` / `primary` semantic roles. This :host overrides the global
  `:host{display:contents}`; the per-type sheet wins as it is adopted last. The
  custom easing (ease-out-quart curve) intentionally differs from the shared
  `ease-standard`.
-->
<style>
:host(.c-tabs) {
  --_c-tabs-border-color: var(--c-border);
  --_c-tabs-transition-speed: 0.001ms;

  display: block;
  width: 100%;
  max-width: 100%;
}

.c-tabs__tabs::after {
  position: absolute;
  content: '';
  bottom: 4px;
  inset-inline: 0;
  height: 1px;
  background-color: var(--_c-tabs-border-color);
}

.c-tabs__scroll {
  transform: translateX(var(--_c-tabs-scroll-position-x));
  transition: transform var(--_c-tabs-transition-speed)
    cubic-bezier(0.075, 0.82, 0.165, 1);
}

.c-tabs__scroll::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  scale: var(--_c-tabs-indicator-width, 0.125) 1;
  opacity: 0.01;
  translate: var(--_c-tabs-indicator-left, 0) 0;
  transform-origin: left;
  transition:
    scale var(--_c-tabs-transition-speed) cubic-bezier(0.075, 0.82, 0.165, 1),
    translate var(--_c-tabs-transition-speed)
      cubic-bezier(0.075, 0.82, 0.165, 1);
  background: var(--c-primary);
}

::slotted(c-tab-buttons) {
  flex-grow: 1;
}

:host(.c-tabs--justify-start:not(.c-tabs--vertical)) ::slotted(c-tab-buttons),
:host(.c-tabs--justify-start:not(.c-tabs--vertical)) ::slotted(c-tab) {
  flex-grow: 0;
}

:host(.c-tabs--justify-end:not(.c-tabs--vertical)) .c-tabs__scroll {
  justify-content: end;
}
:host(.c-tabs--justify-end:not(.c-tabs--vertical)) ::slotted(c-tab-buttons),
:host(.c-tabs--justify-end:not(.c-tabs--vertical)) ::slotted(c-tab) {
  flex-grow: 0;
}

:host(.c-tabs--justify-center:not(.c-tabs--vertical)) .c-tabs__scroll {
  justify-content: center;
}
:host(.c-tabs--justify-center:not(.c-tabs--vertical)) ::slotted(c-tab-buttons),
:host(.c-tabs--justify-center:not(.c-tabs--vertical)) ::slotted(c-tab) {
  flex-grow: 0;
}

:host(.c-tabs--vertical) {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr;
}

:host(.c-tabs--vertical.c-tabs--mobile) {
  grid-template-columns: 1fr;
}

:host(.c-tabs--vertical) .c-tabs__tabs::after {
  display: none;
}

:host(.c-tabs--vertical) ::slotted(c-tab-items) {
  position: relative;
  min-height: 100%;
}

:host(.c-tabs--vertical) .c-tabs__scroll {
  display: grid;
  max-width: 100%;
}

:host(.c-tabs--vertical) .c-tabs__scroll::after {
  display: none;
}

:host(.c-tabs--vertical) .c-tabs__scroll::before {
  content: '';
  position: absolute;
  width: 4px;
  top: 0;
  bottom: 0;
  right: 0;
  scale: 1 var(--_c-tabs-indicator-width, 0.125);
  opacity: 0.01;
  translate: 0 var(--_c-tabs-indicator-top, 0);
  transform-origin: top left;
  transition:
    scale var(--_c-tabs-transition-speed) cubic-bezier(0.075, 0.82, 0.165, 1),
    translate var(--_c-tabs-transition-speed)
      cubic-bezier(0.075, 0.82, 0.165, 1);
  background: var(--c-primary);
}

:host(.c-tabs--vertical) ::slotted(c-tab) {
  box-shadow: inset -1px 0 0 0 var(--_c-tabs-border-color);
  padding-inline: 24px;
  justify-content: start;
  max-width: 100%;
  min-width: 100%;
}

:host(.c-tabs--buttons) .c-tabs__tabs::after,
:host(.c-tabs--buttons) .c-tabs__scroll::after {
  display: none;
}

/* Buttons mode: the strip scrolls inside its own viewport, so the tab row
   must squeeze it instead of growing with it. As a flex item the row's
   automatic minimum is its content's min-content width — the one-row strip
   in full (the strip's inner `min-w-0` does not shrink what flows up) — so
   the row outgrew `.c-tabs__tabs` and its clip, the frame was cut off at
   the edge and the inner scroller never overflowed: no arrows, no touch
   panning. The underlined c-tab row keeps its auto minimum: it scrolls by
   translating this very row past the viewport. */
:host(.c-tabs--buttons) .c-tabs__scroll {
  min-width: 0;
}

:host(.c-tabs--borderless) {
  --_c-tabs-border-color: transparent;
}

:host(.c-tabs--initialized) .c-tabs__scroll::after,
:host(.c-tabs--initialized) .c-tabs__scroll::before {
  opacity: 1;
}

:host(.c-tabs--overflow) .c-tabs__container {
  grid-template-columns: auto 1fr auto;
}

/* Reduced motion (ADR-0057): the shared sheet zeroes every transition, but the
   indicator and scroll moves are awaited through `transitionend`, which a
   zero-duration transition never fires. Keep them on the near-instant speed
   the script already uses when motion is off. */
@media (prefers-reduced-motion: reduce) {
  .c-tabs__scroll,
  .c-tabs__scroll::after,
  .c-tabs__scroll::before {
    transition-duration: 0.001ms !important;
  }
}
</style>
