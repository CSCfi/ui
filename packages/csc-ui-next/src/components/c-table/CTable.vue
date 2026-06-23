<template>
  <!-- We DON'T use <slot/> here. Vue's <slot> would project the user's
       light-DOM <table> via slot assignment, which keeps the table in
       the flattened light tree. ::slotted only matches top-level
       assigned nodes, so we'd be unable to style th/td/tr/thead/etc.
       from inside this shadow root. Instead we physically move the
       <table> into this shadow root on mount — it then becomes a real
       shadow descendant and every nested selector below works as
       written, without leaking styles into the document. -->
  <div ref="mount" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useHost, useTemplateRef, watch } from 'vue';

// `<slot />` root (fragment) + we write to the host below — keep fallthrough
// attrs on the host element instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

const props = defineProps({
  mobileBreakpoint: { type: Number, default: 600 },
  responsive: { type: Boolean, default: false },
});

const host = useHost();
const mount = useTemplateRef<HTMLElement>('mount');
let tableEl: HTMLTableElement | null = null;
let observer: ResizeObserver | null = null;

const headers = () =>
  tableEl
    ? Array.from(tableEl.querySelectorAll('th')).map((th) => th.innerHTML)
    : [];

const rows = () =>
  tableEl
    ? (Array.from(tableEl.querySelectorAll('tr')) as HTMLTableRowElement[])
        .filter((row) => !row.hasAttribute('no-mobile-labels'))
    : [];

// Prepend a <span.c-table__mobile-label> to each <td> with the matching
// header text. Idempotent — skip cells that already have a label.
const createMobileLabels = () => {
  const cols = headers();
  if (!cols.length) return;
  rows().forEach((row) => {
    let cellIndex = 0;
    Array.from(row.querySelectorAll('td')).forEach((cell) => {
      if (cell.querySelector('.c-table__mobile-label')) return;
      const heading = cols[cellIndex % cols.length];
      cellIndex += cell.colSpan ?? 1;
      if (!heading) return;
      const span = document.createElement('span');
      span.classList.add('c-table__mobile-label');
      span.innerHTML = heading;
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

onMounted(() => {
  if (!host || !mount.value) return;
  // The user wrote `<c-table><table>...</table></c-table>`. The table is
  // currently a light-DOM child. Move it into the shadow root so our
  // shadow-scoped CSS below can reach its descendants.
  const lightTable = host.querySelector(':scope > table');
  if (!(lightTable instanceof HTMLTableElement)) return;
  tableEl = lightTable;
  tableEl.classList.add('c-table');
  mount.value.appendChild(tableEl);

  (host as unknown as { updateMobileLabels: () => void }).updateMobileLabels =
    updateMobileLabels;

  if (props.responsive) {
    startObserving();
    createMobileLabels();
  }
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

onBeforeUnmount(() => observer?.disconnect());
</script>

<style>
/* All rules apply inside the shadow root — the user's <table> was moved
 * here on mount, so descendant selectors (`table.c-table thead th` etc.)
 * resolve normally with no global leakage. */

:host {
  --_c-table-border-color: var(--c-table-border-color, var(--c-tertiary-200));
  --_c-table-header-text-color: var(--c-table-header-text-color, var(--c-text-system));
  --_c-table-row-background-color-mobile: var(--c-table-row-background-color-mobile, rgba(var(--c-primary-rgb), 0.05));

  display: block;
}

table.c-table {
  border-collapse: collapse;
  border-spacing: 0;
  border: 0;
  font-size: 100%;
  font-family: var(--c-font-family);
  margin: 0;
  padding: 0;
  width: 100%;
}

table.c-table caption,
table.c-table tbody,
table.c-table tfoot,
table.c-table thead,
table.c-table tr,
table.c-table th,
table.c-table td {
  border: 0;
  font-size: 100%;
  font-family: var(--c-font-family);
  margin: 0;
  padding: 0;
}

table.c-table thead {
  background-color: var(--c-white);
  position: relative;
}

table.c-table thead th {
  border-bottom: 2px solid var(--_c-table-border-color);
  text-align: left;
}

table.c-table tbody {
  box-shadow:
    inset 1px 0 0 0 var(--_c-table-border-color),
    inset -1px 0 0 0 var(--_c-table-border-color),
    inset 0 1px 0 0 var(--_c-table-border-color),
    inset 0 -1px 0 0 var(--_c-table-border-color);
}

@supports (-webkit-hyphens: none) {
  table.c-table tbody { border: 1px solid var(--_c-table-border-color); }
  table.c-table tbody tr { border-bottom: 1px solid var(--_c-table-border-color); }
}

table.c-table tbody tr {
  box-shadow: inset 0 1px 0 0 var(--_c-table-border-color);
}

table.c-table tfoot { background-color: var(--c-white); }
table.c-table tfoot tr { box-shadow: inset 0 1px 0 0 var(--_c-table-border-color); }
table.c-table tfoot td { min-height: 48px; }
table.c-table tfoot c-pagination { flex: 1; }

table.c-table th,
table.c-table td {
  font-weight: 400;
  box-sizing: border-box;
  line-height: normal;
  padding: 16px;
}

table.c-table th {
  height: 48px;
  font-size: 14px;
  color: var(--_c-table-header-text-color);
}

table.c-table td {
  font-size: 16px;
  color: var(--c-text-body);
}

table.c-table td span.c-table__mobile-label { display: none; }

table.c-table.c-table--mobile {
  border-spacing: 0 16px;
  border-collapse: separate;
}
table.c-table.c-table--mobile tbody { box-shadow: none; }
table.c-table.c-table--mobile tbody tr {
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px var(--_c-table-border-color);
}
@supports (-webkit-hyphens: none) {
  table.c-table.c-table--mobile tbody tr {
    display: grid;
    margin-bottom: 16px;
    border: none;
  }
}
table.c-table.c-table--mobile thead { display: none; }
table.c-table.c-table--mobile td {
  display: grid;
  gap: 4px;
  padding: 12px;
  min-height: 48px;
}
table.c-table.c-table--mobile td span.c-table__mobile-label {
  font-size: 14px;
  color: var(--_c-table-header-text-color);
  display: inline-block;
  text-align: start;
  padding-right: 8px;
}
table.c-table.c-table--mobile td:nth-of-type(even) {
  background-color: var(--_c-table-row-background-color-mobile);
}
</style>
