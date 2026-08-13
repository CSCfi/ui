<template>
  <!-- We DON'T use <slot/> here. Vue's <slot> would project the user's
       light-DOM <table> via slot assignment, which keeps the table in
       the flattened light tree. ::slotted only matches top-level
       assigned nodes, so we'd be unable to style th/td/tr/thead/etc.
       from inside this shadow root. Instead we physically move the
       <table> into this shadow root on mount — it then becomes a real
       shadow descendant and every nested selector below works as
       written, without leaking styles into the document. -->
  <div ref="mountRef" />
</template>

<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  useHost,
  useTemplateRef,
  watch,
} from 'vue';

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

const host = useHost();

const mountRef = useTemplateRef<HTMLElement>('mountRef');

let tableEl: HTMLTableElement | null = null;

let observer: null | ResizeObserver = null;

const headers = () =>
  tableEl
    ? Array.from(tableEl.querySelectorAll('th')).map((th) => th.innerHTML)
    : [];

const rows = () =>
  tableEl
    ? (
        Array.from(tableEl.querySelectorAll('tr')) as HTMLTableRowElement[]
      ).filter((row) => !row.hasAttribute('no-mobile-labels'))
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
  if (!host || !mountRef.value) return;

  // The user wrote `<c-table><table>...</table></c-table>`. The table is
  // currently a light-DOM child. Move it into the shadow root so our
  // shadow-scoped CSS below can reach its descendants.
  const lightTable = host.querySelector(':scope > table');

  if (!(lightTable instanceof HTMLTableElement)) return;
  tableEl = lightTable;
  tableEl.classList.add('c-table');
  mountRef.value.appendChild(tableEl);

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

<!--
  Escape-hatch CSS: this whole block is unavoidably escape-hatch.
  The styled <table>/thead/tbody/tr/th/td are the user's light-DOM table that is
  physically MOVED into this shadow root on mount (see onMounted) — they are not
  rendered by this template, so they can't carry `tv` `:class` bindings. The
  styling therefore stays as shadow-scoped descendant selectors keyed off the
  `.c-table` / `.c-table--mobile` classes the script toggles. The
  per-component `--c-*` indirection vars are dropped: rules author directly
  against the global design tokens. `:host{display:block}` is kept because the
  host must be a real box that contains the moved table; the rest are
  descendant / `:nth-of-type` / `@supports` selectors and the mobile-label
  `::before`-style span — none of which utilities can express.
-->
<style>
:host {
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
  background-color: var(--c-surface);
  position: relative;
}

table.c-table thead th {
  border-bottom: 2px solid var(--c-border);
  text-align: left;
}

table.c-table tbody {
  box-shadow:
    inset 1px 0 0 0 var(--c-border),
    inset -1px 0 0 0 var(--c-border),
    inset 0 1px 0 0 var(--c-border),
    inset 0 -1px 0 0 var(--c-border);
}

@supports (-webkit-hyphens: none) {
  table.c-table tbody {
    border: 1px solid var(--c-border);
  }
  table.c-table tbody tr {
    border-bottom: 1px solid var(--c-border);
  }
}

table.c-table tbody tr {
  box-shadow: inset 0 1px 0 0 var(--c-border);
}

table.c-table tfoot {
  background-color: var(--c-surface);
}
table.c-table tfoot tr {
  box-shadow: inset 0 1px 0 0 var(--c-border);
}
table.c-table tfoot td {
  min-height: 48px;
}
table.c-table tfoot c-pagination {
  flex: 1;
}

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
  color: var(--c-on-surface-muted);
}

table.c-table td {
  font-size: 16px;
  color: var(--c-on-surface);
}

table.c-table td span.c-table__mobile-label {
  display: none;
}

table.c-table.c-table--mobile {
  border-spacing: 0 16px;
  border-collapse: separate;
}
table.c-table.c-table--mobile tbody {
  box-shadow: none;
}
table.c-table.c-table--mobile tbody tr {
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px var(--c-border);
}
@supports (-webkit-hyphens: none) {
  table.c-table.c-table--mobile tbody tr {
    display: grid;
    margin-bottom: 16px;
    border: none;
  }
}
table.c-table.c-table--mobile thead {
  display: none;
}
table.c-table.c-table--mobile td {
  display: grid;
  gap: 4px;
  padding: 12px;
  min-height: 48px;
}
table.c-table.c-table--mobile td span.c-table__mobile-label {
  font-size: 14px;
  color: var(--c-on-surface-muted);
  display: inline-block;
  text-align: start;
  padding-right: 8px;
}
table.c-table.c-table--mobile td:nth-of-type(even) {
  background-color: color-mix(in srgb, var(--c-primary) 5%, transparent);
}
</style>
