<template>
  <div ref="rootRef" :class="ui.root()" part="root">
    <div v-if="banner" :class="ui.banner()" aria-live="polite" part="banner">
      <span>{{ banner.message }}</span>

      <c-button size="small" text @click="banner.action">
        {{ banner.actionLabel }}
      </c-button>
    </div>

    <div ref="viewportRef" :class="ui.viewport()" part="viewport">
      <table class="c-data-table" part="table">
        <!-- v-show, not v-if: the slot element must stay in the DOM for its
             slotchange tracking to work, and an empty caption would otherwise
             reserve its padding. -->
        <caption v-show="hasCaption" part="caption">
          <slot name="caption" />
        </caption>

        <thead :class="{ sticky: coerceBoolean(stickyHeader) }" part="header">
          <tr ref="headerRowRef">
            <th
              v-if="selectionOn"
              :data-col="SELECTION_COL"
              :style="pinStyle(SELECTION_COL)"
              class="util-cell pinned"
              scope="col"
            >
              <div class="cell selection">
                <c-checkbox
                  v-if="selection === 'multiple'"
                  :aria-label="t.selectPage"
                  :indeterminate="somePageSelected && !allPageSelected"
                  :value="allPageSelected"
                  hide-details
                  @changeValue="onSelectPage"
                />
              </div>
            </th>

            <th
              v-for="col in visibleColumns"
              :key="col.key"
              :aria-sort="ariaSort(col)"
              :class="{ pinned: col.pinned }"
              :data-col="col.key"
              :style="[
                col.width ? { width: col.width } : null,
                pinStyle(col.key),
              ]"
              part="header-cell"
              scope="col"
            >
              <div
                :class="['cell', 'header', { sortable: col.sortable }]"
                :data-align="col.align"
                :role="col.sortable ? 'button' : undefined"
                :tabindex="col.sortable ? 0 : undefined"
                @click="toggleSort(col)"
                @keydown.enter.prevent="toggleSort(col)"
                @keydown.space.prevent="toggleSort(col)"
              >
                <render-node
                  v-if="typeof col.header === 'function'"
                  :content="col.header()"
                />

                <template v-else>{{ headerText(col) }}</template>

                <svg
                  v-if="col.sortable"
                  :class="[
                    'sort-icon',
                    {
                      active: sortState?.column === col.key,
                      desc:
                        sortState?.column === col.key &&
                        sortState?.direction === 'desc',
                    },
                  ]"
                  aria-hidden="true"
                  height="16"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <path :d="arrowIcon" fill="currentColor" />
                </svg>
              </div>
            </th>

            <th
              v-if="expanderOn"
              :data-col="EXPANDER_COL"
              :style="pinStyle(EXPANDER_COL)"
              class="util-cell pinned"
              scope="col"
            />
          </tr>

          <tr aria-hidden="true" class="loader-row">
            <th :colspan="totalColspan">
              <div class="loader-track">
                <div v-if="coerceBoolean(loading)" class="loader-bar" />
              </div>
            </th>
          </tr>
        </thead>

        <tbody part="body">
          <template v-for="row in renderRows" :key="row.id">
            <tr
              :class="{
                expanded: isExpanded(row.id),
                interactive: expanderOn,
                selected: isSelected(row.id),
              }"
              part="row"
              @click="onRowClick(row, $event)"
            >
              <td
                v-if="selectionOn"
                :style="pinStyle(SELECTION_COL)"
                class="util-cell pinned"
              >
                <div class="cell selection">
                  <c-checkbox
                    :aria-label="t.selectRow"
                    :value="isSelected(row.id)"
                    hide-details
                    @changeValue="onRowCheck(row, $event)"
                    @click.stop
                  />
                </div>
              </td>

              <td
                v-for="col in visibleColumns"
                :key="col.key"
                :class="{
                  pinned: col.pinned,
                  sorted: sortState?.column === col.key,
                }"
                :style="pinStyle(col.key)"
                part="cell"
              >
                <div :data-align="col.align" class="cell">
                  <render-node
                    v-if="col.cell"
                    :content="col.cell(cellContext(row, col))"
                  />

                  <template v-else>{{ displayValue(row, col) }}</template>
                </div>
              </td>

              <td
                v-if="expanderOn"
                :style="pinStyle(EXPANDER_COL)"
                class="util-cell pinned"
              >
                <div class="cell">
                  <c-icon-button
                    :aria-expanded="isExpanded(row.id)"
                    :aria-label="t.expandRow"
                    size="small"
                    text
                    @click.stop="toggleExpanded(row.id)"
                  >
                    <c-icon
                      :class="['expander-icon', { open: isExpanded(row.id) }]"
                      :path="chevronIcon"
                    />
                  </c-icon-button>
                </div>
              </td>
            </tr>

            <tr
              v-if="isExpanded(row.id)"
              :class="{ selected: isSelected(row.id) }"
              class="expansion"
              part="expansion-row"
            >
              <td :colspan="totalColspan">
                <div
                  :style="
                    viewportWidth ? { width: `${viewportWidth}px` } : undefined
                  "
                  class="expansion-content"
                >
                  <ul v-if="expansionColumns.length" class="expansion-list">
                    <li v-for="col in expansionColumns" :key="col.key">
                      <span class="label">
                        <render-node
                          v-if="typeof col.header === 'function'"
                          :content="col.header()"
                        />

                        <template v-else>{{ headerText(col) }}</template>
                      </span>

                      <span class="value">
                        <render-node
                          v-if="col.cell"
                          :content="col.cell(cellContext(row, col))"
                        />

                        <template v-else>{{ displayValue(row, col) }}</template>
                      </span>
                    </li>
                  </ul>

                  <render-node
                    v-if="expandedContent"
                    :content="expandedContent(expandedContext(row))"
                  />
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="!renderRows.length" class="empty-row">
            <td :colspan="totalColspan">
              <div class="cell empty" part="empty">
                <slot name="empty">
                  {{ coerceBoolean(loading) ? t.loading : t.noData }}
                </slot>
              </div>
            </td>
          </tr>
        </tbody>

        <tfoot
          v-if="footerOn"
          :class="{ sticky: coerceBoolean(stickyFooter) }"
          part="footer"
        >
          <tr>
            <td v-if="selectionOn" class="util-cell" />

            <td v-for="col in visibleColumns" :key="col.key">
              <div :data-align="col.align" class="cell">
                <render-node
                  v-if="col.footer"
                  :content="col.footer(footerContext(col))"
                />
              </div>
            </td>

            <td v-if="expanderOn" class="util-cell" />
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-if="paginationOn" :class="ui.pagination()" part="pagination">
      <c-pagination
        :value="paginationValue"
        @changeValue="onPaginationChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { VNodeChild } from 'vue';

