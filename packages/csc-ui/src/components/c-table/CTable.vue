<template>
  <!-- The consumer's <table> stays in the LIGHT DOM, projected through this
       native slot outlet — it is never moved. Page stylesheets, ::part()
       selectors on nested components (c-tag, c-pagination, …) and the
       consumer framework's ownership of the nodes all keep working. The
       table's own styling ships as a document-level sheet scoped to
       `c-table > table.c-table` (table.css / ADR-0037), because ::slotted
       cannot reach nested th/td from a shadow sheet — and the previous model
       (physically moving the table into this shadow root) severed page CSS
       from everything inside the table. -->
  <slot />
</template>

<script setup lang="ts">
/**
 * @slot default - The consumer-authored `<table>` element
 */
import { onBeforeUnmount, onMounted, useHost, watch } from 'vue';

import { ensureTableStyles } from './injectTableStyles';

// `<slot />` root (fragment) + we write to the host below — keep fallthrough
// attrs on the host element instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

interface CTableProps {
  /**
   * Mobile breakpoint in pixels
   *
   * @seeded from csc-ui — verify
   */
  mobileBreakpoint?: number;
  /**
   * Should the table be responsive
   *
   * @seeded from csc-ui — verify
   */
  responsive?: boolean;
}

const props = withDefaults(defineProps<CTableProps>(), {
  mobileBreakpoint: 600,
  responsive: false,
});

// The table styles live in a document-level sheet — inject once per document.
ensureTableStyles();

const host = useHost();

let tableEl: HTMLTableElement | null = null;

let observer: null | ResizeObserver = null;

const headers = () =>
  tableEl
    ? Array.from(
        tableEl.querySelectorAll<HTMLTableCellElement>(':scope > thead th'),
      )
    : [];

const rows = () =>
  tableEl
    ? (
        Array.from(tableEl.querySelectorAll('tr')) as HTMLTableRowElement[]
      ).filter((row) => !row.hasAttribute('no-mobile-labels'))
    : [];

// Prepend a <span.c-table__mobile-label> to each <td> with the matching
// header content. Idempotent — skip cells that already have a label.
const createMobileLabels = () => {
  const cols = headers();

  if (!cols.length) return;
  rows().forEach((row) => {
    let cellIndex = 0;
    Array.from(row.querySelectorAll('td')).forEach((cell) => {
      if (cell.querySelector('.c-table__mobile-label')) return;

      const heading = cols[cellIndex % cols.length];
      cellIndex += cell.colSpan ?? 1;

      if (!heading?.childNodes.length) return;

      const span = document.createElement('span');
      span.classList.add('c-table__mobile-label');
      // Clone the header's nodes instead of serializing through innerHTML —
      // nested elements (icons, c-tags) survive as live, styleable clones.
      for (const node of heading.childNodes) {
        span.appendChild(node.cloneNode(true));
      }
      cell.prepend(span);
    });
  });
};

const handleResize = (width: number) => {
  if (!tableEl) return;
  tableEl.classList.toggle('c-table--mobile', width <= props.mobileBreakpoint);
};

const startObserving = () => {
  if (!tableEl || observer) return;
  observer = new ResizeObserver(([entry]) =>
    handleResize(entry.contentRect.width),
  );
  observer.observe(tableEl);
};

const stopObserving = () => {
  observer?.disconnect();
  observer = null;
  tableEl?.classList.remove('c-table--mobile');
};

const updateMobileLabels = () => createMobileLabels();

// Adopt the slotted `<table>`: stamp the styling hook class and (re)wire the
// responsive machinery. Idempotent — runs on mount and on every slotchange,
// so a table added or swapped after mount is picked up too.
const adoptTable = () => {
  const next = host?.querySelector(':scope > table');

  if (next === tableEl) {
    // Same table — its rows may still have changed.
    if (props.responsive) createMobileLabels();
    return;
  }

  stopObserving();
  tableEl?.classList.remove('c-table');
  tableEl = next instanceof HTMLTableElement ? next : null;

  if (!tableEl) return;
  tableEl.classList.add('c-table');

  if (props.responsive) {
    startObserving();
    createMobileLabels();
  }
};

onMounted(() => {
  if (!host) return;

  (host as unknown as { updateMobileLabels: () => void }).updateMobileLabels =
    updateMobileLabels;

  adoptTable();

  // Attributes on Vue's <slot> element are slot props, so the native outlet
  // is looked up from the shadow root and wired imperatively (same pattern
  // as CButtonGroup).
  host.shadowRoot
    ?.querySelector('slot')
    ?.addEventListener('slotchange', adoptTable);
});

// Toggle observation when responsive flips after mount.
watch(
  () => props.responsive,
  (on) => {
    if (on) {
      startObserving();
      createMobileLabels();
    } else {
      stopObserving();
    }
  },
);

// The table lives in the consumer's DOM and outlives this component: drop the
// responsive state class, but leave `.c-table` and the label spans in place —
// un-mutating a framework-owned tree at teardown is riskier than leaving
// inert artifacts behind.
onBeforeUnmount(() => stopObserving());
</script>

<!--
  Escape-hatch CSS: `:host { display: block }` is the only shadow-scoped rule —
  the host must be a real box that lays out the slotted table. Everything that
  styles the table itself lives in table.css, injected as a scoped DOCUMENT
  sheet (see injectTableStyles.ts / ADR-0037): the table is consumer-authored
  light DOM that neither utilities nor shadow descendant selectors can reach.
  Kept in the shadow sheet (not `c-table { … }` in the document sheet) so any
  consumer document rule on the host wins the cascade against it.
-->
<style>
:host {
  display: block;
}
</style>
