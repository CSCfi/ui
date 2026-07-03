<template>
  <!-- Anchor wrapper: a shadow-DOM box around the value field. CSS anchor
       names are tree-scoped, so the anchor must live in the same shadow root
       as the panel (ADR-0008). It carries `anchor-name`; the panel references
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
      :filled="!!value"
      :hint
      :input-id
      :label
      :label-on-top
      :required
      :shadow
      :valid
      :validation
      @click="onFieldClick"
    >
      <span v-if="hasConsumerPre" slot="pre" style="display: contents">
        <slot name="pre" />
      </span>

      <div :class="ui.content()" class="c-input__content">
        <input
          ref="fieldRef"
          :aria-controls="`${id}-listbox`"
          :aria-expanded="isOpen"
          :class="ui.input()"
          :disabled
          :name="name || undefined"
          :value="displayLabel"
          aria-haspopup="listbox"
          autocomplete="off"
          class="c-input__input"
          role="combobox"
          type="text"
          readonly
          @keydown="onFieldKeyDown"
        />

        <c-spinner v-if="loading" :size="20" color="var(--c-primary)" />

        <c-icon-button
          v-else-if="value && clearable"
          :class="ui.iconButton()"
          :disabled
          aria-label="Clear selection"
          size="x-small"
          text
          @click="onReset"
          @keydown="onButtonKeyDown('reset', $event)"
        >
          <c-icon :path="mdiClose" :size="20" />
        </c-icon-button>

        <c-icon-button
          v-else
          :class="ui.chevron()"
          :disabled
          aria-label="Toggle options"
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
    <div :class="ui.card()" part="card">
      <div
        :id="`${id}-status`"
        :class="ui.visuallyHidden()"
        aria-atomic="true"
        aria-live="polite"
      >
        {{ statusText }}
      </div>

      <div :class="ui.search()" part="search">
        <input
          ref="searchRef"
          :aria-activedescendant="
            activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined
          "
          :aria-controls="`${id}-listbox`"
          :class="ui.searchInput()"
          :placeholder="placeholder || 'Search...'"
          :value="query"
          aria-autocomplete="list"
          aria-label="Filter options"
          autocomplete="off"
          type="text"
          @input="onSearchInput"
          @keydown="onSearchKeyDown"
        />
      </div>

      <ul
        :id="`${id}-listbox`"
        ref="listRef"
        :class="ui.list()"
        :style="listStyle"
        part="list"
        role="listbox"
        tabindex="-1"
      >
        <!-- No-results row: only when a query is entered and nothing matches. -->
        <li
          v-if="query && !filteredOptions.length"
          :class="ui.info()"
          part="info"
        >
          <svg :class="ui.infoIcon()" aria-hidden="true" viewBox="0 0 24 24">
            <path :d="mdiAlert" />
          </svg>
          {{ noResultsText }}
        </li>

        <li
          v-for="(opt, i) in filteredOptions"
          :id="`${id}-opt-${i}`"
          :key="`opt-${i}`"
          :aria-disabled="opt.disabled || undefined"
          :aria-selected="isSelected(opt)"
          :class="[
            autocomplete({ disabled: !!opt.disabled }).item(),
            i === activeIndex ? 'c-autocomplete__item--active' : '',
          ]"
          :data-active="i === activeIndex || undefined"
          role="option"
          tabindex="-1"
          @click="onSelect(opt)"
          @pointermove="activeIndex = i"
        >
          <span v-if="opt.html" :class="ui.itemLabel()" v-html="opt.html" />

          <span v-else :class="ui.itemLabel()">{{ opt.label }}</span>

          <svg
            v-if="isSelected(opt)"
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

<script setup lang="ts">
/**
 * A filterable value-selection component: a readonly value field that opens a
 * popover panel with a search input above the matching options.
 *
 * @slot pre - Content placed before the value field inside the input row
 * @slot default - The c-option elements used as the data source (never rendered in place)
 * @slot post - Content placed after the value field inside the input row
 *
 * @csspart panel - The top-layer popover container anchored below the field
 * @csspart card - The elevated surface inside the panel holding the search row and the list
 * @csspart search - The search-input row at the top of the panel
 * @csspart list - The scrollable options listbox
 * @csspart info - The no-results row shown when the query matches no options
 *
 * @subcomponents c-option, c-option-value
 */
import { mdiAlert, mdiCheck, mdiChevronDown, mdiClose } from '@mdi/js';
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

import type {
  CAutocompleteFilter,
  CAutocompleteItem,
  CAutocompleteOption,
} from '../../types';

import { ensureAnchorPositioning } from '../../shared/anchorPolyfill';
import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelValue } from '../../shared/emitModelValue';
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
   * Fired when the selected value changes (an option is committed or the
   * selection is cleared), carrying the new value — the option's value, or
   * the whole `{ name, value }` item when `return-object` is set; `null`
   * when cleared.
   */
  changeValue: CAutocompleteItem | null | number | string;
  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;
  /**
   * Fired alongside `changeValue` with the same detail — the `v-model`
   * contract.
   */
  'update:value': CAutocompleteItem | null | number | string;
}