/** Horizontal alignment of a column's header and cell content. */
export type CDataTableAlign = 'center' | 'end' | 'start';

/**
 * Content a data-table render function may return: a VNode (create with the
 * `h` re-exported from this package), a plain string/number rendered as text,
 * or an array of these. Strings render as text, never as HTML (ADR-0016).
 */
export type CDataTableCellContent = VNodeChild;

/** Context handed to a column's `cell` render function. */
export interface CDataTableCellContext {
  /** The column being rendered. */
  column: CDataTableColumn;
  /** The row object this cell belongs to. */
  row: CDataTableRow;
  /** Stable row id (from `getRowId`, or the row index). */
  rowId: string;
  /** Index of the row within the full data set. */
  rowIndex: number;
  /** The raw cell value (`row[column.key]`). */
  value: unknown;
}

/**
 * A column definition — the component-owned column API (ADR-0016). Mapped to
 * TanStack's `ColumnDef` internally; TanStack types never leak to consumers.
 */
export interface CDataTableColumn {
  /** Horizontal alignment of the header and cell content. */
  align?: CDataTableAlign;
  /**
   * Custom cell renderer. Return a VNode built with the package-exported `h`,
   * or a string/number rendered as text. Omit to render the raw value.
   */
  cell?: (context: CDataTableCellContext) => CDataTableCellContent;
  /**
   * When this column's cells move to the expansion row: `auto` (default,
   * moved only when autohide overflows), `never`, or `always`.
   */
  expansion?: CDataTableColumnExpansion;
  /**
   * Footer cell renderer. The footer row renders only when at least one
   * column defines one.
   */
  footer?: (context: CDataTableFooterContext) => CDataTableCellContent;
  /** Header content — a string, or a render function for rich headers. Defaults to `key`. */
  header?: (() => CDataTableCellContent) | string;
  /** Key of the row property this column reads (also the column's id). */
  key: string;
  /**
   * Pin the column to an edge so it stays visible during horizontal scroll.
   * A pinned column is never autohidden. Cannot combine with
   * `expansion: 'always'`.
   */
  pinned?: CDataTableColumnPin;
  /** Allow sorting by this column. */
  sortable?: boolean;
  /** Fixed column width (any CSS width value). */
  width?: string;
}

/**
 * When a column's cells live in the expansion row: `auto` (only when autohide
 * overflows — the default), `never` (always a real column), `always` (never a
 * real column). See CONTEXT.md → "Expansion policy".
 */
export type CDataTableColumnExpansion = 'always' | 'auto' | 'never';

/**
 * Side a column is pinned to. A pinned column sticks to the table edge during
 * horizontal scroll and is never autohidden. Not the old Stencil meaning —
 * see CONTEXT.md → "Pinned column".
 */
export type CDataTableColumnPin = 'left' | 'right';

/** Context handed to the table-level `expandedContent` render function. */
export interface CDataTableExpandedContext {
  /** Columns currently rendered inside the expansion row (policy `always` + autohidden). */
  expansionColumns: CDataTableColumn[];
  /** The expanded row object. */
  row: CDataTableRow;
  /** Stable row id (from `getRowId`, or the row index). */
  rowId: string;
  /** Index of the row within the full data set. */
  rowIndex: number;
}

/** Context handed to a column's `footer` render function. */
export interface CDataTableFooterContext {
  /** The column whose footer is being rendered. */
  column: CDataTableColumn;
  /** The rows currently rendered (the visible page). */
  rows: CDataTableRow[];
}

export interface CDataTableProps {
  /**
   * Move overflowing `expansion: 'auto'` columns into the expansion row
   * (rightmost first) instead of scrolling horizontally.
   */
  autohide?: boolean;
  /** Column definitions. Pass as a DOM property (contains functions). */
  columns?: CDataTableColumn[];
  /** Rows — plain domain objects. Pass as a DOM property. */
  data?: CDataTableRow[];
  /** Ids of the expanded rows (optionally controlled). */
  expanded?: string[];
  /**
   * Custom expansion-row content, appended after the auto-rendered cells of
   * columns currently in the expansion row.
   */
  expandedContent?: (
    context: CDataTableExpandedContext,
  ) => CDataTableCellContent;
  /**
   * The server owns sorting, pagination and filtering: the table renders
   * `data` verbatim and only emits the state-change events. Requires
   * `itemCount` for the pager; disables the select-all banner and `filter`.
   */
  external?: boolean;
  /**
   * Filter rows client-side against this string (all columns). Ignored when
   * `external` is set.
   *
   * @freeform
   */
  filter?: string;
  /**
   * Return a stable id for a row. Falls back to the row's index — supply
   * this whenever selection/expansion is used with `external` data.
   */
  getRowId?: (row: CDataTableRow) => string;
  /** Total number of rows in the dataset. Only used (and needed) with `external`. */
  itemCount?: number;
  /** Show the loading indicator. */
  loading?: boolean;
  /** Current page, 1-based (optionally controlled). */
  page?: number;
  /**
   * Rows per page. Pagination is active only when set — without it every row
   * renders and no pager is shown.
   */
  pageSize?: number;
  /** Options for the pager's page-size menu. */
  pageSizes?: number[];
  /** Ids of the selected rows (optionally controlled). */
  selected?: string[];
  /** Row selection mode. Unset means rows are not selectable. */
  selection?: CDataTableSelectionMode;
  /** Allow only one row to be expanded at a time. */
  singleExpansion?: boolean;
  /** The sorting state (optionally controlled). `null` renders unsorted. */
  sort?: CDataTableSort | null;
  /** Keep the footer row visible while the table scrolls vertically. */
  stickyFooter?: boolean;
  /** Keep the header row visible while the table scrolls vertically. */
  stickyHeader?: boolean;
  /** UI text overrides (i18n), merged over the English defaults. */
  texts?: CDataTableTexts;
}

