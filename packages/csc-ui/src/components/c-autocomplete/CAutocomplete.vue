<template>
  <!-- Anchor wrapper: a shadow-DOM box around the value field. CSS anchor
       names are tree-scoped, so the anchor must live in the same shadow root
       as the panel. It carries `anchor-name`; the panel references
       it, and it is the rect we measure to pin the panel width. -->
  <span
    ref="anchorRef"
    class="block w-full"
    style="anchor-name: --c-autocomplete-anchor"
  >
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
      :label-on-top
      :required
      :shadow
      :size
      :valid
      @click="onFieldClick"
    >
      <span v-if="hasConsumerPre" slot="pre" style="display: contents">
        <slot name="pre" />
      </span>

      <div :class="ui.content()" class="c-input__content">
        <!-- The readonly combobox stays first in DOM order: in `multiple`
             mode it is visually hidden behind the tag row (clip, never
             display:none — it must keep taking focus) while its value carries
             the whole selection for assistive technology. -->
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

        <!-- `multiple` mode: one closeable tag per picked option, in pick
             order, folded by `max-tags`. The tag label is hidden from AT (the
             combobox value already reads it); the close button is the tag's
             only accessible — and focusable — control. -->
        <div
          v-if="tagsShown"
          :class="ui.tags()"
          part="tags"
          @click="onTagsClick"
        >
          <c-tag
            v-for="opt in visibleTags"
            :key="String(opt.value)"
            :close-label="t.remove(opt.label)"
            :size
            class="max-w-full"
            exportparts="root:tag-root"
            part="tag"
            closeable
            @close="removeValue(opt.value)"
          >
            <span :class="ui.tagLabel()" aria-hidden="true">
              {{ opt.label }}
            </span>
          </c-tag>

          <c-tag v-if="hiddenCount" :size aria-hidden="true" part="tag" flat>
            {{ t.more(hiddenCount) }}
          </c-tag>
        </div>

        <c-spinner v-if="loading" :size="20" color="var(--c-primary)" />

        <c-icon-button
          v-else-if="hasSelection && clearable"
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

        <!-- Consumer's <c-option> elements: data source only, hidden via the
             `.c-input__content slot { display: none }` escape-hatch rule. The
             panel renders the filtered set; we read the originals through
             host.querySelectorAll. -->
        <slot />
      </div>

      <span v-if="hasConsumerPost" slot="post" style="display: contents">
        <slot name="post" />
      </span>
    </c-input>
  </span>

  <!-- Manual popover in the top layer: never clipped by overflow, no teleport,
       no z-index war. Light-dismiss is handled below (manual, so we control
       exactly when it closes). Positioned with CSS anchor positioning. -->
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
          :aria-activedescendant="
            activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined
          "
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

      <ul
        :id="`${id}-listbox`"
        ref="listRef"
        :aria-multiselectable="multipleOn ? 'true' : undefined"
        :class="ui.list()"
        part="list"
        role="listbox"
        tabindex="-1"
      >
        <!-- Loading row: only while fetching with nothing to show — options
             already on screen stay rendered during a refresh (no flicker). -->
        <li
          v-if="loading && !filteredOptions.length"
          :class="ui.info()"
          part="info"
        >
          <c-spinner :size="18" color="var(--c-primary)" />
          {{ t.loading }}
        </li>

        <!-- No-results row: only when a query is entered and nothing matches. -->
        <li
          v-else-if="query && !filteredOptions.length"
          :class="ui.info()"
          part="info"
        >
          <svg :class="ui.infoIcon()" aria-hidden="true" viewBox="0 0 24 24">
            <path :d="mdiAlert" />
          </svg>
          {{ t.noResults }}
        </li>

        <!-- `mousedown.prevent`: a pointer pick must not move DOM focus from
             the search input onto the row — highlighting is virtual. -->
        <li
          v-for="(opt, i) in renderedOptions"
          :id="`${id}-opt-${i}`"
          :key="`opt-${i}`"
          :aria-disabled="opt.disabled || undefined"
          :aria-selected="isSelected(opt)"
          :class="[
            autocomplete({ disabled: !!opt.disabled }).item(),
            i === activeIndex ? 'c-autocomplete__item--active' : '',
          ]"
          :data-active="i === activeIndex || undefined"
          part="item"
          role="option"
          tabindex="-1"
          @click="onSelect(opt)"
          @mousedown.prevent
          @pointermove="activeIndex = i"
        >
          <selection-indicator
            v-if="multipleOn"
            :checked="isSelected(opt)"
            :disabled="opt.disabled"
            class="relative"
          />

          <span v-if="opt.html" :class="ui.itemLabel()" v-html="opt.html" />

          <!-- `items` rows: the label as plain runs and `<mark part="match">`
               runs. This static `part="match"` is the one the analyzer sees
               (the slotted rows' marks are built in JS), so it carries the
               `@csspart match` contract for both paths. -->
          <span v-else :class="ui.itemLabel()">
            <template v-for="(seg, j) in opt.segments ?? []" :key="j">
              <mark v-if="seg.match" part="match">{{ seg.text }}</mark>

              <template v-else>{{ seg.text }}</template>
            </template>
          </span>

          <svg
            v-if="!multipleOn && isSelected(opt)"
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
import type { CFieldSize, CSelectItem } from '../../types';

/**
 * Custom filter predicate for `c-autocomplete`. Return `true` to keep the
 * option for the current query. The default matches the start of the label.
 */
export type CAutocompleteFilter = (
  option: CAutocompleteOption,
  query: string,
) => boolean;

/**
 * A `c-autocomplete` item. Identical shape to {@link CSelectItem}; aliased for
 * a name that reads naturally at the autocomplete call site.
 */
export type CAutocompleteItem = CSelectItem;

/**
 * The normalized option handed to a `c-autocomplete` `filter` predicate. `label`
 * is the option's `name` (or its trimmed text content when authored as a
 * slotted `<c-option>`).
 */
export interface CAutocompleteOption {
  /** Whether the option is disabled. */
  disabled: boolean;
  /**
   * The option's label: its `name`, else the text of its `c-option-value`,
   * else its whole text content (for an `items` entry, its `name`).
   */
  label: string;
  /** The option's value. */
  value: number | string;
}

export interface CAutocompleteProps {
  /** Make the selected value clearable */
  clearable?: boolean;
  /** Disable the input */
  disabled?: boolean;
  /**
   * Error message shown in place of the hint while the autocomplete is invalid
   *
   * @freeform
   */
  errorMessage?: string;
  /**
   * The consumer owns filtering: the component renders its options verbatim
   * and only emits `change:query` as the user types. Pair with `loading` and
   * an async data source feeding `items`
   */
  external?: boolean;
  /** Custom filter predicate; receives a normalized option + the query. Ignored when `external` is set */
  filter?: CAutocompleteFilter;
  /** Hide the hint and error messages */
  hideDetails?: boolean;
  /**
   * Hint text for the input
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
  /** Dropdown items (when not using <c-option> elements) */
  items?: CAutocompleteItem[];
  /** Items per page before the list scrolls */
  itemsPerPage?: number;
  /**
   * Element label
   *
   * @freeform
   */
  label?: string;
  /** Label on top of the input */
  labelOnTop?: boolean;
  /** Show loading state */
  loading?: boolean;
  /**
   * In `multiple` mode, show at most this many selected-value tags and fold
   * the rest into one "+N more" tag; `0` shows no tags and reads "N selected"
   * instead; unset shows every tag
   */
  maxTags?: number;
  /**
   * Allow selecting several options: rows toggle, the panel stays open and
   * keeps its query, `value` becomes an array of the selected values (items
   * with `return-object`) in the order they were picked, and the picks show
   * as tags inside the field. Arrays have no attribute form — bind `value` as
   * a DOM property
   */
  multiple?: boolean;
  /**
   * Input field name
   *
   * @freeform
   */
  name?: string;
  /**
   * Placeholder for the in-panel search input
   *
   * @freeform
   */
  placeholder?: string;
  /** Set the autocomplete as required */
  required?: boolean;
  /** Return object instead of value */
  returnObject?: boolean;
  /** Shadow variant */
  shadow?: boolean;
  /** Field height: the 44px default or the 36px `small` box */
  size?: CFieldSize;
  /**
   * UI text overrides (i18n), merged over the English defaults. Objects have
   * no attribute form — bind as a DOM property (`:texts.prop` in Vue)
   */
  texts?: CAutocompleteTexts;
  /** Set the validity of the input */
  valid?: boolean;
  /**
   * Selected value: the option's value, or the whole item with
   * `return-object`; an array of them in `multiple` mode
   */
  value?: CAutocompleteValue;
}

/**
 * UI texts of `c-autocomplete`, shallow-merged over the English defaults.
 * Static labels are strings; count- or label-interpolated ones are
 * functions.
 */
export interface CAutocompleteTexts {
  /** Accessible label of the clear button. */
  clearSelection?: string;
  /** Accessible label of the search input inside the panel. */
  filterOptions?: string;
  /** Text of the loading row shown while `loading` with nothing to list. */
  loading?: string;
  /**
   * Text of the overflow tag when `max-tags` folds the selection; receives the
   * number of hidden tags.
   */
  more?: (count: number) => string;
  /** Text of the row shown when the query matches no options. */
  noResults?: string;
  /** Accessible label of a tag's remove button; receives the option label. */
  remove?: (label: string) => string;
  /** Placeholder of the search input when the `placeholder` prop is empty. */
  searchPlaceholder?: string;
  /**
   * Field text when `max-tags="0"` shows no tags; receives the selection
   * count.
   */
  selected?: (count: number) => string;
  /** Accessible label of the chevron button that opens and closes the panel. */
  toggleOptions?: string;
}

/**
 * Selection value of `c-autocomplete`: the committed option's value — or the
 * whole `{ name, value }` item with `return-object` — and `null` when
 * cleared. In `multiple` mode an array of them in the order they were
 * picked, `[]` when empty.
 */
export type CAutocompleteValue =
  | (number | string)[]
  | CAutocompleteItem
  | CAutocompleteItem[]
  | null
  | number
  | string;
</script>

<script setup lang="ts">
/**
 * @slot pre - Content placed before the value field inside the input row
 * @slot default - The c-option elements used as the data source (never rendered in place)
 * @slot post - Content placed after the value field inside the input row
 *
 * @csspart panel - The top-layer popover container anchored below the field
 * @csspart card - The elevated surface inside the panel holding the search row and the list
 * @csspart search - The search-input row at the top of the panel
 * @csspart list - The scrollable options listbox
 * @csspart item - One option row in the list
 * @csspart indicator - The decorative checkbox box on an option row in `multiple` mode; border, fill and glyph draw with `currentColor`, so `color` recolours them together (the c-checkbox recipe)
 * @csspart mark - The check glyph inside a row indicator; draws with `currentColor`
 * @csspart match - A run of an option's label equal to the query, in the row; underlined in the primary colour, text inherits the row
 * @csspart info - The info row: loading while `loading` with an empty list, otherwise no-results when the query matches no options
 * @csspart tags - The row of selected-value tags inside the field (`multiple` mode)
 * @csspart tag - One selected-value tag: the `c-tag` host, including the overflow tag
 * @csspart tag-root - The pill box inside each tag (the `c-tag` `root` part), for colours and borders
 *
 * @subcomponents c-option, c-option-value
 */
import {
  mdiAlert,
  mdiCheck,
  mdiChevronDown,
  mdiClose,
  mdiMagnify,
} from '@mdi/js';
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
} from 'vue';

