<template>
  <div class="c-swiper">
    <div
      :id="`announce-${resolvedId}`"
      aria-atomic="true"
      aria-live="polite"
      class="visuallyhidden"
    >
      {{ statusText }}
    </div>

    <div
      ref="containerRef"
      class="swiper-container"
      role="tablist"
      @pointercancel="endDrag"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endDrag"
      @scroll.passive="onScroll"
    >
      <slot />
    </div>

    <div class="c-swiper__navigation">
      <c-icon-button
        :aria-disabled="atStart ? 'true' : 'false'"
        :disabled="atStart || undefined"
        aria-label="previous page"
        size="small"
        ghost
        @click="page(-1)"
      >
        <span class="visuallyhidden">
          Previous
          <span>page</span>
        </span>

        <svg height="24" viewBox="0 0 24 24" width="24">
          <path :d="arrowLeft" />
        </svg>
      </c-icon-button>

      <c-icon-button
        :aria-disabled="atEnd ? 'true' : 'false'"
        :disabled="atEnd || undefined"
        aria-label="next page"
        size="small"
        ghost
        @click="page(1)"
      >
        <span class="visuallyhidden">
          Next
          <span>page</span>
        </span>

        <svg height="24" viewBox="0 0 24 24" width="24">
          <path :d="arrowRight" />
        </svg>
      </c-icon-button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot for the c-swiper-tab elements
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-swiper-tab
 */
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import { emitModelValue } from '../../shared/emitModelValue';

/** Events dispatched by `<c-swiper>`. */
interface CSwiperEvents {
  /**
   * Fired when a tab is selected via click or arrow-key navigation, carrying
   * the selected tab's value (legacy value-change event).
   */
  changeValue: number | string;
  /**
   * Native bubbling input event for plain `v-model`; carries no detail — the
   * selected value is mirrored onto the host's `value` property.
   */
  input: void;
  /**
   * Fired when a tab is selected via click or arrow-key navigation, carrying
   * the selected tab's value (v-model contract).
   */
  'update:value': number | string;
}

interface CSwiperProps {
  /**
   * Id of the swiper element
   *
   * @seeded from csc-ui — verify
   */
  elementId?: string;
  /**
   * Value of the swiper
   *
   * @seeded from csc-ui — verify
   */
  value?: number | string;
}

const props = withDefaults(defineProps<CSwiperProps>(), {
  elementId: '',
  value: undefined,
});

const arrowLeft = mdiChevronLeft;

const arrowRight = mdiChevronRight;

const host = useHost();

const containerRef = useTemplateRef<HTMLElement>('containerRef');

const autoId = useId();

const internalValue = ref<number | string | undefined>(props.value);

const atStart = ref(true);

const atEnd = ref(false);

const statusText = ref('');

const resolvedId = computed(() => props.elementId || `c-swiper--${autoId}`);

type SwiperTabEl = {
  active?: boolean;
  disabled?: boolean;
  label?: string;
  position?: number;
  setsize?: number;
  value?: number | string;
} & HTMLElement;

// The c-swiper-tab elements are LIGHT-DOM children of the host, slotted
// into our shadow root. Reading shadow children would only give us the
// <slot> placeholder — query the host instead.
const tabs = (): SwiperTabEl[] =>
  host ? (Array.from(host.children) as SwiperTabEl[]) : [];

const updateEdges = () => {
  const el = containerRef.value;

  if (!el) return;
  atStart.value = el.scrollLeft <= 1;
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
};

// One "page" is the visible width of the container. scrollBy with smooth
// behaviour does the slide animation natively; scroll-snap snaps to the
// nearest item afterwards.
const page = (direction: -1 | 1) => {
  const el = containerRef.value;

  if (!el) return;
  el.scrollBy({ behavior: 'smooth', left: direction * el.clientWidth });
};

const onScroll = () => updateEdges();

// Pointer-drag scrolling (mouse only; touch already drag-scrolls
// natively because the container has overflow-x: auto).
let dragStartX = 0;

let dragStartScroll = 0;

let dragging = false;

let dragMoved = false;

const DRAG_THRESHOLD = 4;

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;

  const el = containerRef.value;

  if (!el) return;
  dragging = true;
  dragMoved = false;
  dragStartX = e.clientX;
  dragStartScroll = el.scrollLeft;
};

const onPointerMove = (e: PointerEvent) => {
  if (!dragging) return;

  const el = containerRef.value;

  if (!el) return;

  const dx = e.clientX - dragStartX;

  if (!dragMoved && Math.abs(dx) > DRAG_THRESHOLD) {
    dragMoved = true;
    el.classList.add('is-dragging');
    el.setPointerCapture(e.pointerId);
  }

  if (dragMoved) {
    el.scrollLeft = dragStartScroll - dx;
    e.preventDefault();
  }
};

const endDrag = (e: PointerEvent) => {
  if (!dragging) return;
  dragging = false;

  const el = containerRef.value;

  if (!el) return;

  if (dragMoved) {
    // Swallow the click that fires on pointerup at the end of a drag
    // so we don't accidentally activate the tab under the cursor.
    const swallow = (ev: Event) => {
      ev.stopPropagation();
      ev.preventDefault();
    };

    window.addEventListener('click', swallow, { capture: true, once: true });
    el.classList.remove('is-dragging');
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }

  dragMoved = false;
};

// changeValue/update:value + native `input` (plain v-model) + host `value`
// mirror. Called only from user interactions; the value watch runs `setActive`
// (visuals-only), so there is no loop.
const dispatchValue = (v: CSwiperEvents['changeValue'] | undefined) =>
  emitModelValue(host, v);

