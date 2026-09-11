<template>
  <!-- Anchor wrapper: a shadow-DOM box around the value field. CSS anchor
       names are tree-scoped, so the anchor must live in the same shadow root
       as the panel. `useAnchoredPanel` supplies its `anchor-name` and the
       panel's matching `position-anchor`, and measures its rect to pin the
       panel width. -->
  <span ref="anchorRef" :style="anchorStyle" class="block w-full">
    <c-input
      ref="cInputRef"
      :active="isOpen"
      :data-hide-details="String(hideDetailsResolved)"
      :disabled
      :error-message
      :filled="hasSelection"
      :hint
      :input-id
      :label
      :label-on-top="labelOnTopResolved"
      :required
      :shadow="shadowResolved"
      :size="sizeResolved"
      :valid
      @click="onFieldClick"
    >
      <div :class="ui.content()" class="c-input__content">
        <!-- The readonly combobox is visually hidden (clip, never
             display:none — it must keep taking focus) behind the two-line
             value block; its value carries the flattened "path › code label"
             for assistive technology and the form. -->
        <input
          ref="fieldRef"
          :aria-controls="`${id}-listbox`"
          :aria-expanded="isOpen"
          :aria-label="label || undefined"
          :class="ui.input()"
          :disabled
          :name="name || undefined"
          :value="inputValue"
          aria-haspopup="listbox"
          autocomplete="off"
          class="c-input__input"
          role="combobox"
          type="text"
          readonly
          @keydown="onFieldKeyDown"
        />

        <!-- The committed item: its path as a muted line above, then its
             code and label. Hidden from AT — the combobox value reads it.
             Always rendered: with the readonly input clipped out of the flow
             this block is the row's filler that keeps the clear / chevron
             button at the trailing edge while the field is empty. -->
        <div :class="ui.fieldText()" aria-hidden="true">
          <template v-if="display">
            <span v-if="display.path" :class="ui.fieldPath()">
              {{ display.path }}
            </span>

            <span :class="ui.fieldMain()">
              <span v-if="display.code" :class="ui.code()" part="code">
                {{ display.code }}
              </span>

              <span :class="ui.itemLabel()">{{ display.name }}</span>
            </span>
          </template>
        </div>

        <c-icon-button
          v-if="hasSelection && clearable"
          :aria-label="t.clearSelection"
          :class="ui.iconButton()"
          :disabled
          size="x-small"
          text
          @click="onReset"
          @keydown="onButtonKeyDown('reset', $event)"
        >
          <c-icon :path="mdiClose" :size="20" />
        </c-icon-button>

        <c-icon-button
          v-else
          :aria-label="t.toggleOptions"
          :class="ui.chevron()"
          :disabled
          size="x-small"
          text
          @click="onChevronClick"
          @keydown="onButtonKeyDown('chevron', $event)"
        >
          <c-icon :path="mdiChevronDown" :size="24" />
        </c-icon-button>
      </div>
    </c-input>
  </span>

  <!-- Manual popover in the top layer: never clipped by overflow, no teleport,
       no z-index war. Light dismiss and positioning come from
       `useAnchoredPanel`. -->
  <div
    ref="panelRef"
    :class="ui.panel()"
    :style="panelStyle"
    part="panel"
    popover="manual"
    @toggle="onToggle"
  >
    <div ref="cardRef" :class="ui.card()" part="card">
      <div
        :id="`${id}-status`"
        :class="ui.visuallyHidden()"
        aria-atomic="true"
        aria-live="polite"
      >
        {{ statusText }}
      </div>

      <div :class="ui.search()" part="search">
        <svg :class="ui.searchIcon()" aria-hidden="true" viewBox="0 0 24 24">
          <path :d="mdiMagnify" />
        </svg>

        <input
          ref="searchRef"
          :aria-activedescendant="activeDescendantId"
          :aria-controls="`${id}-listbox`"
          :aria-label="t.filterOptions"
          :class="ui.searchInput()"
          :placeholder="placeholder || t.searchPlaceholder"
          :value="query"
          aria-autocomplete="list"
          autocomplete="off"
          type="text"
          @input="onSearchInput"
          @keydown="onSearchKeyDown"
        />
      </div>

      <!-- Breadcrumb: the root crumb plus one crumb per ancestor of the
           browsed level. Crumbs are mouse affordances (`tabindex="-1"`,
           `mousedown.prevent` keeps DOM focus in the search input);
           ArrowLeft / Backspace are the keyboard way up. -->
      <nav
        :aria-label="t.breadcrumb"
        :class="ui.breadcrumb()"
        part="breadcrumb"
      >
        <template v-for="(crumb, i) in crumbs" :key="crumb.key">
          <span v-if="i" :class="ui.crumbSep()" aria-hidden="true">›</span>

          <button
            :aria-current="crumb.current ? 'location' : undefined"
            :class="ui.crumb()"
            :disabled="crumb.current"
            :title="crumb.title"
            part="crumb"
            tabindex="-1"
            type="button"
            @click="goToLevel(crumb.level)"
            @mousedown.prevent
          >
            {{ crumb.name }}
          </button>
        </template>
      </nav>

      <div :class="ui.header()" part="header">
        <template v-if="searchMode">
          <span>{{ t.matches(results.length) }}</span>

          <button
            :class="ui.headerAction()"
            tabindex="-1"
            type="button"
            @click="browseInstead"
            @mousedown.prevent
          >
            {{ t.browse }}
          </button>
        </template>

        <template v-else>
          <span>{{ t.choose(levelLabel(level + 1)) }}</span>

          <span v-if="stepText">{{ stepText }}</span>
        </template>
      </div>

      <!-- `mousedown.prevent` on the list itself too: a press on a disabled
           row (`pointer-events: none`) or on the list padding falls through to
           this `tabindex="-1"` element, which must not take focus from the
           search input. -->
      <ul
        :id="`${id}-listbox`"
        ref="listRef"
        :class="ui.list()"
        part="list"
        role="listbox"
        tabindex="-1"
        @mousedown.prevent
      >
        <!-- Select-branch row (ADR-0047): pinned above the level list inside
             a branch, it commits the branch itself. A `role="option"` like
             the rows, but never an item row — `data-select-branch` keeps it
             out of the peek. -->
        <li
          v-if="selectBranchShown"
          :id="`${id}-select-branch`"
          :aria-selected="currentBranch?.value === committedValue"
          :class="treeSelect({ selectBranch: true }).item()"
          :data-active="isSelectBranchActive || undefined"
          part="select-branch"
          role="option"
          tabindex="-1"
          data-select-branch
          @click="commitCurrentBranch"
          @mousedown.prevent
          @pointermove="activeIndex = SELECT_BRANCH_ROW"
        >
          <span :class="ui.itemLabel()">
            {{ t.select(currentBranch?.name ?? '') }}
          </span>

          <svg
            v-if="currentBranch?.value === committedValue"
            :class="ui.check()"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path :d="mdiCheck" />
          </svg>
        </li>

        <!-- No-results row: an empty level, or a query nothing matches. -->
        <li v-if="!rows.length" :class="ui.info()" part="info">
          <svg :class="ui.infoIcon()" aria-hidden="true" viewBox="0 0 24 24">
            <path :d="mdiAlert" />
          </svg>
          {{ t.noResults }}
        </li>

        <!-- `mousedown.prevent`: a pointer pick must not move DOM focus from
             the search input onto the row — highlighting is virtual. -->
        <li
          v-for="(row, i) in renderedRows"
          :id="`${id}-opt-${i}`"
          :key="`row-${i}`"
          :aria-disabled="row.disabled || undefined"
          :aria-selected="row.item.value === committedValue"
          :class="treeSelect({ disabled: row.disabled }).item()"
          :data-active="i === activeIndex || undefined"
          :title="searchMode ? row.pathText || undefined : undefined"
          part="item"
          role="option"
          tabindex="-1"
          @click="activateRow(row)"
          @mousedown.prevent
          @pointermove="activeIndex = i"
        >
          <span :class="ui.itemMain()">
            <span :class="ui.itemTitle()">
              <span v-if="row.item.code" :class="ui.code()" part="code">
                <template v-for="(seg, j) in row.codeSegments" :key="j">
                  <mark v-if="seg.match" part="match">{{ seg.text }}</mark>

                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>

              <span :class="ui.itemLabel()">
                <template v-for="(seg, j) in row.nameSegments" :key="j">
                  <mark v-if="seg.match" part="match">{{ seg.text }}</mark>

                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
            </span>

            <!-- Search results carry the item's path as a second line. -->
            <span
              v-if="searchMode && row.pathText"
              :class="ui.path()"
              part="path"
            >
              <template v-for="(seg, j) in row.pathSegments" :key="j">
                <mark v-if="seg.match" part="match">{{ seg.text }}</mark>

                <template v-else>{{ seg.text }}</template>
              </template>
            </span>
          </span>

          <span v-if="!searchMode && row.isBranch" :class="ui.meta()">
            {{ t.children(row.item.children?.length ?? 0) }}
          </span>

          <svg
            v-if="!searchMode && row.isBranch"
            :class="ui.rowChevron()"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path :d="mdiChevronRight" />
          </svg>

          <svg
            v-if="row.item.value === committedValue"
            :class="ui.check()"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path :d="mdiCheck" />
          </svg>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import type { CFieldSize } from '../../types';