import { ensureAnchorPositioning } from '../../shared/anchorPolyfill';
import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelValue } from '../../shared/emitModelValue';
import { optionLabel, optionValueElement } from '../../shared/optionLabel';
import { applyPeekCap } from '../../shared/peekCap';
import SelectionIndicator from '../../shared/SelectionIndicator.vue';
import { type MatchSegment, splitMatches } from '../../shared/splitMatches';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-autocomplete>`. */
interface CAutocompleteEvents {
  /**
   * Native change event (no detail) dispatched whenever a selection is
   * committed or cleared; bubbles through the shadow boundary for
   * form-style listeners.
   */
  change: void;
  /**
   * Fired whenever the query changes — on every keystroke in the search
   * input, and with an empty string when the panel opens. Carries the query
   * string. With `external`, drive your data source from this (debounce on
   * your side) and feed the results back via `items`.
   */
  'change:query': string;
  /**
   * Fired when the selected value changes (an option is committed or the
   * selection is cleared), carrying the new value — the option's value, or
   * the whole `{ name, value }` item when `return-object` is set; `null`
   * when cleared. In `multiple` mode the whole array of picked values, in
   * pick order (`[]` when cleared).
   */
  changeValue: CAutocompleteValue;
  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;
  /**
   * Fired alongside `changeValue` with the same detail — the `v-model`
   * contract.
   */
  'update:value': CAutocompleteValue;
}

/**
 * c-autocomplete is a filterable value-selection component (CONTEXT.md:
 * "Autocomplete"). Unlike c-select it is NOT built on c-dropdown:
 * a readonly c-input value field stays in place and a popover panel below it
 * (Popover API + CSS anchor positioning, the c-menu mechanism) holds a
 * dedicated SEARCH INPUT above the options. v-model binds the selected value
 * (scalar, or {name,value} with return-object); the query is internal,
 * client-side state filtered through the `filter` predicate — or, with
 * `external` (ADR-0029), forwarded to the consumer via `change:query` while
 * the options render verbatim.
 *
 * a11y: an editable combobox — DOM focus stays in the search input while open;
 * options are highlighted virtually via `aria-activedescendant` (never real
 * focus). The list is role=listbox, rows role=option.
 *
 * Styling lives in this `tailwind-variants` config: the field-row
 * recipe is shared with c-select, the panel/card/list/item with c-menu /
 * c-dropdown. Consumer customization is via `::part()`.
 */
const autocomplete = tv({
  defaultVariants: {
    chevronActive: false,
    disabled: false,
    inputHidden: false,
  },
  slots: {
    card: 'flex flex-col min-w-[180px] max-h-[80vh] overflow-hidden rounded-csc-md bg-surface-overlay shadow-[2px_4px_10px_#00000029]',
    check: 'w-4 h-4 shrink-0 fill-current ml-auto text-primary',
    chevron:
      'aspect-square -mr-1.5 rotate-0 transition-transform duration-300 ease-in-out',
    content: 'relative flex items-center w-full min-w-0',
    iconButton: 'aspect-square -mr-1.5',
    info: 'flex items-center flex-nowrap gap-2 text-sm min-h-[42px] px-[10px] w-full cursor-default whitespace-nowrap text-on-surface-muted',
    infoIcon: 'w-[18px] h-[18px] shrink-0 fill-current text-warning',
    input:
      'max-h-8 py-2 bg-transparent border-0 text-on-surface flex-[1_1_auto] [font-family:var(--c-font-family)] text-base leading-5 max-w-full min-w-0 w-full cursor-pointer outline-none focus:outline-none active:outline-none placeholder:text-on-surface-muted placeholder:opacity-100',
    item: 'flex items-center flex-nowrap gap-3 cursor-pointer text-sm min-h-[42px] outline-none px-[10px] py-2 whitespace-nowrap w-full rounded select-none data-[active]:bg-primary-subtle data-[active]:text-primary data-[active]:ring-1 data-[active]:ring-inset data-[active]:ring-primary text-on-surface',
    itemLabel: 'flex-auto overflow-hidden text-ellipsis whitespace-nowrap',
    list: 'list-none m-0 mt-1 p-1 outline-none overflow-y-auto scrollbar-hidden w-full',
    panel:
      'fixed m-0 p-0 border-0 bg-transparent overflow-visible [inset:auto]',
    search:
      'flex items-center gap-2 min-h-11 px-3 border-b border-solid border-divider',
    searchIcon: 'w-[18px] h-[18px] shrink-0 fill-current text-on-surface-muted',
    searchInput:
      'bg-transparent border-0 outline-none w-full py-2 text-base leading-5 text-on-surface [font-family:var(--c-font-family)] [caret-color:var(--c-primary)] placeholder:text-on-surface-muted placeholder:opacity-100',
    // A long option label ellipsises inside its tag instead of blowing out
    // the row.
    tagLabel: 'truncate min-w-0',
    // The tag row wraps; `py-2` keeps a one-row field at the 44px / 36px
    // rhythm (default tag 28px + 16px, small tag 20px + 16px). Wrapping lives
    // here, not on the content row, so the clear/chevron stay centred.
    tags: 'flex flex-wrap items-center gap-1 py-2 flex-1 min-w-0',
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
    // While tags render, the readonly combobox is visually hidden (clip) but
    // stays focusable and keeps its value for assistive technology.
    inputHidden: {
      true: {
        input:
          'absolute w-px h-px p-0 m-0 overflow-hidden whitespace-nowrap border-0 [clip:rect(0_0_0_0)]',
      },
    },
  },
});

// The two root nodes (anchor wrapper + panel) mean Vue can't auto-inherit
// fallthrough attrs; opt out so `style`/`class`/`v-model` a consumer puts on
// <c-autocomplete> stay on the host (which is `display:block`) instead of
// leaking onto an internal node / tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

type NormalizedOption = {
  el?: HTMLElement;
  html?: string;
} & CAutocompleteOption;

const props = withDefaults(defineProps<CAutocompleteProps>(), {
  clearable: false,
  disabled: false,
  errorMessage: '',
  external: false,
  filter: undefined,
  hideDetails: false,
  hint: '',
  hostId: '',
  items: () => [],
  itemsPerPage: 6,
  label: '',
  labelOnTop: false,
  loading: false,
  maxTags: undefined,
  multiple: false,
  name: '',
  placeholder: '',
  required: false,
  returnObject: false,
  shadow: false,
  size: 'default',
  texts: () => ({}),
  valid: true,
  value: null,
});

const host = useHost();

const emit = useHostEmit<CAutocompleteEvents>();

const DEFAULT_TEXTS: Required<CAutocompleteTexts> = {
  clearSelection: 'Clear selection',
  filterOptions: 'Filter options',
  loading: 'Loading',
  more: (count) => `+${count} more`,
  noResults: 'No matching data',
  remove: (label) => `Remove ${label}`,
  searchPlaceholder: 'Search...',
  selected: (count) => `${count} selected`,
  toggleOptions: 'Toggle options',
};

const t = computed(() => ({ ...DEFAULT_TEXTS, ...props.texts }));

const anchorRef = useTemplateRef<HTMLElement>('anchorRef');

const cardRef = useTemplateRef<HTMLElement>('cardRef');

const cInputRef = useTemplateRef<HTMLElement>('cInputRef');

const fieldRef = useTemplateRef<HTMLInputElement>('fieldRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const searchRef = useTemplateRef<HTMLInputElement>('searchRef');

const listRef = useTemplateRef<HTMLUListElement>('listRef');

// Local mirror of `value` (Vue props are readonly; selection flows out via
// events). The watch keeps it in sync with external v-model updates.
const value = ref<CAutocompleteValue>(props.value);

watch(
  () => props.value,
  (v) => {
    value.value = v as typeof value.value;
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

const isOpen = ref(false);

const activeIndex = ref(-1);

const statusText = ref('');

const panelWidth = ref(0);

const optionElements = ref<HTMLElement[]>([]);

const optionElementsExist = ref(false);

const hasConsumerPre = ref(false);

const hasConsumerPost = ref(false);

let pendingReturnFocus = false;

const autoId = useId();

const id = computed(() => props.hostId || autoId);

const inputId = computed(
  () =>
    `input_${(props.hostId || props.label || props.placeholder).replace(
      /[^a-zA-Z0-9-_]/g,
      '',
    )}`,
);

// `hide-details` is forwarded to the inner `c-input` through a `data-*`
// channel (resolved from the stable host attribute), mirroring c-select: a
// direct `:hide-details` binding collides with c-input's declared prop and
// Vue mangles it on the field's frequent re-renders.
const hideDetailsResolved = computed(() =>
  host?.hasAttribute('hide-details')
    ? coerceBoolean(host.getAttribute('hide-details'))
    : coerceBoolean(props.hideDetails),
);

// Same defineCustomElement Boolean-attribute quirk as `hide-details`: resolve
// `multiple` from the stable host attribute first.
const multipleOn = computed(() =>
  host?.hasAttribute('multiple')
    ? coerceBoolean(host.getAttribute('multiple'))
    : coerceBoolean(props.multiple),
);

const ui = computed(() =>
  autocomplete({ chevronActive: isOpen.value, inputHidden: tagsShown.value }),
);

// The anchor wrapper spans the whole inner c-input, INCLUDING its hint /
// error message area (which is reserved unless `hide-details` is set). The
// panel must sit flush under the field itself, so the message area's height
// is measured on open and pulled back with a negative block-start margin.
const messageOffset = ref(0);

const panelStyle = computed(() => {
  const w = panelWidth.value ? `width:${panelWidth.value}px;` : '';

  const m = messageOffset.value ? `margin-top:-${messageOffset.value}px;` : '';

  return `position-anchor:--c-autocomplete-anchor;position-area:bottom span-right;inset:auto;${w}${m}`;
});

// ---- peek cap (ADR-0043) -------------------------------------------------

// The list hides its scrollbar, so when it overflows it must end on a
// half-visible row — the peek: `itemsPerPage` full rows first, and never past
// what the card's `max-h-[80vh]` leaves under the search row. Measured from
// the real rows.
const applyListCap = () => {
  const list = listRef.value;

  const card = cardRef.value;

  if (!list || !card) return;

  const cardMax = parseFloat(getComputedStyle(card).maxHeight);

  const above =
    list.getBoundingClientRect().top - card.getBoundingClientRect().top;

  applyPeekCap(list, {
    ceiling: Number.isFinite(cardMax) ? cardMax - above : Infinity,
    itemsPerPage: props.itemsPerPage,
    rows: Array.from(list.querySelectorAll<HTMLElement>('li[role="option"]')),
  });
};

// ---- options + filtering ------------------------------------------------

// Bumped by the slot MutationObserver so the option-derived computed re-reads
// when consumer <c-option> children change.
const optionsVersion = ref(0);

const normalizedOptions = computed<NormalizedOption[]>(() => {
  void optionsVersion.value;

  if (optionElementsExist.value) {
    return optionElements.value.map((el) => {
      const o = el as {
        disabled?: boolean;
        value?: number | string;
      } & HTMLElement;

      return {
        disabled: coerceBoolean(o.disabled ?? el.getAttribute('disabled')),
        el,
        html: el.outerHTML,
        label: optionLabel(el),
        value: o.value ?? (el.getAttribute('value') as string),
      };
    });
  }

  return (props.items ?? []).map((it) => ({
    disabled: !!it.disabled,
    label: it.name,
    value: it.value,
  }));
});

const filterFn = computed<CAutocompleteFilter>(
  () =>
    props.filter ??
    ((option, q) => option.label.toLowerCase().startsWith(q.toLowerCase())),
);

// With `external` the consumer owns filtering (c-data-table's contract): the
// options render verbatim and `change:query` is the only filtering signal.
const externalOn = computed(() => coerceBoolean(props.external));

const filteredOptions = computed<NormalizedOption[]>(() => {
  const q = query.value;

  if (externalOn.value || !q) return normalizedOptions.value;

  const fn = filterFn.value;

  return normalizedOptions.value.filter((o) =>
    fn({ disabled: o.disabled, label: o.label, value: o.value }, q),
  );
});

// ---- match marking (ADR-0045) --------------------------------------------

// A query-time copy of a slotted option whose first <c-option-value> — the
// label region — is rebuilt as text runs and `<mark part="match">` runs, as
// DOM nodes (no string escaping; the clone never connects, so the nested
// custom elements construct but never mount). `null` when the option has no
// wrapper: consumer markup is then rendered verbatim, never rewritten.
const markedOptionHtml = (el: HTMLElement, q: string): null | string => {
  if (!optionValueElement(el)) return null;

  const clone = el.cloneNode(true) as HTMLElement;

  const wrapper = optionValueElement(clone) as Element;

  wrapper.replaceChildren(
    ...splitMatches(wrapper.textContent ?? '', q).map((seg) => {
      if (!seg.match) return document.createTextNode(seg.text);

      const mark = document.createElement('mark');
      mark.setAttribute('part', 'match');
      mark.textContent = seg.text;

      return mark;
    }),
  );

  return clone.outerHTML;
};

type RenderedOption = { segments?: MatchSegment[] } & NormalizedOption;

// The rows as drawn: `filteredOptions` positionally (row ids, `activeIndex`
// and the cap/status watchers stay keyed on that array) plus the match
// marking for the current query. A computed, not a template method: the
// list re-renders on every `pointermove`, which would otherwise clone every
// row per mouse event. With an empty query the rows are the verbatim
// `outerHTML` / plain label.
const renderedOptions = computed<RenderedOption[]>(() => {
  const q = query.value;

  return filteredOptions.value.map((o) =>
    o.el
      ? { ...o, html: (q && markedOptionHtml(o.el, q)) || o.html }
      : { ...o, segments: splitMatches(o.label, q) },
  );
});

type AutocompleteRawValue = CAutocompleteItem | number | string;

// The scalar identity of a value: `return-object` items compare by their
// `.value`. Duplicate option values are not distinguishable (as before).
const valueOf = (v: AutocompleteRawValue): number | string =>
  typeof v === 'object' && v !== null ? v.value : v;

// Single-mode selection (null outside it, and in `multiple` mode).
const selectedValue = computed(() => {
  const v = value.value;

  if (multipleOn.value || v == null || Array.isArray(v)) return null;

  return props.returnObject
    ? (v as CAutocompleteItem).value
    : (v as number | string);
});

// ---- multiple-mode selection ---------------------------------------------

const rawValues = computed<AutocompleteRawValue[]>(() =>
  multipleOn.value && Array.isArray(value.value)
    ? (value.value as AutocompleteRawValue[])
    : [],
);

// Picked values in pick order (empty outside `multiple` mode).
const selectedValues = computed(() => rawValues.value.map(valueOf));

// `[]` is truthy, so every "is anything selected" site goes through this.
const hasSelection = computed(() =>
  multipleOn.value ? selectedValues.value.length > 0 : !!value.value,
);

const isSelected = (opt: NormalizedOption) =>
  multipleOn.value
    ? selectedValues.value.includes(opt.value)
    : selectedValue.value != null && opt.value === selectedValue.value;

// Labels remembered at commit time, keyed on value: with `external` the
// current option list may no longer contain a selection, so the closed
// field's labels (and the tags) must survive `items` swaps. Single mode
// keeps one slot; `multiple` keeps one per pick.
const committedLabel = ref<{ label: string; value: number | string } | null>(
  null,
);

const committedLabels = ref(new Map<number | string, string>());

// Label resolution chain (ADR-0029), per value: the current options → the
// label remembered at commit → the object value's own `name` → the raw value.
const labelFor = (v: number | string, raw?: AutocompleteRawValue): string => {
  const fromOptions = normalizedOptions.value.find((o) => o.value === v)?.label;

  if (fromOptions != null) return fromOptions;

  const remembered =
    committedLabels.value.get(v) ??
    (committedLabel.value?.value === v
      ? committedLabel.value.label
      : undefined);

  if (remembered != null) return remembered;

  if (raw && typeof raw === 'object') return raw.name;

  return String(v);
};

const displayLabel = computed(() => {
  const sel = selectedValue.value;

  return sel == null ? '' : labelFor(sel, value.value as AutocompleteRawValue);
});

// The picks as `{ label, value }`, in pick order — what the tag row renders.
const selectedOptions = computed(() =>
  rawValues.value.map((raw) => {
    const v = valueOf(raw);

    return { label: labelFor(v, raw), value: v };
  }),
);

const maxTagsResolved = computed(() =>
  props.maxTags == null || Number(props.maxTags) < 0
    ? Infinity
    : Math.floor(Number(props.maxTags)),
);

const tagsShown = computed(
  () =>
    multipleOn.value &&
    selectedOptions.value.length > 0 &&
    maxTagsResolved.value > 0,
);

const visibleTags = computed(() =>
  selectedOptions.value.slice(0, maxTagsResolved.value),
);

const hiddenCount = computed(
  () => selectedOptions.value.length - visibleTags.value.length,
);

// What the readonly combobox holds: the single-mode label; in `multiple`
// mode every picked label (the input is visually hidden behind the tags but
// is what assistive technology reads), or the count summary when
// `max-tags="0"` shows no tags.
const inputValue = computed(() => {
  if (!multipleOn.value) return displayLabel.value;

  const n = selectedOptions.value.length;

  if (!n) return '';

  return tagsShown.value
    ? selectedOptions.value.map((o) => o.label).join(', ')
    : t.value.selected(n);
});

// Mirror the selection onto the live <c-option> elements for consistency
// with c-select (external code may read `.selected`).
const syncOptionElements = (selected: Set<number | string>) => {
  if (!optionElementsExist.value) return;

  normalizedOptions.value.forEach((o) => {
    if (o.el)
      (o.el as { selected?: boolean } & HTMLElement).selected = selected.has(
        o.value,
      );
  });
};

// ---- value plumbing -----------------------------------------------------

// `multiple` mode: tick appends (pick order), untick removes; the whole
// array is emitted and the panel stays open with its query intact.
const toggle = (opt: { label: string; value: number | string }) => {
  const current = rawValues.value;

  const idx = current.findIndex((item) => valueOf(item) === opt.value);

  const next: AutocompleteRawValue[] =
    idx >= 0
      ? current.filter((_, i) => i !== idx)
      : [
          ...current,
          props.returnObject
            ? { name: opt.label, value: opt.value }
            : opt.value,
        ];

  if (idx >= 0) committedLabels.value.delete(opt.value);
  else committedLabels.value.set(opt.value, opt.label);

  const committed = next as CAutocompleteValue;
  value.value = committed;
  emitModelValue(host, committed);
  emit('change', undefined, { bubbles: true, composed: true });
  syncOptionElements(new Set(next.map(valueOf)));
};

// A tag's close button / Backspace: remove one pick and keep focus in the
// component (the removed button can no longer hold it).
const removeValue = (v: number | string) => {
  if (!selectedValues.value.includes(v)) return;

  toggle({ label: labelFor(v), value: v });
  requestAnimationFrame(() =>
    (isOpen.value ? searchRef : fieldRef).value?.focus(),
  );
};

// A click on a tag's close button must not bubble into the field's click
// handler and toggle the panel; a click on the tag body keeps bubbling so it
// opens the panel like any click in the field.
const onTagsClick = (event: Event) => {
  if (
    event.composedPath().some((n) => (n as Element).tagName === 'C-ICON-BUTTON')
  ) {
    event.stopPropagation();
  }
};

const commit = (opt: NormalizedOption) => {
  const next = props.returnObject
    ? { name: opt.label, value: opt.value }
    : opt.value;

  value.value = next;
  committedLabel.value = { label: opt.label, value: opt.value };
  emitModelValue(host, next);
  emit('change', undefined, { bubbles: true, composed: true });
  syncOptionElements(new Set([opt.value]));
};

const onSelect = (opt: NormalizedOption) => {
  if (opt.disabled) return;

  // `multiple`: toggle and stay open — focus stays in the search input, the
  // query and the highlight are kept, so the next match is one keystroke away.
  if (multipleOn.value) {
    toggle(opt);
    searchRef.value?.focus();
    updateStatusText();

    return;
  }

  commit(opt);
  closePanel(true);
};

const onReset = (event?: Event) => {
  event?.stopPropagation();

  const cleared = multipleOn.value ? [] : null;
  value.value = cleared;
  committedLabel.value = null;
  committedLabels.value.clear();
  setQuery('');
  emitModelValue(host, cleared);
  emit('change', undefined, { bubbles: true, composed: true });
  syncOptionElements(new Set());

  fieldRef.value?.focus();
};

/**
 * Reset autocomplete state
 *
 * @seeded from csc-ui — verify
 */
const reset = () => onReset();

defineExpose({ reset });

// ---- open / close -------------------------------------------------------

const openPanel = () => {
  const p = panelRef.value;

  if (props.disabled || !p || p.matches(':popover-open')) return;

  // Pin the panel width to the field before showing so it lines up.
  panelWidth.value = anchorRef.value?.getBoundingClientRect().width ?? 0;

  // Anchor to the bottom of the FIELD, not the c-input's message area.
  const inputEl = cInputRef.value;

  const message =
    inputEl?.shadowRoot?.querySelector<HTMLElement>("[part='message']");

  messageOffset.value = message?.getBoundingClientRect().height ?? 0;

  if (typeof p.showPopover === 'function') p.showPopover();
};

const closePanel = (returnFocus = false) => {
  pendingReturnFocus = returnFocus;

  const p = panelRef.value;

  if (p && typeof p.hidePopover === 'function' && p.matches(':popover-open')) {
    p.hidePopover();
  }
};

const onToggle = (event: Event) => {
  const nowOpen = (event as ToggleEvent).newState === 'open';

  isOpen.value = nowOpen;

  if (nowOpen) {
    void ensureAnchorPositioning(host?.shadowRoot);
    addDismissListeners();

    // Reset the query and tell the consumer — always, even when it was
    // already empty: with `external` this is what loads the default list.
    query.value = '';
    emit('change:query', '');

    // Seed the active option from the current selection, else the first
    // enabled option.
    requestAnimationFrame(() => {
      applyListCap();
      searchRef.value?.focus();
      seedActiveIndex();
      updateStatusText();
    });
  } else {
    removeDismissListeners();
    activeIndex.value = -1;

    if (pendingReturnFocus) fieldRef.value?.focus();

    pendingReturnFocus = false;
  }
};

const seedActiveIndex = () => {
  const selIdx = filteredOptions.value.findIndex((o) => isSelected(o));

  if (selIdx >= 0 && !filteredOptions.value[selIdx].disabled) {
    activeIndex.value = selIdx;
  } else {
    activeIndex.value = filteredOptions.value.findIndex((o) => !o.disabled);
  }

  scrollActiveIntoView();
};

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
  if (props.disabled) return;

  // `multiple`: Backspace on the (closed) readonly field removes the last
  // pick. The search input has its own handler, where Backspace edits the
  // query as usual.
  if (event.key === 'Backspace') {
    if (multipleOn.value && selectedOptions.value.length) {
      event.preventDefault();
      removeValue(
        selectedOptions.value[selectedOptions.value.length - 1].value,
      );
    }

    return;
  }

  if (
    !isOpen.value &&
    [' ', 'ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)
  ) {
    event.preventDefault();
    openPanel();

    return;
  }

  // A printable character opens the panel and seeds the search input.
  if (
    !isOpen.value &&
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  ) {
    openPanel();
    requestAnimationFrame(() => {
      setQuery(event.key);

      if (searchRef.value) searchRef.value.value = event.key;
      activeIndex.value = filteredOptions.value.findIndex((o) => !o.disabled);
    });
  }
};

const moveActive = (dir: -1 | 1) => {
  const items = filteredOptions.value;

  if (!items.length) return;

  let idx = activeIndex.value;

  for (let i = 0; i < items.length; i++) {
    idx = (idx + dir + items.length) % items.length;

    if (!items[idx].disabled) {
      activeIndex.value = idx;
      scrollActiveIntoView();

      return;
    }
  }
};

const onSearchInput = (event: Event) => {
  setQuery((event.target as HTMLInputElement).value);
  // Re-seed the active option to the first match so Enter selects something
  // sensible and the aria-activedescendant stays valid.
  requestAnimationFrame(() => {
    activeIndex.value = filteredOptions.value.findIndex((o) => !o.disabled);
    scrollActiveIntoView();
    updateStatusText();
  });
};

const onSearchKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      moveActive(1);

      break;

    case 'ArrowUp':
      event.preventDefault();
      moveActive(-1);

      break;

    case 'End': {
      event.preventDefault();

      for (let i = filteredOptions.value.length - 1; i >= 0; i--) {
        if (!filteredOptions.value[i].disabled) {
          activeIndex.value = i;

          break;
        }
      }

      scrollActiveIntoView();

      break;
    }

    case 'Enter': {
      event.preventDefault();

      const opt = filteredOptions.value[activeIndex.value];

      if (opt) onSelect(opt);

      break;
    }

    case 'Escape':
      event.preventDefault();
      closePanel(true);

      break;

    case 'Home':
      event.preventDefault();
      activeIndex.value = filteredOptions.value.findIndex((o) => !o.disabled);
      scrollActiveIntoView();

      break;

    case 'Tab':
      closePanel(false);

      break;
  }
};

const scrollActiveIntoView = () => {
  requestAnimationFrame(() => {
    const li = listRef.value?.querySelector(
      `#${CSS.escape(`${id.value}-opt-${activeIndex.value}`)}`,
    ) as HTMLElement | null;
    li?.scrollIntoView({ block: 'nearest' });
  });
};