/**
 * c-autocomplete is a filterable value-selection component (CONTEXT.md:
 * "Autocomplete"). Unlike c-select it is NOT built on c-dropdown (ADR-0009):
 * a readonly c-input value field stays in place and a popover panel below it
 * (Popover API + CSS anchor positioning, the c-menu mechanism) holds a
 * dedicated SEARCH INPUT above the options. v-model binds the selected value
 * (scalar, or {name,value} with return-object); the query is internal,
 * client-side state filtered through the `filter` predicate.
 *
 * a11y: an editable combobox — DOM focus stays in the search input while open;
 * options are highlighted virtually via `aria-activedescendant` (never real
 * focus). The list is role=listbox, rows role=option.
 *
 * Styling lives in this `tailwind-variants` config (ADR-0004): the field-row
 * recipe is shared with c-select, the panel/card/list/item with c-menu /
 * c-dropdown. Consumer customization is via `::part()` (ADR-0006).
 */
const autocomplete = tv({
  defaultVariants: { chevronActive: false, disabled: false },
  slots: {
    card: 'flex flex-col min-w-[180px] max-h-[80vh] overflow-hidden rounded-csc-md bg-surface-overlay shadow-[2px_4px_10px_#00000029]',
    check: 'w-4 h-4 shrink-0 fill-current ml-auto text-primary',
    chevron:
      'aspect-square -mr-1.5 rotate-0 transition-transform duration-300 ease-in-out',
    content: 'flex items-center w-full',
    iconButton: 'aspect-square -mr-1.5',
    info: 'flex items-center flex-nowrap gap-2 text-sm min-h-[42px] px-[10px] w-full cursor-default whitespace-nowrap text-on-surface-muted',
    infoIcon: 'w-[18px] h-[18px] shrink-0 fill-current text-warning',
    input:
      'max-h-8 py-2 bg-transparent border-0 text-on-surface flex-[1_1_auto] [font-family:var(--c-font-family)] text-base leading-5 max-w-full min-w-0 w-full cursor-pointer outline-none focus:outline-none active:outline-none placeholder:text-on-surface-muted placeholder:opacity-100',
    item: 'flex items-center flex-nowrap gap-3 cursor-pointer text-sm min-h-[42px] outline-none px-[10px] whitespace-nowrap w-full rounded select-none data-[active]:bg-primary-subtle data-[active]:text-primary data-[active]:ring-1 data-[active]:ring-inset data-[active]:ring-primary text-on-surface',
    itemLabel: 'flex-auto overflow-hidden text-ellipsis whitespace-nowrap',
    list: 'list-none m-0 p-1 outline-none overflow-y-auto w-full',
    panel:
      'fixed m-0 p-0 border-0 bg-transparent overflow-visible [inset:auto]',
    search:
      'flex items-center min-h-11 px-3 border-b border-solid border-border',
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
  },
});

// The two root nodes (anchor wrapper + panel) mean Vue can't auto-inherit
// fallthrough attrs; opt out so `style`/`class`/`v-model` a consumer puts on
// <c-autocomplete> stay on the host (which is `display:block`) instead of
// leaking onto an internal node / tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

interface CAutocompleteProps {
  /** Make the selected value clearable */
  clearable?: boolean;
  /** Disable the input */
  disabled?: boolean;
  /** Custom filter predicate; receives a normalized option + the query */
  filter?: CAutocompleteFilter;
  /** Hide the hint and error messages */
  hideDetails?: boolean;
  /** Hint text for the input */
  hint?: string;
  /** Id of the element */
  hostId?: string;
  /** Dropdown items (when not using <c-option> elements) */
  items?: CAutocompleteItem[];
  /** Items per page before the list scrolls */
  itemsPerPage?: number;
  /** Element label */
  label?: string;
  /** Label on top of the input */
  labelOnTop?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Input field name */
  name?: string;
  /** Message shown when the query matches no options */
  noResultsText?: string;
  /** Placeholder for the in-panel search input */
  placeholder?: string;
  /** Show required validation */
  required?: boolean;
  /** Return object instead of value */
  returnObject?: boolean;
  /** Shadow variant */
  shadow?: boolean;
  /** Set the validity of the input */
  valid?: boolean;
  /** Manual validation */
  validate?: boolean;
  /** Validate the input on blur */
  validateOnBlur?: boolean;
  /** Custom validation message */
  validation?: string;
  /** Selected value (scalar, or object when return-object is set) */
  value?: CAutocompleteItem | null | number | string;
}

type NormalizedOption = {
  el?: HTMLElement;
  html?: string;
} & CAutocompleteOption;

const props = withDefaults(defineProps<CAutocompleteProps>(), {
  clearable: false,
  disabled: false,
  filter: undefined,
  hideDetails: false,
  hint: '',
  hostId: '',
  items: () => [],
  itemsPerPage: 6,
  label: '',
  labelOnTop: false,
  loading: false,
  name: '',
  noResultsText: 'No matching data',
  placeholder: '',
  required: false,
  returnObject: false,
  shadow: false,
  valid: true,
  validate: false,
  validateOnBlur: false,
  validation: 'Required field',
  value: null,
});