/**
 * Custom search predicate for `c-tree-select`. Receives the item, the query
 * and the item's ancestors root-first; return `true` to list the item. The
 * default matches the query case-insensitively anywhere in the `name` or
 * `code` of the item or of any of its ancestors.
 */
export type CTreeSelectFilter = (
  item: CTreeSelectItem,
  query: string,
  path: CTreeSelectItem[],
) => boolean;

/**
 * One item of a `c-tree-select` tree. An item with a non-empty `children`
 * array is a branch; any other item is a leaf. Values must be unique across
 * the whole tree.
 */
export interface CTreeSelectItem {
  /** Child items; present and non-empty for a branch. */
  children?: CTreeSelectItem[];
  /**
   * Short code shown before the name and matched by the search (a
   * classification number, say).
   */
  code?: string;
  /**
   * Disable the item: a disabled branch cannot be entered, a disabled leaf
   * cannot be committed.
   */
  disabled?: boolean;
  /** The item's label. */
  name: string;
  /** The item's value, unique across the tree. */
  value: number | string;
}

export interface CTreeSelectProps {
  /**
   * Let a branch be committed as the value: a pinned select-branch row heads
   * every level below the root, and matching branches are listed as search
   * results
   */
  allowBranch?: boolean;
  /**
   * Make the selected value clearable
   */
  clearable?: boolean;
  /**
   * Disable the field
   */
  disabled?: boolean;
  /**
   * Error message shown in place of the hint while the field is invalid
   *
   * @freeform
   */
  errorMessage?: string;
  /**
   * Custom search predicate; receives the item, the query and the item's
   * ancestors. Functions have no attribute form — bind as a DOM property
   */
  filter?: CTreeSelectFilter;
  /**
   * Hide the hint and error messages
   *
   * @defaultable false
   */
  hideDetails?: boolean;
  /**
   * Hint text for the field
   *
   * @freeform
   */
  hint?: string;
  /**
   * Id of the element
   *
   * @freeform
   */
  hostId?: string;
  /**
   * The tree to pick from. Arrays have no attribute form — bind as a DOM
   * property (`:items.prop` in Vue)
   */
  items?: CTreeSelectItem[];
  /**
   * Items per page before the list scrolls
   *
   * @defaultable 6
   */
  itemsPerPage?: number;
  /**
   * Element label
   *
   * @freeform
   */
  label?: string;
  /**
   * Label on top of the field
   *
   * @defaultable false
   */
  labelOnTop?: boolean;
  /**
   * Names of the levels, top level first, shown in the panel header; a
   * missing entry falls back to `texts.level(n)`. Arrays have no attribute
   * form — bind as a DOM property
   */
  levelLabels?: string[];
  /**
   * Input field name
   *
   * @freeform
   */
  name?: string;
  /**
   * Placeholder for the search input inside the panel
   *
   * @freeform
   */
  placeholder?: string;
  /**
   * Set the field as required
   */
  required?: boolean;
  /**
   * Emit the committed item with its path as a `CTreeSelectSelection` instead
   * of its value
   */
  returnObject?: boolean;
  /**
   * Shadow variant
   *
   * @defaultable false
   */
  shadow?: boolean;
  /**
   * Field height: the 44px default or the 36px `small` box
   *
   * @defaultable 'default'
   */
  size?: CFieldSize;
  /**
   * UI text overrides (i18n), merged over the English defaults. Objects have
   * no attribute form — bind as a DOM property (`:texts.prop` in Vue)
   *
   * @defaultable {}
   */
  texts?: CTreeSelectTexts;
  /**
   * Set the validity of the field
   */
  valid?: boolean;
  /**
   * Selected value: the committed item's value, or the `CTreeSelectSelection`
   * with `return-object`; `null` when nothing is selected
   */
  value?: CTreeSelectValue;
}