// ---- status text (aria-live) --------------------------------------------

let statusDebounce: null | number = null;

const updateStatusText = () => {
  if (statusDebounce !== null) clearTimeout(statusDebounce);

  statusDebounce = window.setTimeout(() => {
    const n = filteredOptions.value.length;

    statusText.value =
      props.loading && !n
        ? 'Loading results'
        : n
          ? `${n} result${n !== 1 ? 's' : ''} available, navigate using the up and down arrows`
          : 'No search results available';
    statusDebounce = null;
  }, 1400);
};

// Re-cap when the row set or the page size changes. Deferred a frame: a
// `flush: 'post'` watcher on `filteredOptions` still ran ahead of the row
// patch here and measured the outgoing rows.
let capFrame = 0;

watch([filteredOptions, () => props.itemsPerPage], () => {
  if (!isOpen.value) return;

  cancelAnimationFrame(capFrame);
  capFrame = requestAnimationFrame(() => {
    capFrame = 0;
    applyListCap();
  });
});

// With `external`, options arrive asynchronously after the query event: keep
// the virtual highlight (`aria-activedescendant`) pointing at a live enabled
// row and re-announce the count when the fresh list lands.
watch([filteredOptions, () => props.loading], () => {
  if (!isOpen.value) return;

  const opts = filteredOptions.value;

  const active = opts[activeIndex.value];

  if (!active || active.disabled) {
    activeIndex.value = opts.findIndex((o) => !o.disabled);
    scrollActiveIntoView();
  }

  updateStatusText();
});