/** A single data row — the consumer's own plain domain object (ADR-0016). */
export type CDataTableRow = Record<string, unknown>;

/** Row selection mode. Unset means rows are not selectable. */
export type CDataTableSelectionMode = 'multiple' | 'single';

/** The table's atomic sorting state. */
export interface CDataTableSort {
  /** `key` of the sorted column. */
  column: string;
  /** Direction the column is sorted in. */
  direction: CDataTableSortDirection;
}

/** Sorting direction of a column. */
export type CDataTableSortDirection = 'asc' | 'desc';

/**
 * UI texts, shallow-merged over the English defaults. Static labels are
 * strings; count-interpolated ones are functions.
 */
export interface CDataTableTexts {
  /** Banner text when every (filtered) row is selected. */
  allSelected?: (count: number) => string;
  /** Label of the banner action clearing the whole selection. */
  clearSelection?: string;
  /** Accessible label of a row's expansion toggle. */
  expandRow?: string;
  /** Text shown when the table is empty while `loading`. */
  loading?: string;
  /** Text shown when there are no rows (unless the `empty` slot is used). */
  noData?: string;
  /** Banner text when the visible page is fully selected. */
  pageSelected?: (count: number) => string;
  /** Label of the banner action selecting all (filtered) rows. */
  selectAllItems?: (count: number) => string;
  /** Accessible label of the header select-all checkbox. */
  selectPage?: string;
  /** Accessible label of a row's selection checkbox. */
  selectRow?: string;
}
</script>

<script setup lang="ts">
/**
 * @slot caption - Table caption, rendered into the native `<caption>` element
 * @slot empty - Empty-state content shown when there are no rows
 *
 * @csspart root - The outer wrapper around the table and pagination
 * @csspart banner - The two-step select-all banner
 * @csspart viewport - The scroll container around the table
 * @csspart table - The `<table>` element
 * @csspart caption - The `<caption>` element
 * @csspart header - The `<thead>` element
 * @csspart header-cell - A data column's `<th>`
 * @csspart body - The `<tbody>` element
 * @csspart row - A data `<tr>`
 * @csspart cell - A data column's `<td>`
 * @csspart expansion-row - The expansion `<tr>` revealed beneath a data row
 * @csspart footer - The `<tfoot>` element (footer columns)
 * @csspart empty - The empty-state cell content
 * @csspart pagination - The pagination bar below the table
 */
import { mdiArrowUp, mdiChevronDown } from '@mdi/js';
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useVueTable,
} from '@tanstack/vue-table';
import { tv } from 'tailwind-variants';
import {
  computed,
  type FunctionalComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue';

import type { CPaginationOptions } from '../c-pagination/CPagination.vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { useHasSlot } from '../../shared/useHasSlot';
import { useHostEmit } from '../../shared/useHostEmit';

// The root element is a plain div; keep consumer classes on the host instead
// of letting them fall through and collide with the tv utilities on `root`.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CDataTableProps>(), {
  autohide: false,
  columns: () => [],
  data: () => [],
  expanded: undefined,
  expandedContent: undefined,
  external: false,
  filter: '',
  getRowId: undefined,
  itemCount: undefined,
  loading: false,
  page: undefined,
  pageSize: undefined,
  pageSizes: () => [5, 25, 50, 100],
  selected: undefined,
  selection: undefined,
  singleExpansion: false,
  sort: undefined,
  stickyFooter: false,
  stickyHeader: false,
  texts: () => ({}),
});

/**
 * Events dispatched by `<c-data-table>`.
 *
 * Named `change:*` (all-lowercase kebab), NOT `update:*`: Vue's runtime treats
 * any `onUpdate:*` listener as v-model plumbing and silently drops it on
 * native/custom elements (`isModelListener` in `patchProp`), so a template
 * `@update:page` listener would never be attached. Lowercase names also
 * survive Vue's hyphenate round-trip, so they work even in no-build in-DOM
 * templates (ADR-0017).
 */
interface CDataTableEvents {
  /** Fired when the expanded rows change, carrying the expanded row ids. */
  'change:expanded': string[];
  /** Fired when the user changes the page, carrying the new 1-based page. */
  'change:page': number;
  /**
   * Fired when the user picks a new page size. Also resets the page to 1
   * (a separate `change:page` event fires alongside).
   */
  'change:page-size': number;
  /**
   * Fired when the selection changes, carrying the selected row ids and the
   * row objects resolvable from the current `data`.
   */
  'change:selected': { ids: string[]; rows: CDataTableRow[] };
  /** Fired when the user sorts a column, carrying the new sorting state. */
  'change:sort': CDataTableSort | null;
}

const emit = useHostEmit<CDataTableEvents>();

/**
 * Renders a render-function result (VNode / string / number / array) inside
 * the template. Strings become text nodes — never HTML.
 */
const RenderNode: FunctionalComponent<{ content: CDataTableCellContent }> = (
  p,
) => p.content;

RenderNode.props = ['content'];

const arrowIcon = mdiArrowUp;

const chevronIcon = mdiChevronDown;

/** Reserved data-col keys of the utility columns (not real columns). */
const SELECTION_COL = '__selection';

const EXPANDER_COL = '__expander';

const ui = tv({
  slots: {
    banner:
      'flex min-h-10 items-center gap-3 border-b border-border bg-primary-subtle px-3 py-1 text-sm text-on-primary-subtle',
    pagination: 'flex min-h-12 items-center px-2',
    root: 'relative box-border block w-full max-w-full bg-surface text-base text-on-surface',
    viewport: 'max-w-full overflow-auto',
  },
})();