/**
 * The committed item as emitted with `return-object`: a fresh object — never
 * the `items` entry itself — with its ancestors root-first and without
 * `children`.
 */
export interface CTreeSelectSelection {
  /** The committed item's code, when it has one. */
  code?: string;
  /** The committed item's label. */
  name: string;
  /** The committed item's ancestors, root-first. */
  path: Array<{ code?: string; name: string; value: number | string }>;
  /** The committed item's value. */
  value: number | string;
}

/**
 * UI texts of `c-tree-select`, shallow-merged over the English defaults.
 * Static labels are strings; interpolated ones are functions.
 */
export interface CTreeSelectTexts {
  /** Accessible label of the breadcrumb navigation in the panel. */
  breadcrumb?: string;
  /**
   * Label of the "Browse instead" control shown in the header while a query
   * is typed.
   */
  browse?: string;
  /** Meta text on a branch row; receives its number of children. */
  children?: (count: number) => string;
  /**
   * Header text in browse mode; receives the label of the level being
   * listed.
   */
  choose?: (levelLabel: string) => string;
  /** Accessible label of the clear button. */
  clearSelection?: string;
  /** Accessible label of the search input inside the panel. */
  filterOptions?: string;
  /**
   * Header text of a level whose rows are all leaves in an unevenly deep
   * tree (an evenly deep tree shows the step counter instead).
   */
  final?: string;
  /**
   * Default label of level `n` (1 = the top level) when `level-labels` gives
   * none.
   */
  level?: (n: number) => string;
  /** Header text in search mode; receives the number of matches. */
  matches?: (count: number) => string;
  /** Text of the row shown when nothing is listed. */
  noResults?: string;
  /** Label of the root crumb. */
  root?: string;
  /** Placeholder of the search input when the `placeholder` prop is empty. */
  searchPlaceholder?: string;
  /**
   * Label of the pinned select-branch row; receives the current branch's
   * name.
   */
  select?: (name: string) => string;
  /**
   * Header step counter shown while the tree is evenly deep (every leaf at
   * one level); receives the step and the total number of levels.
   */
  step?: (n: number, total: number) => string;
  /** Accessible label of the chevron button that opens and closes the panel. */
  toggleOptions?: string;
}

/**
 * Selection value of `c-tree-select`: the committed item's value — or a
 * {@link CTreeSelectSelection} with `return-object` — and `null` when
 * cleared.
 */
export type CTreeSelectValue = CTreeSelectSelection | null | number | string;
</script>

<script setup lang="ts">
/**
 * @csspart panel - The top-layer popover container anchored below the field
 * @csspart card - The elevated surface inside the panel holding the search row, the breadcrumb, the header and the list
 * @csspart search - The search-input row at the top of the panel
 * @csspart breadcrumb - The breadcrumb navigation naming the browsed level's path
 * @csspart crumb - One crumb in the breadcrumb: the root crumb, an ancestor, or the collapsed "…" crumb
 * @csspart header - The header line under the breadcrumb: the level to choose and its step counter, or the match count and the "Browse instead" control
 * @csspart list - The scrollable listbox: the level list while browsing, the results while searching
 * @csspart item - One item row in the list
 * @csspart select-branch - The pinned select-branch row at the top of a level list inside a branch (`allow-branch`)
 * @csspart code - An item's code column, in a row and in the closed field
 * @csspart path - The ancestor path line under a search result's label
 * @csspart match - A run of an item's code, label or path equal to the query, in a row; underlined in the primary colour, text inherits the row
 * @csspart info - The no-results row shown when nothing is listed
 */
import {
  mdiAlert,
  mdiCheck,
  mdiChevronDown,
  mdiChevronRight,
  mdiClose,
  mdiMagnify,
} from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed, ref, useHost, useId, useTemplateRef, watch } from 'vue';

import { useAppDefault } from '../../shared/appDefaults';
import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelChange } from '../../shared/emitModelValue';
import { applyPeekCap } from '../../shared/peekCap';
import { type MatchSegment, splitMatches } from '../../shared/splitMatches';
import { useAnchoredPanel } from '../../shared/useAnchoredPanel';
import { useHostEmit } from '../../shared/useHostEmit';
import { useStatusAnnouncer } from '../../shared/useStatusAnnouncer';

/** Events dispatched by `<c-tree-select>`. */
interface CTreeSelectEvents {
  /**
   * Fired when the selection changes — an item is committed or the selection
   * is cleared — carrying the new value: the item's value, the
   * `CTreeSelectSelection` with `return-object`, or `null` when cleared.
   */
  change: CTreeSelectValue;
  /**
   * Fired whenever the query changes — on every keystroke in the search
   * input, and with an empty string when the panel opens. Carries the query
   * string.
   */
  'change:query': string;
  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;
  /**
   * Fired alongside `change` with the same detail — the `v-model` contract.
   */
  'update:value': CTreeSelectValue;
}

/**
 * c-tree-select is a hierarchical value-selection component (CONTEXT.md:
 * "Tree select", ADR-0047): a stepped listbox — one level at a time with a
 * breadcrumb — plus a whole-tree search, in c-autocomplete's field-plus-panel
 * arrangement. Consumer customization is via `::part()`.
 */