// IMPORTANT: We do NOT touch `child.active` here. `active` is the
// consumer's :active binding on the child — it represents the
// visually-selected tab and is owned by the consumer. The c-swiper's
// own `value` represents the keyboard-focused tab and is independent.
// Mirrors the Stencil reference (which has `child.active = isActive`
// explicitly commented out in handleKeyUp). Overriding `active` here
// caused the consumer's choice (e.g. tab6) to be wiped on mount.
const setActive = (v: number | string | undefined) => {
  internalValue.value = v;

  const items = tabs();

  const focused = items.find((t) => t.value === v);

  if (focused && containerRef.value) {
    const r = focused.getBoundingClientRect();

    const c = containerRef.value.getBoundingClientRect();

    if (r.left < c.left || r.right > c.right) {
      focused.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }

  statusText.value = '';
  setTimeout(() => {
    if (focused?.label)
      statusText.value = `Currently selected - ${focused.label}`;
  }, 1400);
};

const refreshTabs = () => {
  const items = tabs();
  items.forEach((slide, index) => {
    if (slide.value === undefined) slide.value = index;
    slide.position = index + 1;
    slide.setsize = items.length;
    slide.setAttribute('data-index', String(index));
  });
};

// Sync internalValue (= "focused" tab) with whichever child is
// currently `active`. If none, fall back to the existing prop value if
// it matches a tab. This is purely a read of consumer state — no
// child's active flag is mutated.
const syncFromActiveChild = () => {
  const items = tabs();

  const isActive = (t: SwiperTabEl) =>
    Boolean(t.active) || t.hasAttribute('active');

  const activeChild = items.find(isActive);

  if (activeChild) {
    internalValue.value = activeChild.value;

    return;
  }

  const v = internalValue.value;

  if (
    v !== undefined &&
    v !== null &&
    v !== '' &&
    items.some((t) => t.value === v)
  ) {
    return; // keep current value
  }
  // No child active and no matching value — leave internalValue empty.
};

onMounted(() => {
  refreshTabs();
  syncFromActiveChild();
  setActive(internalValue.value);
  // Re-sync after the next frame: when the consumer uses
  // `:active="selectedTab === tab.value"`, Vue's prop assignment can
  // land *after* our onMounted here, so the active child might not
  // have been flagged yet on the first pass.
  requestAnimationFrame(() => {
    syncFromActiveChild();
    setActive(internalValue.value);
  });
  updateEdges();

  // Children emit changeValue when clicked.
  host?.addEventListener('changeValue', (e) => {
    const ev = e as CustomEvent<number | string>;

    if (e.target === host) return;
    ev.stopPropagation();
    setActive(ev.detail);
    dispatchValue(internalValue.value);
  });

  // Arrow-key navigation.
  host?.addEventListener(
    'keyup',
    (e) => {
      const ev = e as KeyboardEvent;

      const items = tabs();

      const idx = items.indexOf(ev.target as SwiperTabEl);

      if (idx < 0) return;

      if (ev.key === 'ArrowLeft' && idx > 0) {
        setActive(items[idx - 1].value);
        items[idx - 1].focus();
        dispatchValue(internalValue.value);
      } else if (ev.key === 'ArrowRight' && idx < items.length - 1) {
        setActive(items[idx + 1].value);
        items[idx + 1].focus();
        dispatchValue(internalValue.value);
      }
    },
    true,
  );

  // Re-evaluate edges whenever the container resizes (responsive layouts
  // change which tabs fit, so the end edge moves).
  resizeObserver = new ResizeObserver(updateEdges);

  if (containerRef.value) resizeObserver.observe(containerRef.value);
});

let resizeObserver: null | ResizeObserver = null;
onBeforeUnmount(() => resizeObserver?.disconnect());

watch(
  () => props.value,
  (v) => setActive(v),
);
</script>

<style>
:host {
  /* `@container` queries the nearest container ancestor — never the
   * element itself. So the container lives on the host and the
   * per-view variable below is applied to a DESCENDANT (.c-swiper). */
  container-type: inline-size;
  container-name: c-swiper;

  display: block;
}

.c-swiper {
  /* Default: 1 slide per view. The @container blocks below override
   * this as the host's own width grows. */
  --c-swiper-per-view: 1;
}

.swiper-container {
  /* CSS grid stretches every cell to the row's tallest cell by default
   * — no align-items dance needed. With `grid-auto-flow: column` each
   * slotted child becomes a new column on the single row, all sized
   * uniformly via `grid-auto-columns` (the per-view fraction). Flex
   * had trouble with this here because the c-swiper-tab :host carries
   * its own `height: 100%`, which can resolve to "auto" inside a
   * scroll container and skip the cross-axis stretch. */
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc(
    (100% - (var(--c-swiper-per-view) - 1) * 8px) / var(--c-swiper-per-view)
  );
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  cursor: grab;
  -ms-overflow-style: none;
}
.swiper-container::-webkit-scrollbar {
  display: none;
}

.swiper-container.is-dragging {
  cursor: grabbing;
  scroll-behavior: auto;
  scroll-snap-type: none;
}

::slotted(c-swiper-tab) {
  /* Width comes from grid-auto-columns above; here we just opt into
   * scroll-snap and disable text selection so a drag-gesture doesn't
   * accidentally start one. */
  scroll-snap-align: start;
  user-select: none;
}

@container c-swiper (min-width: 480px) {
  .c-swiper {
    --c-swiper-per-view: 2;
  }
}
@container c-swiper (min-width: 720px) {
  .c-swiper {
    --c-swiper-per-view: 3;
  }
}
@container c-swiper (min-width: 960px) {
  .c-swiper {
    --c-swiper-per-view: 4;
  }
}

.c-swiper__navigation {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
  padding: 4px;
}

.visuallyhidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>