const DEFAULT_TEXTS: Required<CDataTableTexts> = {
  allSelected: (count) => `All ${count} rows are selected`,
  clearSelection: 'Clear selection',
  expandRow: 'Toggle row expansion',
  loading: 'Loading data',
  noData: 'No data',
  pageSelected: (count) => `All ${count} rows on this page are selected`,
  selectAllItems: (count) => `Select all ${count} rows`,
  selectPage: 'Select all rows on this page',
  selectRow: 'Select row',
};

const t = computed(() => ({ ...DEFAULT_TEXTS, ...props.texts }));

const externalOn = computed(() => coerceBoolean(props.external));

const autohideOn = computed(() => coerceBoolean(props.autohide));

const selectionOn = computed(() => !!props.selection);

/* ---------------------------------------------------------------- columns */

const columnPolicy = (col: CDataTableColumn): CDataTableColumnExpansion => {
  // A pinned 'always' column is contradictory; expansion wins (dev warning
  // emitted from the columns watcher below).
  if (col.pinned && col.expansion !== 'always') return 'never';

  return col.expansion ?? 'auto';
};

watch(
  () => props.columns,
  (cols) => {
    for (const col of cols) {
      if (col.pinned && col.expansion === 'always') {
        console.warn(
          `[c-data-table] column "${col.key}" is pinned but has expansion: 'always' — the pin is ignored.`,
        );
      }
    }
  },
  { immediate: true },
);

/** Columns that may render as real table columns (policy !== 'always'). */
const renderableColumns = computed(() =>
  props.columns.filter((col) => columnPolicy(col) !== 'always'),
);

/** Keys of `auto` columns currently moved to the expansion row by autohide. */
const autohiddenKeys = ref<string[]>([]);

const autohiddenSet = computed(() => new Set(autohiddenKeys.value));

/**
 * Columns rendered as real table columns right now, reordered so pinned
 * columns sit at the edge they stick to.
 */
const visibleColumns = computed(() => {
  const shown = renderableColumns.value.filter(
    (col) => !autohiddenSet.value.has(col.key),
  );

  return [
    ...shown.filter((col) => col.pinned === 'left'),
    ...shown.filter((col) => !col.pinned),
    ...shown.filter((col) => col.pinned === 'right'),
  ];
});

/** Columns whose cells render inside the expansion row, in authored order. */
const expansionColumns = computed(() =>
  props.columns.filter(
    (col) => columnPolicy(col) === 'always' || autohiddenSet.value.has(col.key),
  ),
);

const expanderOn = computed(
  () => !!props.expandedContent || expansionColumns.value.length > 0,
);

const footerOn = computed(() =>
  renderableColumns.value.some((col) => col.footer),
);

const totalColspan = computed(
  () =>
    visibleColumns.value.length +
    (selectionOn.value ? 1 : 0) +
    (expanderOn.value ? 1 : 0),
);

const headerText = (col: CDataTableColumn) =>
  typeof col.header === 'string' ? col.header : col.key;

/* --------------------------------------------------- optionally-controlled */

const sortState = ref<CDataTableSort | null>(props.sort ?? null);

watch(
  () => props.sort,
  (v) => {
    sortState.value = v ?? null;
  },
);

const selectedIds = ref<string[]>([...(props.selected ?? [])]);

watch(
  () => props.selected,
  (v) => {
    if (v) selectedIds.value = [...v];
  },
);

const expandedIds = ref<string[]>([...(props.expanded ?? [])]);

watch(
  () => props.expanded,
  (v) => {
    if (v) expandedIds.value = [...v];
  },
);

const page = ref(props.page ?? 1);

watch(
  () => props.page,
  (v) => {
    if (v != null) page.value = v;
  },
);

const pageSize = ref<number | undefined>(props.pageSize);

watch(
  () => props.pageSize,
  (v) => {
    pageSize.value = v;
  },
);

const paginationOn = computed(() => (pageSize.value ?? 0) > 0);

/* --------------------------------------------------------------- tanstack */

const columnDefs = computed<ColumnDef<CDataTableRow>[]>(() =>
  props.columns.map((col) => ({
    accessorFn: (row: CDataTableRow) => row[col.key],
    enableSorting: !!col.sortable,
    id: col.key,
  })),
);

const sortingState = computed<SortingState>(() =>
  sortState.value
    ? [
        {
          desc: sortState.value.direction === 'desc',
          id: sortState.value.column,
        },
      ]
    : [],
);

const paginationState = computed(() => ({
  pageIndex: paginationOn.value ? page.value - 1 : 0,
  pageSize: paginationOn.value
    ? (pageSize.value as number)
    : Number.MAX_SAFE_INTEGER,
}));