const treeSelect = tv({
  defaultVariants: {
    chevronActive: false,
    disabled: false,
    selectBranch: false,
  },
  slots: {
    breadcrumb:
      'flex items-center gap-1 min-h-9 px-3 text-sm overflow-hidden whitespace-nowrap border-b border-solid border-divider',
    card: 'flex flex-col min-w-[180px] max-h-[80vh] overflow-hidden rounded-csc-md bg-surface-overlay shadow-[2px_4px_10px_#00000029]',
    check: 'w-4 h-4 shrink-0 fill-current ml-auto text-primary',
    chevron:
      'aspect-square -mr-1.5 rotate-0 transition-transform duration-300 ease-in-out',
    code: 'shrink-0 tabular-nums text-on-surface-muted',
    content: 'relative flex items-center w-full min-w-0 cursor-pointer',
    crumb:
      'shrink-0 max-w-40 truncate rounded border-0 bg-transparent px-1 py-0.5 text-sm text-link cursor-pointer hover:underline [font-family:var(--c-font-family)] disabled:text-on-surface disabled:font-medium disabled:cursor-default disabled:no-underline',
    crumbSep: 'shrink-0 text-on-surface-muted',
    fieldMain:
      'flex items-center gap-2 min-w-0 text-base leading-5 text-on-surface',
    fieldPath: 'text-xs leading-4 text-on-surface-muted truncate',
    fieldText: 'flex flex-col min-w-0 flex-1 py-1',
    header:
      'flex items-center justify-between gap-2 min-h-8 px-3 pt-2 text-sm text-on-surface-muted',
    headerAction:
      'shrink-0 border-0 bg-transparent p-0 text-sm text-link cursor-pointer hover:underline [font-family:var(--c-font-family)]',
    iconButton: 'aspect-square -mr-1.5',
    info: 'flex items-center flex-nowrap gap-2 text-sm min-h-[42px] px-[10px] w-full cursor-default whitespace-nowrap text-on-surface-muted',
    infoIcon: 'w-[18px] h-[18px] shrink-0 fill-current text-warning',
    // The readonly combobox is visually hidden (clip) but stays focusable and
    // keeps the flattened value for assistive technology.
    input:
      'absolute w-px h-px p-0 m-0 overflow-hidden whitespace-nowrap border-0 [clip:rect(0_0_0_0)] outline-none',
    item: 'flex items-center flex-nowrap gap-3 cursor-pointer text-sm min-h-[42px] outline-none px-[10px] py-2 whitespace-nowrap w-full rounded select-none data-[active]:bg-primary-subtle data-[active]:text-primary data-[active]:ring-1 data-[active]:ring-inset data-[active]:ring-primary text-on-surface',
    itemLabel: 'min-w-0 truncate',
    itemMain: 'flex flex-col min-w-0 flex-auto',
    itemTitle: 'flex items-center gap-2 min-w-0',
    list: 'list-none m-0 mt-1 p-1 outline-none overflow-y-auto scrollbar-hidden w-full overscroll-none',
    meta: 'shrink-0 text-xs text-on-surface-muted',
    panel:
      'fixed m-0 p-0 border-0 bg-transparent overflow-visible [inset:auto]',
    path: 'text-xs leading-4 text-on-surface-muted truncate',
    rowChevron: 'w-4 h-4 shrink-0 fill-current text-on-surface-muted',
    search:
      'flex items-center gap-2 min-h-11 px-3 border-b border-solid border-divider',
    searchIcon: 'w-[18px] h-[18px] shrink-0 fill-current text-on-surface-muted',
    searchInput:
      'bg-transparent border-0 outline-none w-full py-2 text-base leading-5 text-on-surface [font-family:var(--c-font-family)] [caret-color:var(--c-primary)] placeholder:text-on-surface-muted placeholder:opacity-100',
    visuallyHidden:
      'absolute w-px h-px p-0 overflow-hidden border-0 [clip:rect(1px,1px,1px,1px)]',
  },
  variants: {
    chevronActive: { true: { chevron: 'rotate-180' } },
    disabled: {
      true: {
        item: 'cursor-default pointer-events-none bg-on-surface/5 [filter:grayscale(1)_opacity(0.75)] data-[active]:bg-on-surface/5 data-[active]:text-inherit data-[active]:ring-0',
      },
    },
    // The pinned select-branch row (ADR-0047): the select-all row's recipe
    // (ADR-0046) — sticks to the list's top edge on an opaque fill with a
    // hairline below; the list drops its top inset while the row is shown
    // (Chromium sticks inside a scroll container's padding), the row bleeds
    // to the full list width and restores the inset below itself.
    selectBranch: {
      true: {
        item: 'sticky top-0 z-10 -mx-1 mb-1 w-auto px-[14px] rounded-none bg-surface-overlay border-b border-solid border-divider',
        list: 'pt-0',
      },
    },
  },
});

// The two root nodes (anchor wrapper + panel) mean Vue can't auto-inherit
// fallthrough attrs; opt out so `style`/`class`/`v-model` a consumer puts on
// <c-tree-select> stay on the host (which is `display:block`) instead of
// leaking onto an internal node / tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CTreeSelectProps>(), {
  allowBranch: false,
  clearable: false,
  disabled: false,
  errorMessage: '',
  filter: undefined,
  hideDetails: undefined,
  hint: '',
  hostId: '',
  items: () => [],
  itemsPerPage: undefined,
  label: '',
  labelOnTop: undefined,
  levelLabels: undefined,
  name: '',
  placeholder: '',
  required: false,
  returnObject: false,
  shadow: undefined,
  size: undefined,
  texts: undefined,
  valid: true,
  value: null,
});

const host = useHost();

const emit = useHostEmit<CTreeSelectEvents>();

// Defaultable props resolve host attribute → own value → app default →
// built-in (see src/shared/appDefaults.ts).
const appDefault = useAppDefault('c-tree-select', props);

const DEFAULT_TEXTS: Required<CTreeSelectTexts> = {
  breadcrumb: 'Breadcrumb',
  browse: 'Browse instead',
  children: (count) => `${count} options`,
  choose: (levelLabel) => `Choose ${levelLabel}`,
  clearSelection: 'Clear selection',
  filterOptions: 'Filter options',
  final: 'Final level',
  level: (n) => `Level ${n}`,
  matches: (count) => `${count} ${count === 1 ? 'match' : 'matches'}`,
  noResults: 'No matching data',
  root: 'All',
  searchPlaceholder: 'Search...',
  select: (name) => `Select ${name}`,
  step: (n, total) => `Step ${n} of ${total}`,
  toggleOptions: 'Toggle options',
};

const t = appDefault('texts', DEFAULT_TEXTS);

