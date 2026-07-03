<template>
  <div :class="ui.container()" class="c-tabs__container" part="container">
    <c-icon-button
      v-if="isOverflowing && !vertical"
      size="x-small"
      ghost
      @click="onBackClick"
    >
      <c-icon :path="arrowLeft" />
    </c-icon-button>

    <div
      ref="tabsRef"
      :class="ui.tabs()"
      class="c-tabs__tabs"
      part="tabs"
      @touchend="onTouchEnd"
      @touchmove="onTouchMove"
      @touchstart="onTouchStart"
    >
      <div ref="scrollRef" :class="ui.scroll()" class="c-tabs__scroll">
        <slot />
      </div>
    </div>

    <c-icon-button
      v-if="isOverflowing && !vertical"
      size="x-small"
      ghost
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

export interface CTabsProps {
  /**
   * Disable the bottom border
   *
   * @seeded from csc-ui — verify
   */
  borderless?: boolean;
  /**
   * Disable animation
   *
   * @seeded from csc-ui — verify
   */
  disableAnimation?: boolean;
  /**
   * Justification of the children
   *
   * @seeded from csc-ui — verify
   */
  justify?: CTabsJustify;
  /**
   * Mobile breakpoint in pixels
   * - affects the content stacking with the vertical tabs
   *
   * @seeded from csc-ui — verify
   */
  mobileBreakpoint?: number;
  /**
   * Currently active tab
   *
   * @seeded from csc-ui — verify
   */
  value?: number | string;
  /**
   * Vertical tabs
   *
   * @seeded from csc-ui — verify
   */
  vertical?: boolean;
}
</script>

<script setup lang="ts">
/**
 * @slot default - Default slot
 * @slot items - The c-tab-items container holding the tab content panels
 * @csspart container - The header row wrapping the tab list and the overflow scroll buttons
 * @csspart tabs - The clipping viewport the tab list scrolls inside
 * @csspart content - Wrapper around the slotted tab content panels
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-tab, c-tab-items, c-tab-item
 */
import { mdiArrowLeft, mdiArrowRight } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useId,
  useTemplateRef,
  watch,
  watchEffect,
} from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelValue } from '../../shared/emitModelValue';

/** Events dispatched by `<c-tabs>`. */
interface CTabsEvents {
  /**
   * Fired when the user activates a tab (click, or Enter/Space on a focused
   * tab), carrying the newly selected tab value. Legacy value-change event.
   */
  changeValue: number | string;
  /** Native bubbling input event dispatched for plain `v-model` support; carries no detail. */
  input: void;
  /**
   * Fired alongside `changeValue` with the newly selected tab value; fulfills
   * the `v-model`/`v-control` contract.
   */
  'update:value': number | string;
}

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004) for the parts
 * whose layout is static utilities; customization is via `::part()` (ADR-0006).
 *
 * The rest of this component is irreducibly escape-hatch (ADR-0007), kept in
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
    // base container layout; the overflow/vertical reshaping lives on the host
    // selectors in the escape-hatch <style>.
    container: 'grid items-center gap-1',
    content: 'flex',
    scroll: 'flex m-0 p-0 relative grow',
    tabs: 'flex overflow-hidden p-1 relative -m-1',
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
// stretch (ADR-0015).
const justify = computed<CTabsJustify>(() =>
  justifyValues.includes(props.justify) ? props.justify : 'stretch',
);

const host = useHost();

const tabsRef = useTemplateRef<HTMLElement>('tabsRef');

const scrollRef = useTemplateRef<HTMLElement>('scrollRef');

// changeValue/update:value + native `input` (so a plain `v-model` works without
// `v-control`) + host `value` mirror. Called only from interaction handlers;
// the value/internalValue watches are visuals-only (+ push-down), so no loop.
const dispatchValue = (value: CTabsEvents['changeValue']) =>
  emitModelValue(host, value);

const autoId = useId();

const internalValue = ref<number | string>(props.value);

const isOverflowing = ref(false);

const isMobile = ref(false);

const scrollOffset = ref(0);

let initialized = false;

let isDirty = false;

let focusedTabValue: number | string = props.value;

let previousWidth = 0;

let maxScrollOffset = 0;

let moveDebounce: null | ReturnType<typeof setTimeout> = null;

let debounce: null | ReturnType<typeof setTimeout> = null;

let resizeObserver: null | ResizeObserver = null;

let startX = 0;

let touchOffset = 0;