const table = useVueTable<CDataTableRow>({
  autoResetPageIndex: false,
  get columns() {
    return columnDefs.value;
  },
  get data() {
    return props.data;
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getRowId: (row, index) => props.getRowId?.(row) ?? String(index),
  getSortedRowModel: getSortedRowModel(),
  globalFilterFn: 'includesString',
  get manualFiltering() {
    return externalOn.value;
  },
  get manualPagination() {
    return externalOn.value;
  },
  get manualSorting() {
    return externalOn.value;
  },
  state: {
    get globalFilter() {
      return externalOn.value ? '' : props.filter;
    },
    get pagination() {
      return paginationState.value;
    },
    get sorting() {
      return sortingState.value;
    },
  },
});

/** The rows rendered right now (the visible page). */
const renderRows = computed(() => table.getRowModel().rows);

/** Total row count the pager and banner reason about. */
const totalCount = computed(() =>
  externalOn.value
    ? (props.itemCount ?? props.data.length)
    : table.getFilteredRowModel().rows.length,
);

const displayValue = (row: Row<CDataTableRow>, col: CDataTableColumn) => {
  const value = row.getValue(col.key);

  return value == null ? '' : String(value);
};

const cellContext = (
  row: Row<CDataTableRow>,
  col: CDataTableColumn,
): CDataTableCellContext => ({
  column: col,
  row: row.original,
  rowId: row.id,
  rowIndex: row.index,
  value: row.getValue(col.key),
});

const expandedContext = (
  row: Row<CDataTableRow>,
): CDataTableExpandedContext => ({
  expansionColumns: expansionColumns.value,
  row: row.original,
  rowId: row.id,
  rowIndex: row.index,
});

const footerContext = (col: CDataTableColumn): CDataTableFooterContext => ({
  column: col,
  rows: renderRows.value.map((row) => row.original),
});

/* ---------------------------------------------------------------- sorting */

const toggleSort = (col: CDataTableColumn) => {
  if (!col.sortable) return;

  const current = sortState.value;

  const next: CDataTableSort =
    current?.column === col.key
      ? {
          column: col.key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
      : { column: col.key, direction: 'asc' };

  sortState.value = next;
  emit('change:sort', next);
};

const ariaSort = (col: CDataTableColumn) => {
  if (sortState.value?.column !== col.key) return undefined;

  return sortState.value.direction === 'asc' ? 'ascending' : 'descending';
};

/* -------------------------------------------------------------- selection */

const selectedSet = computed(() => new Set(selectedIds.value));

const isSelected = (id: string) => selectedSet.value.has(id);

const commitSelection = (ids: string[]) => {
  selectedIds.value = ids;

  const byId = table.getCoreRowModel().rowsById;

  emit('change:selected', {
    ids: [...ids],
    rows: ids.flatMap((id) => {
      const row = byId[id];

      return row ? [row.original] : [];
    }),
  });
};

const onRowCheck = (row: Row<CDataTableRow>, event: Event) => {
  const checked = coerceBoolean((event as CustomEvent).detail);

  if (props.selection === 'single') {
    commitSelection(checked ? [row.id] : []);

    return;
  }

  const next = new Set(selectedIds.value);

  if (checked) next.add(row.id);
  else next.delete(row.id);
  commitSelection([...next]);
};

const allPageSelected = computed(
  () =>
    renderRows.value.length > 0 &&
    renderRows.value.every((row) => selectedSet.value.has(row.id)),
);

const somePageSelected = computed(() =>
  renderRows.value.some((row) => selectedSet.value.has(row.id)),
);

const onSelectPage = (event: Event) => {
  const checked = coerceBoolean((event as CustomEvent).detail);

  const pageIds = renderRows.value.map((row) => row.id);

  const next = new Set(selectedIds.value);

  for (const id of pageIds) {
    if (checked) next.add(id);
    else next.delete(id);
  }

  commitSelection([...next]);
};

/**
 * The two-step select-all banner (client-side data only — with `external`
 * the full id set is unknowable, so the banner never renders).
 */
const banner = computed(() => {
  if (
    props.selection !== 'multiple' ||
    externalOn.value ||
    !paginationOn.value ||
    !allPageSelected.value ||
    totalCount.value <= renderRows.value.length
  ) {
    return null;
  }

  const allSelected = selectedIds.value.length >= totalCount.value;

  if (allSelected) {
    return {
      action: () => commitSelection([]),
      actionLabel: t.value.clearSelection,
      message: t.value.allSelected(totalCount.value),
    };
  }

  return {
    action: () =>
      commitSelection(table.getFilteredRowModel().rows.map((row) => row.id)),
    actionLabel: t.value.selectAllItems(totalCount.value),
    message: t.value.pageSelected(renderRows.value.length),
  };
});

/* -------------------------------------------------------------- expansion */

const expandedSet = computed(() => new Set(expandedIds.value));

const isExpanded = (id: string) => expandedSet.value.has(id);

const toggleExpanded = (id: string) => {
  const open = expandedSet.value.has(id);

  if (coerceBoolean(props.singleExpansion)) {
    expandedIds.value = open ? [] : [id];
  } else {
    expandedIds.value = open
      ? expandedIds.value.filter((x) => x !== id)
      : [...expandedIds.value, id];
  }

  emit('change:expanded', [...expandedIds.value]);
};

// Growing the table can empty the expansion panels: once autohide reveals
// every column (and there is no expandedContent), the expander column is
// gone, so an expanded row would keep its ring and an empty panel with no
// way to close them. Reset the expansion state instead — and notify, so an
// expanded-controlling consumer stays in sync.
watch(expanderOn, (on) => {
  if (!on && expandedIds.value.length) {
    expandedIds.value = [];
    emit('change:expanded', []);
  }
});

const onRowClick = (row: Row<CDataTableRow>, event: MouseEvent) => {
  if (!expanderOn.value) return;

  // Clicks on interactive content (consumer buttons/links, our controls)
  // must not toggle the expansion.
  const target = event.target as HTMLElement | null;

  if (
    target?.closest(
      'a, button, input, label, select, textarea, c-button, c-icon-button, c-checkbox, c-link, c-menu',
    )
  ) {
    return;
  }

  toggleExpanded(row.id);
};

/* ------------------------------------------------------------- pagination */

// startFrom/endTo are pre-filled: c-pagination normally writes them into the
// value object in place, but that mutation isn't observable on a per-change
// computed object, so its range text would read stale/absent values.
const paginationValue = computed<CPaginationOptions>(() => ({
  currentPage: page.value,
  endTo: page.value * (pageSize.value ?? 0) - 1,
  itemCount: totalCount.value,
  itemsPerPage: pageSize.value,
  pageSizes: props.pageSizes,
  startFrom: (page.value - 1) * (pageSize.value ?? 0),
}));

const setPage = (next: number) => {
  if (next === page.value) return;
  page.value = next;
  emit('change:page', next);
};

const onPaginationChange = (event: Event) => {
  const detail = (event as CustomEvent<CPaginationOptions>).detail;

  if (!detail) return;

  const nextSize = detail.itemsPerPage ?? pageSize.value;

  if (nextSize != null && nextSize !== pageSize.value) {
    pageSize.value = nextSize;
    emit('change:page-size', nextSize);
    // A page-size change re-slices the data; restart from the first page
    // (c-pagination does the same internally).
    setPage(1);

    return;
  }

  setPage(detail.currentPage ?? 1);
};

// Filtering changes the page count under the pager; restart from page 1.
watch(
  () => props.filter,
  () => {
    if (!externalOn.value) setPage(1);
  },
);

// Keep the page within range when the data shrinks beneath it.
watch([totalCount, pageSize], () => {
  if (!paginationOn.value) return;

  const max = Math.max(1, Math.ceil(totalCount.value / pageSize.value!));

  if (page.value > max) setPage(max);
});

/* ------------------------------------------- autohide + pinned measurement */

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasCaption = useHasSlot(rootRef, 'caption');

const viewportRef = useTemplateRef<HTMLElement>('viewportRef');

const headerRowRef = useTemplateRef<HTMLTableRowElement>('headerRowRef');

const viewportWidth = ref(0);

/**
 * First-seen rendered width per column (by data-col key). First-measure-wins:
 * once columns start autohiding, the survivors stretch into the freed space,
 * and re-recording those inflated widths would stop hidden columns from ever
 * coming back. Cleared when `columns`/`data` change.
 */
const measuredWidths = new Map<string, number>();

const FALLBACK_WIDTHS: Record<string, number> = {
  [EXPANDER_COL]: 46,
  [SELECTION_COL]: 56,
};

const colWidth = (key: string) =>
  measuredWidths.get(key) ?? FALLBACK_WIDTHS[key] ?? 150;

const measureColumns = () => {
  const cells = headerRowRef.value?.cells;

  if (!cells) return;

  for (const cell of Array.from(cells)) {
    const key = cell.getAttribute('data-col');

    if (key && !measuredWidths.has(key)) {
      measuredWidths.set(key, cell.getBoundingClientRect().width);
    }
  }
};

/** Sticky offsets per column key, applied as inline styles on th/td. */
const pinnedOffsets = ref<Record<string, { left?: string; right?: string }>>(
  {},
);

const pinStyle = (key: string) => pinnedOffsets.value[key];

const updatePinnedOffsets = () => {
  const offsets: Record<string, { left?: string; right?: string }> = {};

  let left = 0;

  if (selectionOn.value) {
    offsets[SELECTION_COL] = { left: '0px' };
    left += colWidth(SELECTION_COL);
  }

  for (const col of visibleColumns.value) {
    if (col.pinned !== 'left') continue;
    offsets[col.key] = { left: `${left}px` };
    left += colWidth(col.key);
  }

  let right = 0;

  if (expanderOn.value) {
    offsets[EXPANDER_COL] = { right: '0px' };
    right += colWidth(EXPANDER_COL);
  }

  for (const col of [...visibleColumns.value].reverse()) {
    if (col.pinned !== 'right') continue;
    offsets[col.key] = { right: `${right}px` };
    right += colWidth(col.key);
  }

  pinnedOffsets.value = offsets;
};

const recomputeOverflow = () => {
  measureColumns();

  if (!autohideOn.value) {
    if (autohiddenKeys.value.length) autohiddenKeys.value = [];
    updatePinnedOffsets();

    return;
  }

  const available = viewportRef.value?.clientWidth ?? 0;

  if (!available) return;

  let total = selectionOn.value ? colWidth(SELECTION_COL) : 0;

  for (const col of renderableColumns.value) total += colWidth(col.key);

  let hasExpander =
    !!props.expandedContent ||
    props.columns.some((col) => columnPolicy(col) === 'always');

  if (hasExpander) total += colWidth(EXPANDER_COL);

  // Hide `auto` columns rightmost-first until the table fits. Hiding the
  // first column brings in the expander column, whose width must fit too.
  const hideable = renderableColumns.value
    .filter((col) => columnPolicy(col) === 'auto')
    .reverse();

  const hidden: string[] = [];

  for (const col of hideable) {
    if (total <= available) break;
    hidden.push(col.key);
    total -= colWidth(col.key);

    if (!hasExpander) {
      hasExpander = true;
      total += colWidth(EXPANDER_COL);
    }
  }

  if (
    hidden.length !== autohiddenKeys.value.length ||
    hidden.some((key, i) => autohiddenKeys.value[i] !== key)
  ) {
    autohiddenKeys.value = hidden;
  }

  updatePinnedOffsets();
};

let resizeObserver: null | ResizeObserver = null;

onMounted(() => {
  void nextTick(() => recomputeOverflow());

  if (viewportRef.value) {
    resizeObserver = new ResizeObserver(([entry]) => {
      viewportWidth.value = entry.contentRect.width;
      recomputeOverflow();
    });
    resizeObserver.observe(viewportRef.value);
  }
});

onBeforeUnmount(() => resizeObserver?.disconnect());

// Structural inputs changed: measurements are stale. Show everything again,
// remeasure at natural widths, then re-hide what overflows.
watch([() => props.columns, () => props.data, autohideOn, selectionOn], () => {
  measuredWidths.clear();
  autohiddenKeys.value = [];
  void nextTick(() => recomputeOverflow());
});
</script>

<!--
  Escape-hatch CSS (ADR-0007): table-structural styling — row borders and
  selection/expansion rings as layered inset box-shadows (multi-layer shadow
  utilities are broken in shadow roots), sticky header/footer/pinned-column
  machinery, the row-background custom-property indirection that keeps pinned
  cells opaque, the loading keyframes, and `data-align` attribute selectors.
  None of these are expressible as element-bound utilities. All colours are
  semantic tokens (ADR-0010).

  Two deliberate departures from the Stencil original:
  - `border-collapse: separate` — collapse breaks `position: sticky` on
    header cells.
  - Row borders and selection/expansion rings live on the CELLS (segmented
    across first/last-child), not the `<tr>`: an opaque cell background would
    hide any `<tr>`-level box-shadow.

  The table outline is segmented onto the cells the same way: first/last-column
  body cells paint the left/right rails and the last row the bottom edge, while
  header cells paint none of them — so the header row has no top/left/right
  border and the outline visually starts at its bottom edge (matching the
  Stencil original, where the thead background covered the table's inset
  outline). A whole-table inset shadow cannot work here because every cell is
  opaque. Bonus over the original: pinned-left/right columns render as
  first/last cells, so the rails ride the viewport edges during horizontal
  scroll.
-->
<style>
:host {
  display: block;
}

table.c-data-table {
  background-color: var(--c-surface);
  border-collapse: separate;
  border-spacing: 0;
  font-family: var(--c-font-family);
  width: 100%;
}

table.c-data-table caption,
table.c-data-table tbody,
table.c-data-table tfoot,
table.c-data-table thead,
table.c-data-table tr,
table.c-data-table th,
table.c-data-table td {
  border: 0;
  font-family: inherit;
  font-size: 100%;
  margin: 0;
  padding: 0;
}

table.c-data-table caption {
  color: var(--c-on-surface);
  padding: 12px;
  text-align: left;
}

table.c-data-table caption:empty {
  display: none;
}

/* Row background flows to the cells through a custom property so sticky
   pinned cells stay opaque over scrolled-under content. */
table.c-data-table tr {
  --_c-data-table-row-bg: var(--c-surface);
}

table.c-data-table th,
table.c-data-table td {
  background-color: var(--_c-data-table-row-bg);
  font-weight: 400;
}

table.c-data-table th > div.cell,
table.c-data-table td > div.cell {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  line-height: normal;
  padding: 12px;
  width: 100%;
}

/* ------------------------------------------------------------- header -- */

table.c-data-table th {
  font-size: 14px;
  padding: 4px;
  text-align: left;
}

table.c-data-table th > div.cell {
  border-radius: 4px;
  flex-wrap: nowrap;
  gap: 8px;
  height: 48px;
  white-space: nowrap;
}

table.c-data-table th > div.cell.sortable:hover {
  background-color: var(--c-primary-subtle-hover);
  color: var(--c-primary);
  cursor: pointer;
}

table.c-data-table .sort-icon {
  fill: currentcolor;
  flex: none;
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

table.c-data-table th > div.cell.sortable:hover .sort-icon {
  opacity: 0.5;
}

table.c-data-table .sort-icon.active {
  opacity: 1;
}

table.c-data-table .sort-icon.desc {
  transform: rotate(180deg);
}

table.c-data-table thead th {
  position: relative;
  z-index: 1;
}

table.c-data-table thead.sticky th {
  position: sticky;
  top: 0;
  z-index: 3;
}

/* The loader row is the second sticky header row; it parks right beneath the
   56px-tall header row (48px cell + 2 * 4px th padding). */
table.c-data-table thead.sticky tr.loader-row th {
  top: 56px;
}

table.c-data-table thead.sticky th.pinned,
table.c-data-table thead th.pinned {
  z-index: 4;
}

/* --------------------------------------------------------------- loader -- */

table.c-data-table tr.loader-row th {
  padding: 0;
}

table.c-data-table .loader-track {
  background-color: var(--c-border);
  height: 2px;
  overflow: hidden;
  position: relative;
  width: 100%;
}

table.c-data-table .loader-bar {
  animation: c-data-table-loading 1s ease-in 0.5s infinite;
  background-color: var(--c-primary);
  height: 100%;
  left: -50%;
  position: absolute;
  width: 50%;
}

@keyframes c-data-table-loading {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(400%);
  }
}

/* ----------------------------------------------------------------- body -- */

table.c-data-table td {
  font-size: 16px;
}

table.c-data-table td > div.cell {
  align-items: flex-start;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  min-height: 56px;
}

table.c-data-table td.sorted {
  background-image: linear-gradient(
    var(--c-primary-subtle),
    var(--c-primary-subtle)
  );
}

/* Row borders, the table outline and the rings are painted per-cell (see the
   block comment above). Every body cell carries the 1px top border; the
   first/last cells add the outline's left/right rails, the last row its
   bottom edge, and the ring layers of the selected/expanded states are
   segmented the same way. Header cells paint no outline segments — the
   header row "floats" with no top/left/right border. */
/* Every structural pseudo-class is wrapped in `:where()` so ALL of these
   rules stay at (0,0,3) — the same specificity as the base separator rule —
   and later source order picks the right one per position. Any state rule
   below (selected / expanded / expansion, all ≥ (0,1,3)) therefore always
   wins over the structural outline and repaints its own edges. */
table.c-data-table tbody td {
  box-shadow: inset 0 1px 0 0 var(--c-border);
}

table.c-data-table tbody td:where(:first-child) {
  box-shadow:
    inset 1px 0 0 0 var(--c-border),
    inset 0 1px 0 0 var(--c-border);
}

table.c-data-table tbody td:where(:last-child) {
  box-shadow:
    inset -1px 0 0 0 var(--c-border),
    inset 0 1px 0 0 var(--c-border);
}

/* Full-span cells (the empty row) carry both rails. */
table.c-data-table tbody td:where(:first-child):where(:last-child) {
  box-shadow:
    inset 1px 0 0 0 var(--c-border),
    inset -1px 0 0 0 var(--c-border),
    inset 0 1px 0 0 var(--c-border);
}

/* The bottom edge lives on the last row — only when the tbody is the table's
   last row group (with a tfoot, the footer paints it instead). */
table.c-data-table tbody:where(:last-child) tr:where(:last-child) td {
  box-shadow:
    inset 0 1px 0 0 var(--c-border),
    inset 0 -1px 0 0 var(--c-border);
}

table.c-data-table
  tbody:where(:last-child)
  tr:where(:last-child)
  td:where(:first-child) {
  box-shadow:
    inset 1px 0 0 0 var(--c-border),
    inset 0 1px 0 0 var(--c-border),
    inset 0 -1px 0 0 var(--c-border);
}

table.c-data-table
  tbody:where(:last-child)
  tr:where(:last-child)
  td:where(:last-child) {
  box-shadow:
    inset -1px 0 0 0 var(--c-border),
    inset 0 1px 0 0 var(--c-border),
    inset 0 -1px 0 0 var(--c-border);
}

table.c-data-table
  tbody:where(:last-child)
  tr:where(:last-child)
  td:where(:first-child):where(:last-child) {
  box-shadow:
    inset 1px 0 0 0 var(--c-border),
    inset -1px 0 0 0 var(--c-border),
    inset 0 1px 0 0 var(--c-border),
    inset 0 -1px 0 0 var(--c-border);
}

table.c-data-table tbody tr.interactive {
  cursor: pointer;
}

table.c-data-table tbody tr.interactive:hover {
  --_c-data-table-row-bg: var(--c-primary-subtle-hover);
}

table.c-data-table tbody tr.selected {
  --_c-data-table-row-bg: var(--c-primary-subtle);
}

/* Selected: 4px accent on the row's left edge. */
table.c-data-table tbody tr.selected td:first-child {
  box-shadow:
    inset 4px 0 0 var(--c-primary),
    inset 0 1px 0 0 var(--c-border);
}

/* A selected LAST row keeps the outline's bottom edge under its accent cell. */
table.c-data-table
  tbody:where(:last-child)
  tr.selected:where(:last-child)
  td:first-child {
  box-shadow:
    inset 4px 0 0 var(--c-primary),
    inset 0 1px 0 0 var(--c-border),
    inset 0 -1px 0 0 var(--c-border);
}

/* Expanded: 2px ring on the top + sides (the expansion row closes it). */
table.c-data-table tbody tr.expanded td {
  box-shadow: inset 0 2px 0 var(--c-primary);
}

table.c-data-table tbody tr.expanded td:first-child {
  box-shadow:
    inset 2px 0 0 var(--c-primary),
    inset 0 2px 0 var(--c-primary);
}

table.c-data-table tbody tr.expanded td:last-child {
  box-shadow:
    inset -2px 0 0 var(--c-primary),
    inset 0 2px 0 var(--c-primary);
}

table.c-data-table tbody tr.expanded.selected td:first-child {
  box-shadow:
    inset 4px 0 0 var(--c-primary),
    inset 0 2px 0 var(--c-primary);
}

table.c-data-table tbody tr.expanded .expander-icon {
  transform: rotate(180deg);
}

table.c-data-table .expander-icon {
  /* c-icon's host must be a transformable box for the rotation to apply. */
  display: inline-flex;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

/* ------------------------------------------------------------ expansion -- */

/* The expansion row is a single full-span cell: sides + bottom of the ring. */
table.c-data-table tbody tr.expansion td {
  box-shadow:
    inset 2px 0 0 var(--c-primary),
    inset -2px 0 0 var(--c-primary),
    inset 0 -2px 0 var(--c-primary);
  padding: 0;
}

table.c-data-table tbody tr.expansion.selected td {
  box-shadow:
    inset 4px 0 0 var(--c-primary),
    inset -2px 0 0 var(--c-primary),
    inset 0 -2px 0 var(--c-primary);
}

/* Stays pinned to the visible table area during horizontal scroll; the
   inline width binding keeps it exactly the viewport's width. */
table.c-data-table .expansion-content {
  box-sizing: border-box;
  left: 0;
  padding: 4px;
  position: sticky;
}

table.c-data-table .expansion-list {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

table.c-data-table .expansion-list li {
  padding: 12px;
}

table.c-data-table .expansion-list li:not(:last-child) {
  box-shadow: inset 0 -1px 0 0 var(--c-border);
}

table.c-data-table .expansion-list .label {
  color: var(--c-primary);
  display: block;
  font-size: 14px;
  font-weight: 600;
}

table.c-data-table .expansion-list .value {
  display: block;
  margin-top: 4px;
}

/* ---------------------------------------------------------------- empty -- */

table.c-data-table tr.empty-row td > div.cell {
  align-items: center;
  color: var(--c-on-surface-muted);
  justify-content: center;
  min-height: 96px;
}

/* --------------------------------------------------------------- footer -- */

/* The footer row closes the outline: it paints the bottom edge and its
   first/last cells the rails (the tbody stops painting them — see above). */
table.c-data-table tfoot td {
  box-shadow:
    inset 0 1px 0 0 var(--c-border),
    inset 0 -1px 0 0 var(--c-border);
}

table.c-data-table tfoot td:first-child {
  box-shadow:
    inset 1px 0 0 0 var(--c-border),
    inset 0 1px 0 0 var(--c-border),
    inset 0 -1px 0 0 var(--c-border);
}

table.c-data-table tfoot td:last-child {
  box-shadow:
    inset -1px 0 0 0 var(--c-border),
    inset 0 1px 0 0 var(--c-border),
    inset 0 -1px 0 0 var(--c-border);
}

table.c-data-table tfoot td > div.cell {
  align-items: center;
  flex-direction: row;
  font-weight: 600;
  min-height: 48px;
}

table.c-data-table tfoot.sticky td {
  bottom: 0;
  position: sticky;
  z-index: 3;
}

/* ------------------------------------------------------ pinned / utility -- */

table.c-data-table th.pinned,
table.c-data-table td.pinned {
  position: sticky;
  z-index: 2;
}

table.c-data-table th.util-cell {
  width: 46px;
}

table.c-data-table th.util-cell:first-child {
  width: 56px;
}

table.c-data-table .cell.selection {
  justify-content: center;
  padding: 4px 0 4px 8px;
}

table.c-data-table td .cell.selection {
  align-items: center;
}

/* ------------------------------------------------------------ alignment -- */

table.c-data-table td > div.cell[data-align='center'] {
  align-items: center;
}

table.c-data-table td > div.cell[data-align='end'] {
  align-items: flex-end;
}

/* Header and footer cells are row-flex, so horizontal alignment is
   justify-content there (body cells are column-flex — align-items above). */
table.c-data-table th > div.cell[data-align='center'],
table.c-data-table tfoot td > div.cell[data-align='center'] {
  justify-content: center;
}

table.c-data-table th > div.cell[data-align='end'],
table.c-data-table tfoot td > div.cell[data-align='end'] {
  justify-content: flex-end;
}

/* ------------------------------------------------------------ pagination -- */

[part='pagination'] c-pagination {
  flex: 1;
}
</style>