const anchorRef = useTemplateRef<HTMLElement>('anchorRef');

const cardRef = useTemplateRef<HTMLElement>('cardRef');

const cInputRef = useTemplateRef<HTMLElement>('cInputRef');

const fieldRef = useTemplateRef<HTMLInputElement>('fieldRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const searchRef = useTemplateRef<HTMLInputElement>('searchRef');

const listRef = useTemplateRef<HTMLUListElement>('listRef');

// Local mirror of `value` (Vue props are readonly; selection flows out via
// events). The watch keeps it in sync with external v-model updates — and
// must never emit: `emitModelChange` writes `host.value`, which re-enters it.
const value = ref<CTreeSelectValue>(props.value);

watch(
  () => props.value,
  (v) => {
    value.value = v;
  },
);

const query = ref('');

// Single write-path for user-driven query changes so the emission can never
// drift from the state; the panel-open reset emits separately (always).
const setQuery = (next: string) => {
  if (query.value === next) return;

  query.value = next;
  emit('change:query', next);
};

// Search mode while a query is typed; browse mode otherwise. The browsed
// level survives a search untouched, so clearing the query returns to it.
const searchMode = computed(() => query.value.length > 0);

const activeIndex = ref(-1);

// `activeIndex` sentinel for the select-branch row; `-1` stays "no
// highlight". Numeric, so any unhandled site fails closed: `rows[-2]` is
// undefined and no item row's `i` ever equals it.
const SELECT_BRANCH_ROW = -2;

const autoId = useId();

const id = computed(() => props.hostId || autoId);

const inputId = computed(
  () =>
    `input_${(props.hostId || props.label || props.placeholder).replace(
      /[^a-zA-Z0-9-_]/g,
      '',
    )}`,
);

// `hide-details` reaches the inner `c-input` through the `data-hide-details`
// channel — see src/shared/appDefaults.ts for the two defineCustomElement
// quirks behind that and behind the attribute-first resolution.
const hideDetailsResolved = appDefault('hideDetails', false);

const itemsPerPageResolved = appDefault('itemsPerPage', 6);

const labelOnTopResolved = appDefault('labelOnTop', false);

const shadowResolved = appDefault('shadow', false);

const sizeResolved = appDefault('size', 'default');

// Same defineCustomElement Boolean-attribute quirk as `hide-details`: resolve
// `allow-branch` from the stable host attribute first.
const allowBranchOn = computed(() =>
  host?.hasAttribute('allow-branch')
    ? coerceBoolean(host.getAttribute('allow-branch'))
    : coerceBoolean(props.allowBranch),
);

const ui = computed(() => treeSelect({ chevronActive: isOpen.value }));

// ---- tree index ---------------------------------------------------------

// One preorder pass per `items` assignment. `terms` holds the lowercased
// name and code of the item AND of every ancestor, so the per-keystroke
// filter is a flat scan with no tree walk; `rootLeafDepth` (the tree's
// depth when every leaf sits at one level, else `null`) drives the header's
// step counter.
type Entry = {
  depth: number;
  disabled: boolean;
  isBranch: boolean;
  item: CTreeSelectItem;
  path: CTreeSelectItem[];
  terms: string[];
};

type Index = {
  byItem: Map<CTreeSelectItem, Entry>;
  byValue: Map<number | string, Entry>;
  flat: Entry[];
  rootLeafDepth: null | number;
};

const isBranchItem = (item: CTreeSelectItem) => !!item.children?.length;

const buildIndex = (items: CTreeSelectItem[]): Index => {
  const byItem = new Map<CTreeSelectItem, Entry>();

  const byValue = new Map<number | string, Entry>();

  const flat: Entry[] = [];

  // Returns the uniform `leafDepth` of the listed items, `null` when uneven.
  const walk = (
    list: CTreeSelectItem[],
    path: CTreeSelectItem[],
    ancestorDisabled: boolean,
    ancestorTerms: string[],
  ): null | number => {
    let uniform: null | number | undefined;

    for (const item of list) {
      const isBranch = isBranchItem(item);

      const disabled = ancestorDisabled || !!item.disabled;

      const terms = [...ancestorTerms, item.name.toLowerCase()];

      if (item.code) terms.push(item.code.toLowerCase());

      const entry: Entry = {
        depth: path.length + 1,
        disabled,
        isBranch,
        item,
        path,
        terms,
      };

      flat.push(entry);
      byItem.set(item, entry);

      // First occurrence wins: values are unique by contract.
      if (!byValue.has(item.value)) byValue.set(item.value, entry);

      // Levels below this item until its leaves, when uniform (a leaf: 0).
      let leafDepth: null | number = 0;

      if (isBranch) {
        const below = walk(item.children!, [...path, item], disabled, terms);

        leafDepth = below === null ? null : below + 1;
      }

      if (uniform === undefined) uniform = leafDepth;
      else if (uniform !== leafDepth) uniform = null;
    }

    return uniform ?? null;
  };

  const rootUniform = walk(items, [], false, []);

  return {
    byItem,
    byValue,
    flat,
    rootLeafDepth: rootUniform === null ? null : rootUniform + 1,
  };
};

const index = computed(() => buildIndex(props.items ?? []));

// ---- browsed level ------------------------------------------------------

// The browsed level as ancestor VALUES (root-first), not item references:
// consumers re-assign `items`, and values are unique by contract. `path`
// re-resolves them against the current tree and self-clamps when an
// ancestor vanished.
const pathValues = ref<(number | string)[]>([]);

const path = computed<CTreeSelectItem[]>(() => {
  const out: CTreeSelectItem[] = [];

  let list = props.items ?? [];

  for (const v of pathValues.value) {
    const item = list.find((i) => i.value === v);

    if (!item || !isBranchItem(item)) break;

    out.push(item);
    list = item.children!;
  }

  return out;
});

const level = computed(() => path.value.length);

const currentBranch = computed(() => path.value.at(-1) ?? null);

const levelItems = computed(
  () => currentBranch.value?.children ?? props.items ?? [],
);

const levelLabel = (n: number) =>
  props.levelLabels?.[n - 1] ?? t.value.level(n);

// Header step counter: only while the whole tree is evenly deep (every leaf
// at one level), so the total never shifts as the user browses; in an
// unevenly deep tree the counter is left out and an all-leaf level says
// "final" instead.
const stepText = computed(() => {
  const total = index.value.rootLeafDepth;

  if (total !== null) return t.value.step(level.value + 1, total);

  return levelItems.value.length &&
    levelItems.value.every((item) => !isBranchItem(item))
    ? t.value.final
    : '';
});

// ---- rows ---------------------------------------------------------------

const defaultFilter = (entry: Entry, q: string) =>
  entry.terms.some((term) => term.includes(q));

// Search results: every item of the whole tree the query matches — leaves,
// plus branches under `allow-branch`. Descendants of a disabled branch are
// listed disabled (they cannot be reached by browsing either).
const results = computed<Entry[]>(() => {
  if (!searchMode.value) return [];

  const raw = query.value;

  const q = raw.toLowerCase();

  const custom = props.filter;

  return index.value.flat.filter(
    (e) =>
      (allowBranchOn.value || !e.isBranch) &&
      (custom ? custom(e.item, raw, e.path) : defaultFilter(e, q)),
  );
});

const rows = computed<Entry[]>(() =>
  searchMode.value
    ? results.value
    : levelItems.value.map(
        (item) =>
          index.value.byItem.get(item) ?? {
            depth: level.value + 1,
            disabled: !!item.disabled,
            isBranch: isBranchItem(item),
            item,
            path: path.value,
            terms: [],
          },
      ),
);

type RenderedRow = {
  codeSegments: MatchSegment[];
  nameSegments: MatchSegment[];
  pathSegments: MatchSegment[];
  pathText: string;
} & Entry;

const joinPath = (items: { name: string }[]) =>
  items.map((p) => p.name).join(' › ');

// The rows as drawn: `rows` positionally (row ids, `activeIndex` and the cap
// watcher stay keyed on that array) plus the match marking for the current
// query. A computed, not a template method: the list re-renders on every
// `pointermove`.
const renderedRows = computed<RenderedRow[]>(() => {
  const q = query.value;

  return rows.value.map((e) => {
    const pathText = searchMode.value ? joinPath(e.path) : '';

    return {
      ...e,
      codeSegments: splitMatches(e.item.code ?? '', q),
      nameSegments: splitMatches(e.item.name, q),
      pathSegments: splitMatches(pathText, q),
      pathText,
    };
  });
});

const selectBranchShown = computed(
  () => !searchMode.value && allowBranchOn.value && !!currentBranch.value,
);

const isSelectBranchActive = computed(
  () => activeIndex.value === SELECT_BRANCH_ROW,
);

const activeDescendantId = computed(() => {
  if (isSelectBranchActive.value) return `${id.value}-select-branch`;

  return activeIndex.value >= 0
    ? `${id.value}-opt-${activeIndex.value}`
    : undefined;
});

// Where the highlight lands by default: the first enabled row — never the
// select-branch row, so "type, Enter" still picks one match.
const firstEnabledIndex = () => rows.value.findIndex((r) => !r.disabled);

// ---- breadcrumb ---------------------------------------------------------

type Crumb = {
  current: boolean;
  key: string;
  level: number;
  name: string;
  title?: string;
};

// The root crumb plus one crumb per ancestor. Beyond four crumbs the middle
// ones collapse into a single "…" crumb (its `title` lists them) that jumps
// to the deepest hidden level.
const crumbs = computed<Crumb[]>(() => {
  const all: Crumb[] = [
    { current: level.value === 0, key: 'root', level: 0, name: t.value.root },
    ...path.value.map((item, i) => ({
      current: i === path.value.length - 1,
      key: `${i}-${String(item.value)}`,
      level: i + 1,
      name: item.name,
    })),
  ];

  if (all.length <= 4) return all;

  const hidden = all.slice(1, -2);

  return [
    all[0],
    {
      current: false,
      key: 'collapsed',
      level: hidden[hidden.length - 1].level,
      name: '…',
      title: hidden.map((c) => c.name).join(' › '),
    },
    ...all.slice(-2),
  ];
});

// ---- committed value ----------------------------------------------------

// The scalar identity of a value: `return-object` selections compare by
// their `.value`. The empty string means "nothing committed": Vue's `v-model`
// on a custom element writes `el.value = ''` for a `null` model (vModelText),
// and the sibling fields read it the same way.
const valueOf = (v: CTreeSelectValue): null | number | string => {
  const scalar = typeof v === 'object' && v !== null ? v.value : v;

  return scalar === '' ? null : (scalar ?? null);
};

const committedValue = computed(() => valueOf(value.value));

const committedEntry = computed(() =>
  committedValue.value == null
    ? undefined
    : index.value.byValue.get(committedValue.value),
);

const hasSelection = computed(() => committedValue.value != null);

// The selection remembered at commit time (ADR-0029 pattern): an `items`
// swap that no longer contains the committed item must not blank the field.
const committedSelection = ref<CTreeSelectSelection | null>(null);

type Display = { code?: string; name: string; path: string };

// Display resolution chain: the current tree → the selection remembered at
// commit → the object value's own fields → the raw value.
const display = computed<Display | null>(() => {
  const v = committedValue.value;

  if (v == null) return null;

  const entry = committedEntry.value;

  if (entry) {
    return {
      code: entry.item.code,
      name: entry.item.name,
      path: joinPath(entry.path),
    };
  }

  const remembered = committedSelection.value;

  if (remembered && remembered.value === v) {
    return {
      code: remembered.code,
      name: remembered.name,
      path: joinPath(remembered.path),
    };
  }

  const raw = value.value;

  if (raw && typeof raw === 'object') {
    return { code: raw.code, name: raw.name, path: joinPath(raw.path) };
  }

  return { name: String(v), path: '' };
});

// What the readonly combobox holds: the flattened "path › code label".
const inputValue = computed(() => {
  const d = display.value;

  if (!d) return '';

  const main = [d.code, d.name].filter(Boolean).join(' ');

  return d.path ? `${d.path} › ${main}` : main;
});

// ---- status text (aria-live) --------------------------------------------

const { announce: announceStatus, text: statusText } = useStatusAnnouncer();

// Composed when the debounce fires, so it reads the state current then. Built
// from `texts` only, so it follows the consumer's language.
const updateStatusText = () =>
  announceStatus(() => {
    if (!rows.value.length) return t.value.noResults;

    if (searchMode.value) return t.value.matches(rows.value.length);

    return [t.value.choose(levelLabel(level.value + 1)), stepText.value]
      .filter(Boolean)
      .join(', ');
  });

// ---- peek cap (ADR-0043) -------------------------------------------------

// The list hides its scrollbar, so when it overflows it must end on a
// half-visible row — the peek: `itemsPerPage` full rows first, and never past
// what the card's `max-h-[80vh]` leaves under the search row, breadcrumb and
// header. Measured from the real rows; the pinned select-branch row is not
// one of them.
const applyListCap = () => {
  const list = listRef.value;

  const card = cardRef.value;

  if (!list || !card) return;

  const cardMax = parseFloat(getComputedStyle(card).maxHeight);

  const above =
    list.getBoundingClientRect().top - card.getBoundingClientRect().top;

  applyPeekCap(list, {
    ceiling: Number.isFinite(cardMax) ? cardMax - above : Infinity,
    itemsPerPage: itemsPerPageResolved.value,
    rows: Array.from(
      list.querySelectorAll<HTMLElement>(
        'li[role="option"]:not([data-select-branch])',
      ),
    ),
  });
};

// ---- highlight ----------------------------------------------------------

const scrollActiveIntoView = () => {
  // The select-branch row is pinned: always in view.
  if (isSelectBranchActive.value) return;

  requestAnimationFrame(() => {
    const li = listRef.value?.querySelector(
      `#${CSS.escape(`${id.value}-opt-${activeIndex.value}`)}`,
    ) as HTMLElement | null;
    li?.scrollIntoView({ block: 'nearest' });
  });
};

// Land the highlight on `preferred` (an item value) when it is an enabled
// row of the current list, else on the first enabled row.
const settleHighlight = (preferred?: null | number | string) => {
  const idx =
    preferred == null
      ? -1
      : rows.value.findIndex((r) => r.item.value === preferred && !r.disabled);

  activeIndex.value = idx >= 0 ? idx : firstEnabledIndex();
  scrollActiveIntoView();
  updateStatusText();
};

// Arrow navigation over the enabled rows, wrapping at both ends. The
// select-branch row is the topmost row of that cycle; from "none" the
// highlight lands on the first item row, never on the pinned row.
const moveActive = (dir: -1 | 1) => {
  const order = [
    ...(selectBranchShown.value ? [SELECT_BRANCH_ROW] : []),
    ...rows.value.flatMap((r, i) => (r.disabled ? [] : [i])),
  ];

  if (!order.length) return;

  const pos = order.indexOf(activeIndex.value);

  if (pos < 0) {
    activeIndex.value =
      dir === 1
        ? (order.find((i) => i !== SELECT_BRANCH_ROW) ?? order[0])
        : order[order.length - 1];
  } else {
    activeIndex.value = order[(pos + dir + order.length) % order.length];
  }

  scrollActiveIntoView();
};

// ---- navigation ---------------------------------------------------------

const goToLevel = (target: number, preferred?: null | number | string) => {
  pathValues.value = path.value.slice(0, target).map((p) => p.value);

  if (listRef.value) listRef.value.scrollTop = 0;

  settleHighlight(preferred);
};

const descend = (item: CTreeSelectItem) => {
  pathValues.value = [...path.value.map((p) => p.value), item.value];

  if (listRef.value) listRef.value.scrollTop = 0;

  settleHighlight();
};

// Up one level, highlighting the branch just left.
const goUp = () => {
  if (!level.value) return;

  goToLevel(level.value - 1, currentBranch.value?.value);
};

const browseInstead = () => {
  setQuery('');

  if (searchRef.value) searchRef.value.value = '';

  searchRef.value?.focus();
  settleHighlight(committedValue.value);
};

// ---- commit -------------------------------------------------------------

const toPathItem = ({ code, name, value: v }: CTreeSelectItem) =>
  code == null ? { name, value: v } : { code, name, value: v };

const commit = (item: CTreeSelectItem, ancestors: CTreeSelectItem[]) => {
  const selection: CTreeSelectSelection = {
    ...(item.code == null ? {} : { code: item.code }),
    name: item.name,
    path: ancestors.map(toPathItem),
    value: item.value,
  };

  const next: CTreeSelectValue = props.returnObject ? selection : item.value;

  value.value = next;
  committedSelection.value = selection;
  emitModelChange(host, next);
};

// Every row has exactly one action: a branch descends while browsing, a
// leaf — or a branch listed as a search result — commits and closes.
const activateRow = (row: Entry | undefined) => {
  if (!row || row.disabled) return;

  if (row.isBranch && !searchMode.value) {
    descend(row.item);

    return;
  }

  commit(row.item, row.path);
  closePanel(true);
};

const commitCurrentBranch = () => {
  const branch = currentBranch.value;

  if (!branch) return;

  commit(branch, path.value.slice(0, -1));
  closePanel(true);
};

const onReset = (event?: Event) => {
  event?.stopPropagation();

  value.value = null;
  committedSelection.value = null;
  setQuery('');
  emitModelChange(host, null);

  fieldRef.value?.focus();
};

// ---- open / close -------------------------------------------------------

// The anchored-panel lifecycle (anchor + popover + light dismiss + focus
// return) is the shared composable; the hooks run synchronously inside the
// native `toggle` handler, so `change:query` still fires within that event.
const {
  anchorStyle,
  close: closePanel,
  isOpen,
  onToggle,
  open: openPanel,
  panelStyle,
} = useAnchoredPanel({
  anchor: anchorRef,
  disabled: () => props.disabled,
  field: cInputRef,
  host,
  onClosed: () => {
    activeIndex.value = -1;
  },
  onOpened: () => {
    // Reset the query and tell the consumer — always, even when it was
    // already empty (the shared search-input contract, ADR-0029).
    query.value = '';
    emit('change:query', '');

    // Reopen at the committed item's parent level (the root when nothing is
    // committed), with the committed row highlighted.
    pathValues.value = committedEntry.value?.path.map((p) => p.value) ?? [];

    requestAnimationFrame(() => {
      applyListCap();
      searchRef.value?.focus();
      settleHighlight(committedValue.value);
    });
  },
  panel: panelRef,
  returnFocusTo: fieldRef,
});

// ---- keyboard / interaction ---------------------------------------------

const onFieldClick = () => {
  if (props.disabled) return;

  if (isOpen.value) closePanel(false);
  else openPanel();
};

const onChevronClick = (event: Event) => {
  event.stopPropagation();

  if (isOpen.value) closePanel(false);
  else openPanel();
};

const onButtonKeyDown = (src: 'chevron' | 'reset', event: KeyboardEvent) => {
  event.stopPropagation();

  if (event.key !== 'Tab') event.preventDefault();

  if ([' ', 'Enter'].includes(event.key)) {
    if (src === 'chevron') {
      if (isOpen.value) closePanel(true);
      else openPanel();

      return;
    }

    onReset(event);
  }
};

const onFieldKeyDown = (event: KeyboardEvent) => {
  if (props.disabled || isOpen.value) return;

  if ([' ', 'ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
    event.preventDefault();
    openPanel();

    return;
  }

  // A printable character opens the panel and seeds the search input.
  if (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  ) {
    openPanel();
    requestAnimationFrame(() => {
      setQuery(event.key);

      if (searchRef.value) searchRef.value.value = event.key;

      settleHighlight();
    });
  }
};

const onSearchInput = (event: Event) => {
  setQuery((event.target as HTMLInputElement).value);
  // Re-seed the highlight so Enter selects something sensible and the
  // aria-activedescendant stays valid — on the first match, or back on the
  // committed row when the query was cleared.
  requestAnimationFrame(() =>
    settleHighlight(searchMode.value ? null : committedValue.value),
  );
};

const onSearchKeyDown = (event: KeyboardEvent) => {
  const browsing = !searchMode.value;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      moveActive(1);

      break;

    case 'ArrowLeft':
      // With an empty query the caret has nowhere to go: climb one level.
      if (browsing && level.value) {
        event.preventDefault();
        goUp();
      }

      break;

    case 'ArrowRight': {
      if (!browsing) break;

      const row = rows.value[activeIndex.value];

      if (row?.isBranch && !row.disabled) {
        event.preventDefault();
        descend(row.item);
      }

      break;
    }

    case 'ArrowUp':
      event.preventDefault();
      moveActive(-1);

      break;

    case 'Backspace':
      // Nothing to delete: climb one level, like a file browser.
      if (browsing && level.value) {
        event.preventDefault();
        goUp();
      }

      break;

    case 'End': {
      event.preventDefault();

      for (let i = rows.value.length - 1; i >= 0; i--) {
        if (!rows.value[i].disabled) {
          activeIndex.value = i;

          break;
        }
      }

      scrollActiveIntoView();

      break;
    }

    case 'Enter': {
      event.preventDefault();

      if (isSelectBranchActive.value) {
        commitCurrentBranch();

        break;
      }

      activateRow(rows.value[activeIndex.value]);

      break;
    }

    case 'Escape':
      event.preventDefault();
      closePanel(true);

      break;

    case 'Home':
      event.preventDefault();
      activeIndex.value = selectBranchShown.value
        ? SELECT_BRANCH_ROW
        : firstEnabledIndex();
      scrollActiveIntoView();

      break;

    case 'Tab':
      closePanel(false);

      break;
  }
};

// ---- watchers -----------------------------------------------------------

// Re-cap when the row set or the page size changes. Deferred a frame: a
// `flush: 'post'` watcher still runs ahead of the row patch inside a custom
// element and would measure the outgoing rows.
let capFrame = 0;

watch([rows, itemsPerPageResolved], () => {
  if (!isOpen.value) return;

  cancelAnimationFrame(capFrame);
  capFrame = requestAnimationFrame(() => {
    capFrame = 0;
    applyListCap();
  });
});

// `items` re-assigned while open: `path` has already clamped itself; keep
// the virtual highlight (`aria-activedescendant`) on a live enabled row and
// re-announce.
watch(index, () => {
  if (!isOpen.value) return;

  if (isSelectBranchActive.value && !selectBranchShown.value) {
    settleHighlight();

    return;
  }

  const active = rows.value[activeIndex.value];

  if (!isSelectBranchActive.value && (!active || active.disabled)) {
    settleHighlight();
  } else {
    updateStatusText();
  }
});

// Arriving on (or leaving) the select-branch row re-announces the level.
watch(activeIndex, (now, before) => {
  if (now === SELECT_BRANCH_ROW || before === SELECT_BRANCH_ROW) {
    updateStatusText();
  }
});
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. The field row, panel, card, breadcrumb, list and item recipes live
  in the `tv` config above. What remains, tokens-only:
    - `:host{display:block}` — the field is a real box (overrides the global
      `:host{display:contents}`).
    - `[part='panel'] position-try-fallbacks` — native flip/shift when the
      preferred placement lacks room (the `position-area` is set inline by
      `useAnchoredPanel`); an at-rule-adjacent syntax with no utility
      equivalent. This block is the per-shadow-root half of that
      composable's contract and stays identical in every consumer
      (c-autocomplete).
    - the popover open animation keyframe.
    - `[part='match']` — the match marking around the query in a row's code,
      label or path; the UA `mark` default (black on yellow) is unreadable in
      dark mode.
-->
<style>
:host {
  display: block;
}

/* When flipped above the field the message-area offset (a negative
 * margin-top set inline) must not apply: the panel's bottom edge then meets
 * the anchor's top edge, which IS the field's top. */
@position-try --c-field-panel-above {
  position-area: top span-right;
  margin-top: 0;
}

@position-try --c-field-panel-above-left {
  position-area: top span-left;
  margin-top: 0;
}

[part='panel'] {
  position-try-fallbacks:
    --c-field-panel-above, flip-inline, --c-field-panel-above-left;
}

[part='panel']:popover-open {
  animation: c-tree-select-fade-in 0.12s ease-out;
}

/* Match marking (ADR-0045): the runs of a code, label or path equal to the
 * query. Text colour and background follow the row; the underline is the
 * primary token, so it tracks the theme. A decoration rather than a
 * box-shadow: it survives `overflow: hidden` and forced-colors mode. */
[part='match'] {
  background: transparent;
  color: inherit;
  text-decoration: underline 2px var(--c-primary);
  text-decoration-skip-ink: none;
  text-underline-offset: 0.15em;
}

@keyframes c-tree-select-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