type CTabButtonsEl = { value: number | string } & HTMLElement;

type CTabEl = {
  active?: boolean;
  disabled?: boolean;
  value: number | string;
} & HTMLElement;

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

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  disableAnimation.value;

const tabItemsEl = () =>
  host?.querySelector('c-tab-items') as CTabItemsEl | null;

const tabButtonsEl = () =>
  host?.querySelector(':scope > c-tab-buttons') as CTabButtonsEl | null;

const tabsList = (): CTabEl[] => {
  const tb = tabButtonsEl();

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

const moveIndicator = (oldTab: HTMLElement, newTab: HTMLElement) => {
  if (moveDebounce !== null) return;
  moveDebounce = setTimeout(() => {
    requestAnimationFrame(() => {
      const content = host?.shadowRoot?.querySelector(
        '.c-tabs__scroll',
      ) as HTMLElement;

      const container = host?.shadowRoot?.querySelector(
        '.c-tabs__tabs',
      ) as HTMLElement;

      if (!content || !container) return;

      if (initialized && !prefersReducedMotion()) {
        container.style.setProperty('--_c-tabs-transition-speed', '200ms');
      }

      const buttonOffset = isOverflowing.value ? 32 : 0;

      const newTabWidth = newTab.offsetWidth / content.offsetWidth;

      const newTabHeight = newTab.offsetHeight / content.offsetHeight;

      const newTabPosition = oldTab.compareDocumentPosition(newTab);

      let transitionWidth = 0;

      // DOCUMENT_POSITION_FOLLOWING (4) = new tab is after the old one.
      if (newTabPosition === 4) {
        transitionWidth = vertical.value
          ? newTab.offsetTop + newTab.offsetHeight - oldTab.offsetTop
          : newTab.offsetLeft + newTab.offsetWidth - oldTab.offsetLeft;
      } else {
        transitionWidth = vertical.value
          ? oldTab.offsetTop + oldTab.offsetHeight - newTab.offsetTop
          : oldTab.offsetLeft + oldTab.offsetWidth - newTab.offsetLeft;
        setIndicatorVar(
          '--_c-tabs-indicator-left',
          `${newTab.offsetLeft - buttonOffset}px`,
        );
        setIndicatorVar(
          '--_c-tabs-indicator-top',
          `${newTab.offsetTop - buttonOffset}px`,
        );
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
        setIndicatorVar(
          '--_c-tabs-indicator-left',
          `${newTab.offsetLeft - buttonOffset}px`,
        );
        setIndicatorVar(
          '--_c-tabs-indicator-top',
          `${newTab.offsetTop - buttonOffset}px`,
        );
        setIndicatorVar(
          '--_c-tabs-indicator-width',
          String(vertical.value ? newTabHeight : newTabWidth),
        );
        content.removeEventListener('transitionend', onTransitionEnd);

        if (!initialized) host?.classList.add('c-tabs--initialized');
        initialized = true;
      };

      content.addEventListener('transitionend', onTransitionEnd);
    });

    if (moveDebounce !== null) clearTimeout(moveDebounce);
    moveDebounce = null;
  }, 200);
};

const handleActiveTab = () => {
  requestAnimationFrame(() => {
    const items = tabItemsEl();

    if (!items) return;

    const oldTab =
      (host?.querySelector('[aria-selected="true"]') as HTMLElement) ??
      tabsList()[0];

    const tabItems = Array.from(
      items.querySelectorAll(':scope > c-tab-item'),
    ) as ({ active: boolean; value: number | string } & HTMLElement)[];

    const tb = tabButtonsEl();

    tabItems.forEach((item, index) => {
      const tab = tabsList().find((t) => t.value === item.value);

      const tabItemId = `c-tab-item-${autoId}-${index + 1}`;

      const isActive = item.value === internalValue.value;

      if (tab) {
        const tabId = `c-tab-${autoId}-${index + 1}`;
        item.setAttribute('aria-labelledby', tabId);
        tab.setAttribute('id', tabId);
        tab.setAttribute('aria-controls', tabItemId);

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
              '200ms',
            );
          });
        }

        if (isActive && isDirty) tab.focus();
      }

      item.setAttribute('id', tabItemId);
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

const moveToTab = (tab: HTMLElement) => {
  if (!tab) return;

  const onTransitionEnd = () => {
    tab?.focus();
    scrollRef.value?.removeEventListener('transitionend', onTransitionEnd);
  };

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
  scrollRef.value?.addEventListener('transitionend', onTransitionEnd);
};

const focusTab = (value: number | string) => {
  if (tabButtonsEl()) return;
  requestAnimationFrame(() => {
    const item = tabsList().find((t) => t.value === value) as HTMLElement;

    if (!item) return;

    const { containerWidth, containerX, width, x } = getDimensions(item);

    if (x >= containerX && x + width <= containerX + containerWidth) {
      item.focus();

      return;
    }

    moveToTab(item);
  });
};

const handleResize = (width: number) => {
  if (moveDebounce !== null) return;

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

  if (!isOverflowing.value) return;
  touchOffset = scrollOffset.value * -1;
  startX = event.touches[0].clientX;
};

const onTouchMove = (event: TouchEvent) => {
  if (vertical.value) return;
  event.preventDefault();
  tabsRef.value?.style.setProperty('--_c-tabs-transition-speed', '0ms');

  const offset = -1 * (touchOffset + startX - event.touches[0].clientX);

  if (offset <= 0 && offset >= maxScrollOffset) scrollOffset.value = offset;
  else if (offset > 0 || !isOverflowing.value) scrollOffset.value = 0;
  else if (offset < maxScrollOffset) scrollOffset.value = maxScrollOffset;
};

const onTouchEnd = () => {
  tabsRef.value?.style.setProperty('--_c-tabs-transition-speed', '200ms');
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
  host.setAttribute('role', 'tablist');

  // Defer reaching into slotted/light-DOM children: c-tabs.onMounted
  // runs in a microtask after its own connectedCallback, which can fire
  // *before* the HTML parser has appended c-tab-items / c-tab-buttons.
  // A rAF hop lets the parser finish and the children upgrade.
  // updateItemsValue (called below) also uses rAF, so we line up with it.
  requestAnimationFrame(() => {
    const items = tabItemsEl();

    if (items) items.disableAnimation = prefersReducedMotion();

    const tb = tabButtonsEl();

    if (tb) {
      host.classList.add('c-tabs--buttons');
      // Set the property (Boolean) rather than the attribute (string).
      // Vue defineCustomElement's Boolean coercion warns about a string
      // "true" coming in via setAttribute and may store it as a string,
      // breaking `if (!props.tabs)` checks downstream.
      (tb as unknown as { tabs: boolean }).tabs = true;
    }
  });

  updateItemsValue();

  // Selection: a c-tab emits tabChange on click.
  host.addEventListener('tabChange', (e) => {
    const ev = e as CustomEvent<{ value: number | string }>;
    ev.stopPropagation();
    internalValue.value = ev.detail.value;
    dispatchValue(internalValue.value);
  });
  host.addEventListener('tabFocus', (e) => {
    const ev = e as CustomEvent<number | string>;
    ev.stopPropagation();
    focusedTabValue = ev.detail;
  });

  // Keyboard: Enter/Space selects focused tab; arrows move focus.
  host.addEventListener(
    'keydown',
    (e) => {
      const ev = e as KeyboardEvent;

      const target = ev.target as CTabEl;

      if (!tabsList().includes(target) || target.disabled) return;

      if (ev.key === 'Enter' || ev.code === 'Space') {
        internalValue.value = target.value;
        dispatchValue(internalValue.value);
      }
    },
    true,
  );
  host.addEventListener(
    'keyup',
    (e) => {
      const ev = e as KeyboardEvent;
      isDirty = true;

      if (!tabsList().includes(ev.target as CTabEl)) return;

      const isLeft = ev.key === 'ArrowLeft';

      const isRight = ev.key === 'ArrowRight';

      if (!isLeft && !isRight) return;

      const values = availableValues();

      const idx = getTabIndex(focusedTabValue);

      const first = values.at(0);

      const last = values.at(-1);

      const isBeginning = focusedTabValue === first;

      const isEnd = focusedTabValue === last;

      if (isLeft) {
        if (isBeginning) return;
        focusTab(isBeginning ? last! : values[idx - 1]);
      }

      if (isRight) {
        if (isEnd) return;
        focusTab(isEnd ? first! : values[idx + 1]);
      }
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
</script>

<!--
  Escape-hatch CSS (ADR-0007). c-tabs is irreducibly host-box + pseudo-element +
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
  directly (ADR-0004): the `--c-tabs-*` indirection vars were dropped in favour
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
  transform: translateX(0%);
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
</style>
