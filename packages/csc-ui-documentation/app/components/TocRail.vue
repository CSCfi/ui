<template>
  <aside
    ref="railRef"
    aria-label="On this page"
    class="sticky top-24 max-h-[calc(100vh-7rem)] w-56 shrink-0 overflow-y-auto text-[0.8125rem] max-lg:hidden"
  >
    <p
      class="mb-2 text-[0.6875rem] font-bold uppercase tracking-wider text-primary"
    >
      On this page
    </p>

    <nav ref="navRef" class="relative flex flex-col border-l border-border">
      <!-- Scroll-position indicator: slides along the rail to the link of
           the section currently under the sticky toolbar. -->
      <span
        v-show="marker.visible"
        aria-hidden="true"
        class="absolute -left-px w-0.5 bg-primary transition-[top,height] duration-200"
        :style="{ top: `${marker.top}px`, height: `${marker.height}px` }"
      />

      <a
        v-for="item in items"
        :key="item.id"
        :class="linkClass(item)"
        :href="`#${item.id}`"
      >
        {{ item.label }}
      </a>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import type { TocItem } from '~/utils/toc';

const { items } = defineProps<{
  /** Rail links in document order; ids double as the scrollspy targets. */
  items: TocItem[];
}>();

// Shared by every rail link; kind variants append their own utilities
// (Tailwind orders pl-* after px-*, so the pl-6 override wins). The active
// text color is composed per-link — never put the conflicting text utilities
// in one class list.
const TOC_LINK =
  '-ml-px border-l-2 border-l-transparent px-3 py-[0.15rem] no-underline hover:border-l-primary hover:text-on-surface';

const KIND_CLASS: Record<NonNullable<TocItem['kind']>, string> = {
  component: 'mt-2 font-mono text-[0.78rem] font-semibold',
  sub: 'pl-6',
};

const linkClass = (item: TocItem) => [
  TOC_LINK,
  activeId.value === item.id ? 'text-on-surface' : 'text-on-surface-muted',
  item.kind ? KIND_CLASS[item.kind] : '',
];

// ---- scrollspy --------------------------------------------------------------
// The active target is the last item whose anchor sits above the sticky
// toolbar, pinned to the final item at the bottom of the page; the rail
// marker slides to its link.

const railRef = useTemplateRef<HTMLElement>('railRef');

const navRef = useTemplateRef<HTMLElement>('navRef');

const activeId = ref('');

const marker = reactive({ height: 0, top: 0, visible: false });

// Sticky toolbar (60px) + the anchors' scroll breathing room.
const HEADER_OFFSET = 104;

// When a long rail overflows its own scrollport, keep the active link in
// view (with some breathing room). Instant, not smooth — during a continuous
// page scroll each restart of a smooth animation would lag behind.
const scrollRailToLink = (link: HTMLElement) => {
  const rail = railRef.value;

  if (!rail || !navRef.value || rail.scrollHeight <= rail.clientHeight) return;

  const margin = 32;

  // The rail (sticky → positioned) is the nav's offsetParent.
  const top = navRef.value.offsetTop + link.offsetTop;
  const bottom = top + link.offsetHeight;

  if (top < rail.scrollTop + margin) {
    rail.scrollTop = Math.max(0, top - margin);
  } else if (bottom > rail.scrollTop + rail.clientHeight - margin) {
    rail.scrollTop = bottom - rail.clientHeight + margin;
  }
};

const positionMarker = (activeChanged: boolean) => {
  const link = navRef.value?.querySelector<HTMLElement>(
    `a[href="#${CSS.escape(activeId.value)}"]`,
  );

  if (!link) {
    marker.visible = false;

    return;
  }

  // offsetTop is relative to the nav (its offsetParent — it is `relative`).
  marker.top = link.offsetTop;
  marker.height = link.offsetHeight;
  marker.visible = true;

  // Auto-scroll only when the active target moves — never while the user is
  // browsing the rail with the page (and the active link) standing still.
  if (activeChanged) scrollRailToLink(link);
};

const updateActive = () => {
  let current = '';

  for (const { id } of items) {
    const el = document.getElementById(id);

    if (el && el.getBoundingClientRect().top <= HEADER_OFFSET) current = id;
  }

  // Pin the last item once the page is scrolled to the bottom (short tail
  // sections could otherwise never reach the toolbar line).
  const scrolledToBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;

  if (scrolledToBottom) current = items.at(-1)?.id ?? current;

  const next = current || (items[0]?.id ?? '');

  const activeChanged = next !== activeId.value;

  activeId.value = next;
  positionMarker(activeChanged);
};

let frame = 0;

const scheduleUpdate = () => {
  if (frame) return;

  frame = requestAnimationFrame(() => {
    frame = 0;
    updateActive();
  });
};

let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  window.addEventListener('scroll', scheduleUpdate, { passive: true });

  // Content height changes without a scroll event (flavor switch swapping
  // code blocks, example demos hydrating) — re-measure on any body resize.
  resizeObserver = new ResizeObserver(scheduleUpdate);
  resizeObserver.observe(document.body);

  updateActive();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleUpdate);
  resizeObserver?.disconnect();
  if (frame) cancelAnimationFrame(frame);
});
</script>