// ---- light-dismiss ------------------------------------------------------

const onDocPointerDown = (event: Event) => {
  if (!isOpen.value || !host) return;

  if (!event.composedPath().includes(host)) closePanel(false);
};

const addDismissListeners = () => {
  document.addEventListener('pointerdown', onDocPointerDown, true);
};

const removeDismissListeners = () => {
  document.removeEventListener('pointerdown', onDocPointerDown, true);
};

// ---- slotted <c-option> discovery ---------------------------------------

const refreshOptions = () => {
  if (!host) return;

  const options = Array.from(
    host.querySelectorAll('c-option'),
  ) as HTMLElement[];
  optionElements.value = options;

  if (options.length && !optionElementsExist.value) {
    optionElementsExist.value = true;
  }

  optionsVersion.value++;

  hasConsumerPre.value = !!host.querySelector(':scope > [slot="pre"]');
  hasConsumerPost.value = !!host.querySelector(':scope > [slot="post"]');

  type OptionEl = {
    selected?: boolean | string;
    value: number | string;
  } & HTMLElement;

  // `multiple`: every `<c-option selected>` seeds the array (DOM order) —
  // only while nothing is picked yet, so a later child mutation cannot
  // re-seed a selection the user has cleared.
  if (multipleOn.value) {
    const picked = (options as OptionEl[]).filter((o) =>
      coerceBoolean(o.selected ?? o.getAttribute('selected')),
    );

    if (picked.length && !selectedValues.value.length) {
      value.value = picked.map((o) =>
        props.returnObject ? { name: optionLabel(o), value: o.value } : o.value,
      ) as CAutocompleteValue;
    }

    return;
  }

  const selection = (options as OptionEl[]).find((o) =>
    coerceBoolean(o.selected ?? o.getAttribute('selected')),
  );

  if (selection && value.value == null) {
    value.value = props.returnObject
      ? { name: optionLabel(selection), value: selection.value }
      : selection.value;
  }
};