const host = useHost();

const emit = useHostEmit<CAutocompleteEvents>();

const anchorRef = useTemplateRef<HTMLElement>('anchorRef');

const cInputRef = useTemplateRef<HTMLElement>('cInputRef');

const fieldRef = useTemplateRef<HTMLInputElement>('fieldRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const searchRef = useTemplateRef<HTMLInputElement>('searchRef');

const listRef = useTemplateRef<HTMLUListElement>('listRef');

// Local mirror of `value` (Vue props are readonly; selection flows out via
// events). The watch keeps it in sync with external v-model updates.
const value = ref<CAutocompleteItem | null | number | string>(props.value);

watch(
  () => props.value,
  (v) => {
    value.value = v as typeof value.value;
  },
);

const query = ref('');

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

const ui = computed(() => autocomplete({ chevronActive: isOpen.value }));

const panelStyle = computed(() => {
  const w = panelWidth.value ? `width:${panelWidth.value}px;` : '';

  return `position-anchor:--c-autocomplete-anchor;position-area:bottom span-right;inset:auto;${w}`;
});

// Cap the list height at itemsPerPage rows (42px each) before scrolling.
const listStyle = computed(() =>
  props.itemsPerPage > 0
    ? `max-height:${42 * (props.itemsPerPage + 0.5)}px;`
    : '',
);

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
        name?: string;
        value?: number | string;
      } & HTMLElement;

      return {
        disabled: coerceBoolean(o.disabled ?? el.getAttribute('disabled')),
        el,
        html: el.outerHTML,
        label: (o.name ?? el.textContent ?? '').trim(),
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

const filteredOptions = computed<NormalizedOption[]>(() => {
  const q = query.value;

  if (!q) return normalizedOptions.value;

  const fn = filterFn.value;

  return normalizedOptions.value.filter((o) =>
    fn({ disabled: o.disabled, label: o.label, value: o.value }, q),
  );
});

const selectedValue = computed(() => {
  const v = value.value;

  if (v == null) return null;

  return props.returnObject ? (v as CAutocompleteItem).value : v;
});

const isSelected = (opt: NormalizedOption) =>
  selectedValue.value != null && opt.value === selectedValue.value;

const displayLabel = computed(() => {
  if (selectedValue.value == null) return '';

  return (
    normalizedOptions.value.find((o) => o.value === selectedValue.value)
      ?.label ?? ''
  );
});

// ---- value plumbing -----------------------------------------------------

const commit = (opt: NormalizedOption) => {
  const next = props.returnObject
    ? { name: opt.label, value: opt.value }
    : opt.value;

  value.value = next;
  emitModelValue(host, next);
  emit('change', undefined, { bubbles: true, composed: true });

  // Mirror selection onto the live <c-option> elements for consistency with
  // c-select (external code may read `.selected`).
  if (optionElementsExist.value) {
    optionElements.value.forEach((el) => {
      (el as { selected?: boolean } & HTMLElement).selected = el === opt.el;
    });
  }
};

const onSelect = (opt: NormalizedOption) => {
  if (opt.disabled) return;
  commit(opt);
  closePanel(true);
};

const onReset = (event?: Event) => {
  event?.stopPropagation();
  value.value = null;
  query.value = '';
  emitModelValue(host, null);
  emit('change', undefined, { bubbles: true, composed: true });

  if (optionElementsExist.value) {
    optionElements.value.forEach(
      (el) => ((el as { selected?: boolean } & HTMLElement).selected = false),
    );
  }

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
    query.value = '';

    // Seed the active option from the current selection, else the first
    // enabled option.
    requestAnimationFrame(() => {
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
      query.value = event.key;

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
  query.value = (event.target as HTMLInputElement).value;
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

    statusText.value = n
      ? `${n} result${n !== 1 ? 's' : ''} available, navigate using the up and down arrows`
      : 'No search results available';
    statusDebounce = null;
  }, 1400);
};

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

  const selection = options.find(
    (o) => (o as { selected?: boolean } & HTMLElement).selected,
  ) as ({ name?: string; value: number | string } & HTMLElement) | undefined;

  if (selection && value.value == null) {
    value.value = props.returnObject
      ? {
          name: (selection.name ?? selection.textContent ?? '').trim(),
          value: selection.value,
        }
      : selection.value;
  }
};

let childObserver: MutationObserver | null = null;

onMounted(() => {
  refreshOptions();

  if (host && typeof MutationObserver !== 'undefined') {
    childObserver = new MutationObserver(refreshOptions);
    childObserver.observe(host, { childList: true, subtree: true });
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
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
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
    - `li c-option / li c-option-value` reset — those nodes come from `v-html`
      (option outerHTML), so Vue can't hang a class on them; strip the
      stand-alone option's block padding so it sits inline in the row.
-->
<style>
:host {
  display: block;
  cursor: text;
}

.c-input__content slot {
  display: none;
}

[part='panel'] {
  position-try-fallbacks:
    flip-block,
    flip-inline,
    flip-block flip-inline;
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

li c-option-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