let childObserver: MutationObserver | null = null;

onMounted(() => {
  refreshOptions();

  if (host && typeof MutationObserver !== 'undefined') {
    childObserver = new MutationObserver(refreshOptions);
    // `characterData`: a `{{ text }}` change inside a <c-option-value> is a
    // text-node edit, not a childList mutation, and it changes the label.
    childObserver.observe(host, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }
});

onBeforeUnmount(() => {
  childObserver?.disconnect();
  removeDismissListeners();

  if (statusDebounce !== null) clearTimeout(statusDebounce);

  // Ensure the popover is torn down if we unmount while open.
  const p = panelRef.value;

  if (p?.matches(':popover-open')) p.hidePopover();

  void cInputRef.value;
});
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. The field row, panel, card, list and item recipes live in the `tv`
  config above. What remains, tokens-only:
    - `:host{display:block}` — the field is a real box (overrides the global
      `:host{display:contents}`).
    - `.c-input__content slot{display:none}` — the projected <c-option> data
      source must never paint; a `<slot>` is a shadow node Vue can't class.
    - `[part='panel'] position-try-fallbacks` — native flip/shift when the
      preferred placement lacks room (the `position-area` is set inline); an
      at-rule-adjacent syntax with no utility equivalent.
    - the popover open animation keyframe.
    - the readonly field `input::placeholder` (a native pseudo-element).
    - `li c-option / li c-option-value` — those nodes come from `v-html`
      (option outerHTML), so Vue can't hang a class on them; strip the
      stand-alone option's block padding so it sits inline in the row, and
      ellipsise the label region (a block box of its own, so the wrapper
      span's `text-ellipsis` cannot clip its text).
    - `[part='match']` — the match marking around the query in a row label;
      in slotted rows the `<mark>` is `v-html`-injected too, and the UA
      `mark` default (black on yellow) is unreadable in dark mode.
-->
<style>
:host {
  display: block;
  cursor: text;
}

.c-input__content slot {
  display: none;
}

/* When flipped above the field the message-area offset (a negative
 * margin-top set inline) must not apply: the panel's bottom edge then meets
 * the anchor's top edge, which IS the field's top. */
@position-try --c-autocomplete-above {
  position-area: top span-right;
  margin-top: 0;
}

@position-try --c-autocomplete-above-left {
  position-area: top span-left;
  margin-top: 0;
}

[part='panel'] {
  position-try-fallbacks:
    --c-autocomplete-above, flip-inline, --c-autocomplete-above-left;
}

[part='panel']:popover-open {
  animation: c-autocomplete-fade-in 0.12s ease-out;
}

input.c-input__input::placeholder {
  color: var(--c-on-surface-muted);
  opacity: 1;
}

/* `v-html`-injected option content: neutralise the stand-alone <c-option>
 * block box so its label flows inline inside the row. */
li c-option {
  display: contents;
}

/* The label region: a block of its own, so a long label ellipsises here. */
li c-option-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Match marking (ADR-0045): the runs of a label equal to the query, in both
 * the slotted (`v-html`) and `items` rows. Text colour and background follow
 * the row; the underline is the primary token, so it tracks the theme. A
 * decoration rather than the 3.x box-shadow: it survives the label region's
 * `overflow: hidden` and forced-colors mode. */
[part='match'] {
  background: transparent;
  color: inherit;
  text-decoration: underline 2px var(--c-primary);
  text-decoration-skip-ink: none;
  text-underline-offset: 0.15em;
}

@keyframes c-autocomplete-fade-in {
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
