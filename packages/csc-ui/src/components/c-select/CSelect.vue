<template>
  <c-dropdown
    :id="`${id}-dropdown`"
    ref="dropdownRef"
    :dropdown-item-type="optionElementsExist ? 'option' : 'item'"
    :host-id="`${id}-dropdown`"
    :index="currentIndex"
    :items="dropdownItems"
    :items-per-page
    :multiple="multipleOn"
    :parent="host"
    :selected="selectedValues"
    exportparts="menu, list, item, indicator, mark"
    type="select"
  >
    <c-input
      ref="cInputRef"
      :active="dropdownVisible"
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
      @click="onInputClick"
    >
      <span v-if="hasConsumerPre" slot="pre" style="display: contents">
        <slot name="pre" />
      </span>

      <div :class="ui.content()" class="c-input__content">
        <div :class="ui.inputWrap()" class="c-input-menu__input">
          <!-- The readonly combobox stays first in DOM order: in `multiple`
               mode it is visually hidden behind the tag row (clip, never
               display:none — it must keep taking focus) while its value
               carries the whole selection for assistive technology. -->
          <input
            ref="inputRef"
            :aria-expanded="dropdownVisible"
            :aria-label="label || undefined"
            :aria-owns="inputId + '-items'"
            :class="ui.input()"
            :disabled
            :name="name || undefined"
            :value="inputValue"
            aria-autocomplete="list"
            autocomplete="off"
            class="c-input__input"
            role="combobox"
            type="text"
            readonly
            @focus="onInputFocus"
            @input="onUpdateInput"
          />

          <div
            ref="selectionRef"
            :class="ui.selection()"
            class="c-input-menu__selection"
          />

          <!-- `multiple` mode: one closeable tag per picked option, in pick
               order, folded by `max-tags`. The tag label is hidden from AT
               (the combobox value already reads it); the close button is the
               tag's only accessible — and focusable — control. -->
          <div
            v-if="tagsShown"
            :class="ui.tags()"
            part="tags"
            @click="onTagsClick"
            @keydown="onTagsKeyDown"
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
          @click="toggleDropdown"
          @keydown="onButtonKeyDown('chevron', $event)"
        >
          <c-icon :path="mdiChevronDown" :size="24" />
        </c-icon-button>

        <!-- Consumer's <c-option> elements: data source only, hidden via the
             `.c-input__content slot { display: none }` escape-hatch rule. The
             dropdown renders clones; we read the originals through
             host.querySelectorAll. -->
        <slot />
      </div>

      <span v-if="hasConsumerPost" slot="post" style="display: contents">
        <slot name="post" />
      </span>
    </c-input>
  </c-dropdown>
</template>

<script lang="ts">
import type { CFieldSize, CSelectItem } from '../../types';

export interface CSelectProps {
  /** Make the selected value clearable */
  clearable?: boolean;
  /** Disable the input */
  disabled?: boolean;
  /**
   * Error message shown in place of the hint while the select is invalid
   *
   * @freeform
   */
  errorMessage?: string;
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
  items?: CSelectItem[];
  /** Items per page before adding scroll */
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
   * Allow selecting several options: rows toggle and the list stays open,
   * `value` becomes an array of the selected values (items with
   * `return-object`) in the order they were picked, and the picks show as
   * tags inside the field. `option-as-selection` is ignored in this mode.
   * Arrays have no attribute form — bind `value` as a DOM property
   */
  multiple?: boolean;
  /**
   * Input field name
   *
   * @freeform
   */
  name?: string;
  /** Display the option as selection (only with <c-option> elements) */
  optionAsSelection?: boolean;
  /**
   * Placeholder text
   *
   * @freeform
   */
  placeholder?: string;
  /** Set the select as required */
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
  texts?: CSelectTexts;
  /** Set the validity of the input */
  valid?: boolean;
  /**
   * Selected value: the option's value, or the whole item with
   * `return-object`; an array of them in `multiple` mode
   */
  value?: CSelectValue;
}

/**
 * UI texts of `c-select`, shallow-merged over the English defaults. Static
 * labels are strings; count- or label-interpolated ones are functions.
 */
export interface CSelectTexts {
  /** Accessible label of the clear button. */
  clearSelection?: string;
  /**
   * Text of the overflow tag when `max-tags` folds the selection; receives the
   * number of hidden tags.
   */
  more?: (count: number) => string;
  /** Accessible label of a tag's remove button; receives the option label. */
  remove?: (label: string) => string;
  /**
   * Field text when `max-tags="0"` shows no tags; receives the selection
   * count.
   */
  selected?: (count: number) => string;
  /** Accessible label of the chevron button that opens and closes the list. */
  toggleOptions?: string;
}

/**
 * Selection value of `c-select`: the picked option's value — or the whole
 * `{ name, value }` item with `return-object` — and `null` when nothing is
 * selected. In `multiple` mode an array of them in the order they were
 * picked, `[]` when empty.
 */
export type CSelectValue =
  | (number | string)[]
  | CSelectItem
  | CSelectItem[]
  | null
  | number
  | string;
</script>

<script setup lang="ts">
/**
 * @slot default - Use c-option elements only
 * @slot pre - Leading content forwarded to the inner c-input, rendered before the select's value
 * @slot post - Trailing content forwarded to the inner c-input, rendered after the select's controls
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-option
 *
 * @csspart menu - The dropdown surface (the positioned dialog) holding the field and the list
 * @csspart list - The scrolling listbox of options
 * @csspart item - One option row in the list. Any `part` attribute set on content inside a slotted `<c-option>` is exported too, so `c-select::part(<name>)` reaches the consumer's own option markup
 * @csspart indicator - The decorative checkbox box on an option row in `multiple` mode; border, fill and glyph draw with `currentColor`, so `color` recolours them together (the c-checkbox recipe)
 * @csspart mark - The check glyph inside a row indicator; draws with `currentColor`
 * @csspart tags - The row of selected-value tags inside the field (`multiple` mode)
 * @csspart tag - One selected-value tag: the `c-tag` host, including the overflow tag
 * @csspart tag-root - The pill box inside each tag (the `c-tag` `root` part), for colours and borders
 */
import { mdiChevronDown, mdiClose } from '@mdi/js';
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

import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelValue } from '../../shared/emitModelValue';

/** Events dispatched by `<c-select>`. */
interface CSelectEvents {
  /**
   * Fired when the selection changes (an option is picked or the value is
   * cleared), carrying the new value — the option's value, or the whole
   * `{ name, value }` item when `return-object` is set; `null` when cleared.
   * In `multiple` mode the whole array of picked values, in pick order
   * (`[]` when cleared).
   */
  changeValue: CSelectValue;
  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;
  /**
   * Fired alongside `changeValue` with the same detail — the `v-model`
   * contract.
   */
  'update:value': CSelectValue;
}

/**
 * Styling lives in this `tailwind-variants` config: the slots are
 * the select's internal regions (the flex content row, the readonly combobox
 * `input`, the rich-selection overlay, the chevron toggle). The
 * `chevronActive` / `selectionShown` variants replace the
 * `.c-input-menu__chevron--active` / `.c-input-menu__selection--show` classes.
 * The per-component `--c-select-*` override-variable layer is dropped in favour
 * of the global design tokens (`text-primary-600` for the active colour,
 * `text-[var(--c-text-body)]` for text, `text-tertiary-500` for placeholder);
 * consumer customization is via `::part()`, there is no `override`
 * prop.
 *
 * Child recolouring (cross-component contract): the chevron/clear `c-icon` and
 * the loading `c-spinner` inherit colour from `currentColor`, so a `text-*`
 * utility on their wrapper themes them — no `--c-icon-*` / `--c-spinner-*` vars.
 * The wrapped `c-input` is not yet on tv and still reads its `--c-input-*`
 * vars; its defaults already match the select defaults except for the floating
 * label colour, so a single `--c-input-label-color` bridge remains in the
 * escape-hatch <style> below, alongside the host box, the projected
 * `<slot>` hiding and the `:has()`/`::placeholder` selectors utilities can't
 * express.
 */
const select = tv({
  defaultVariants: { chevronActive: false, inputHidden: false },
  slots: {
    chevron:
      'aspect-square -mr-1.5 rotate-0 transition-transform duration-300 ease-in-out',
    content: 'flex items-center w-full',
    // The clear button / spinner wrappers share the icon-button box metrics.
    iconButton: 'aspect-square -mr-1.5',
    input:
      'max-h-8 py-2 bg-transparent border-0 text-on-surface flex-[1_1_auto] [font-family:var(--c-font-family)] text-base leading-5 max-w-full min-w-0 w-full cursor-pointer outline-none focus:outline-none active:outline-none placeholder:text-on-surface-muted placeholder:opacity-100',
    inputWrap: 'relative w-full min-w-0 flex justify-items-stretch',
    selection: 'hidden pointer-events-none',
    // A long option label ellipsises inside its tag instead of blowing out
    // the row.
    tagLabel: 'truncate min-w-0',
    // The tag row wraps; `py-2` keeps a one-row field at the 44px / 36px
    // rhythm (default tag 28px + 16px, small tag 20px + 16px). Wrapping lives
    // here, not on the content row, so the clear/chevron stay centred.
    tags: 'flex flex-wrap items-center gap-1 py-2 flex-1 min-w-0',
  },
  variants: {
    chevronActive: { true: { chevron: 'rotate-180' } },
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

// Port of c-select (Stencil). Thin orchestrator over c-dropdown + c-input:
// owns the readonly combobox input, the chevron/clear buttons, keyboard
// navigation and the value contract, and drives the dropdown via its
// exposed methods. Form participation via ElementInternals (Stencil's
// @AttachInternals) is intentionally dropped to match the rest of the
// csc-ui form components, which rely on event-based binding + v-control.

// The consumer-facing item shape is the shared CSelectItem; `selected` is
// internal bookkeeping this component stamps onto items when the value
// changes — never supplied by the consumer.
type SelectItem = { selected?: boolean } & CSelectItem;

// The single root is the internal <c-dropdown>; every prop it needs is bound
// explicitly below. Fallthrough attrs a consumer puts on <c-select> (notably
// `style`, plus `class` / `v-model`) therefore have no business on c-dropdown
// — and because c-dropdown renders a fragment they'd trip the "Extraneous
// non-props attributes (style) … renders fragment" warning. Opt out so those
// attrs stay on the c-select host element (which is `display: block`, so
// `style`/`class` apply there as the consumer intends) instead of leaking in.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CSelectProps>(), {
  clearable: false,
  disabled: false,
  errorMessage: '',
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
  optionAsSelection: false,
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

const DEFAULT_TEXTS: Required<CSelectTexts> = {
  clearSelection: 'Clear selection',
  more: (count) => `+${count} more`,
  remove: (label) => `Remove ${label}`,
  selected: (count) => `${count} selected`,
  toggleOptions: 'Toggle options',
};

const t = computed(() => ({ ...DEFAULT_TEXTS, ...props.texts }));

// `hide-details` is forwarded to the inner `c-input` and must survive the
// select's frequent re-renders (it re-renders on every value change). Two Vue
// `defineCustomElement` quirks bite here:
//   1. A Boolean prop supplied via *attribute* (`<c-select hide-details>`) is
//      reset to its default on re-render — the host attribute persists, but
//      `props.hideDetails` flips to `false`. So we resolve from the stable host
//      attribute when present, falling back to the prop otherwise.
//   2. Binding `hide-details` to the nested `c-input` in the template is mangled
//      on update — the key matches `c-input`'s declared `hideDetails` prop, so
//      Vue treats it as a property, and the reset above reflects back out and
//      removes the attribute on re-render. So we forward it through a plain
//      `data-*` attribute instead (no declared-prop collision → Vue patches it
//      reliably), and `c-input` reads that channel back.
const hideDetailsResolved = computed(() =>
  host?.hasAttribute('hide-details')
    ? coerceBoolean(host.getAttribute('hide-details'))
    : coerceBoolean(props.hideDetails),
);

// Same quirk for `multiple`: resolve from the stable host attribute first.
const multipleOn = computed(() =>
  host?.hasAttribute('multiple')
    ? coerceBoolean(host.getAttribute('multiple'))
    : coerceBoolean(props.multiple),
);

const dropdownRef = useTemplateRef<
  {
    close: () => void;
    focusItem: (i: number) => void;
    open: () => void;
    selectItem: (i: number) => boolean;
    setStatusText: (t: string) => void;
    updateList: (reset?: boolean) => void;
  } & HTMLElement
>('dropdownRef');

const cInputRef = useTemplateRef<HTMLElement>('cInputRef');

const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

const selectionRef = useTemplateRef<HTMLDivElement>('selectionRef');

// Local mirror of `value` — Stencil mutates its own @Prop; Vue props are
// readonly, so selection updates flow through this ref and out via events.
const value = ref<CSelectValue>(props.value);
watch(
  () => props.value,
  (v) => {
    value.value = v as typeof value.value;
    onValueChanged(v);
  },
);

const currentIndex = ref<null | number>(null);

const dropdownVisible = ref(false);

// ---- multiple-mode selection ---------------------------------------------

type SelectRawValue = CSelectItem | number | string;

// The scalar identity of a picked value: `return-object` items compare by
// their `.value`. Duplicate option values are not distinguishable (as in
// single mode).
const valueOf = (v: SelectRawValue): number | string =>
  typeof v === 'object' && v !== null ? v.value : v;

const rawValues = computed<SelectRawValue[]>(() =>
  multipleOn.value && Array.isArray(value.value)
    ? (value.value as SelectRawValue[])
    : [],
);

// Picked values in pick order (empty outside `multiple` mode).
const selectedValues = computed(() => rawValues.value.map(valueOf));

// `[]` is truthy, so every "is anything selected" site goes through this.
const hasSelection = computed(() =>
  multipleOn.value ? selectedValues.value.length > 0 : !!value.value,
);

const firstSelectedIndex = () =>
  dropdownItems.value.findIndex((item) =>
    selectedValues.value.includes(item.value),
  );

const maxTagsResolved = computed(() =>
  props.maxTags == null || Number(props.maxTags) < 0
    ? Infinity
    : Math.floor(Number(props.maxTags)),
);

const ui = computed(() =>
  select({
    chevronActive: dropdownVisible.value,
    inputHidden: tagsShown.value,
  }),
);

const optionElements = ref<HTMLElement[]>([]);

const optionElementsExist = ref(false);

const hasConsumerPre = ref(false);

const hasConsumerPost = ref(false);

let searchString = '';

let lastKeyPressTime = 0;

let statusDebounce: null | number = null;

const autoId = useId();

const id = computed(() => props.hostId || autoId);

const inputId = computed(
  () =>
    `input_${(props.hostId || props.label || props.placeholder).replace(
      /[^a-zA-Z0-9-_]/g,
      '',
    )}`,
);

// Either the projected <c-option> elements or the `items` prop array.
const dropdownItems = computed<SelectItem[]>(() =>
  optionElementsExist.value
    ? (optionElements.value as unknown as SelectItem[])
    : (props.items as SelectItem[]),
);

// Label of an option by value — its `name`, else its text content (slotted
// <c-option> without `name`), else the raw value so a tag is never blank.
const labelFor = (v: number | string, raw?: SelectRawValue): string => {
  const item = dropdownItems.value.find((i) => i.value === v);

  if (item) {
    const text =
      item.name ?? ((item as unknown as HTMLElement).textContent ?? '').trim();

    return text || String(v);
  }

  if (raw && typeof raw === 'object') return raw.name;

  return String(v);
};

// The picks as `{ label, value }`, in pick order — what the tag row renders.
const selectedOptions = computed(() =>
  rawValues.value.map((raw) => {
    const v = valueOf(raw);

    return { label: labelFor(v, raw), value: v };
  }),
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

// Display name for the current value (mirrors Stencil's `_value` getter).
const displayValue = computed(() => {
  const v = value.value;

  if (multipleOn.value) return '';

  if (!v) return '';

  if (!props.returnObject && !['number', 'string'].includes(typeof v)) {
    console.warn(
      `[C-SELECT] The value should be of type 'number' or 'string' when return-object is not used.`,
    );

    return '';
  }

  const items = dropdownItems.value ?? [];

  if (!props.returnObject) {
    return items.find((item) => item.value === v)?.name ?? '';
  }

  return (
    items.find((item) => item.value === (v as SelectItem).value)?.name ?? ''
  );
});

// What the readonly combobox holds: the single-mode label; in `multiple`
// mode every picked label (the input is visually hidden behind the tags but
// is what assistive technology reads), or the count summary when
// `max-tags="0"` shows no tags.
const inputValue = computed(() => {
  if (!multipleOn.value) return displayValue.value;

  const n = selectedOptions.value.length;

  if (!n) return '';

  return tagsShown.value
    ? selectedOptions.value.map((o) => o.label).join(', ')
    : t.value.selected(n);
});

// ---- value plumbing -----------------------------------------------------

const emitValue = (next: CSelectEvents['update:value']) => {
  value.value = next;
  // changeValue/update:value (non-bubbling) + native `input` (so a plain
  // `v-model` works without `v-control`) + host `value` mirror. The value watch
  // runs onValueChanged/selectOption (visuals-only), so writing the property
  // doesn't loop.
  emitModelValue(host, next);
};

const getSelectionIndex = (search: string) =>
  dropdownItems.value.findIndex((i) =>
    i.name.toLowerCase().startsWith(search.toLowerCase()),
  );

const setCurrentIndex = ({
  name,
  value: v,
}: {
  name: string;
  value: number | string;
}): null | SelectItem => {
  let selection: null | SelectItem = null;
  dropdownItems.value.forEach((item, index) => {
    const selected = item.value === v && item.name === name;

    if (optionElementsExist.value) {
      (item as { selected: boolean } & SelectItem).selected = selected;
    }

    if (selected) {
      currentIndex.value = index;
      selection = item;
    }
  });

  return selection;
};

// `multiple` mode: mirror the selection onto the live <c-option> elements
// (external code may read `.selected`) and let the dropdown re-read them.
const syncMultiple = () => {
  const selected = new Set(selectedValues.value);

  if (optionElementsExist.value) {
    dropdownItems.value.forEach((item) => {
      (item as { selected?: boolean } & SelectItem).selected = selected.has(
        item.value,
      );
    });
  }

  dropdownRef.value?.updateList();
};

// `multiple` mode: tick appends (pick order), untick removes; the whole array
// is emitted. The list stays open — closing is single mode's job.
const toggleValue = ({
  name,
  value: v,
}: {
  name: string;
  value: number | string;
}) => {
  const current = rawValues.value;

  const idx = current.findIndex((item) => valueOf(item) === v);

  const next: SelectRawValue[] =
    idx >= 0
      ? current.filter((_, i) => i !== idx)
      : [...current, props.returnObject ? { name, value: v } : v];

  emitValue(next as CSelectValue);
  syncMultiple();
};

// A tag's close button / Backspace: remove one pick and keep focus in the
// field (the removed button can no longer hold it).
const removeValue = (v: number | string) => {
  if (!selectedValues.value.includes(v)) return;

  toggleValue({ name: '', value: v });
  requestAnimationFrame(() => inputRef.value?.focus());
};

const selectOption = ({
  name,
  value: v,
}: {
  name: string;
  value: number | string;
}) => {
  // Whether this value change came from the user interacting with this select
  // (dropdown open, or focus already inside the component) rather than a
  // programmatic/initial value. Capture it before close() can move focus.
  const fromInteraction =
    dropdownVisible.value || !!host?.matches(':focus-within');

  dropdownRef.value?.close();

  const selection = setCurrentIndex({ name, value: v });

  if (optionElementsExist.value && props.optionAsSelection && selection) {
    const clone = (selection as unknown as HTMLElement).cloneNode(true);
    selectionRef.value?.classList.add('c-input-menu__selection--show');
    selectionRef.value?.replaceChildren(clone);
  }

  dropdownRef.value?.updateList();

  // Return focus to the input only when the user was interacting. Focusing on
  // a programmatic value change — e.g. an initial v-model value arriving after
  // the custom element upgrades — steals focus and scrolls the page to the
  // select on load.
  if (fromInteraction) inputRef.value?.focus();
};

const setValue = ({
  name,
  value: v,
}: {
  name: string;
  value: number | string;
}) => {
  emitValue(props.returnObject ? { name, value: v } : v);
};

const onValueChanged = (v: unknown) => {
  // `multiple`: a value change never closes the list or moves focus — just
  // mirror the selection (`option-as-selection` does not apply).
  if (multipleOn.value) {
    syncMultiple();

    return;
  }

  if (!v) {
    if (props.optionAsSelection) selectionRef.value?.replaceChildren();

    return;
  }

  selectOption(
    props.returnObject
      ? (v as { name: string; value: string })
      : { name: v as string, value: v as string },
  );
};

// ---- dropdown events ----------------------------------------------------

const onSelectOption = (event: Event) => {
  const detail = (event as CustomEvent<{ name: string; value: string }>).detail;

  if (multipleOn.value) {
    // Keep the highlight on the toggled row (the dropdown re-focuses it) and
    // toggle; the list stays open.
    const idx = dropdownItems.value.findIndex((i) => i.value === detail.value);
    currentIndex.value = idx >= 0 ? idx : null;
    toggleValue(detail);

    return;
  }

  const v = value.value;

  if (props.returnObject && (v as SelectItem)?.value === detail.value) {
    dropdownRef.value?.close();
  }

  if (!props.returnObject && v === detail.value) {
    dropdownRef.value?.close();
  }

  setValue(detail);
};

const onDropdownStateChange = (event: Event) => {
  dropdownVisible.value = (event as CustomEvent<boolean>).detail;
};

// ---- interaction --------------------------------------------------------

const toggleDropdown = (event: Event) => {
  event.stopPropagation();

  if (dropdownVisible.value) {
    dropdownRef.value?.close();

    return;
  }

  dropdownRef.value?.open();
};

const onButtonKeyDown = (src: 'chevron' | 'reset', event: KeyboardEvent) => {
  event.stopPropagation();

  if (event.key !== 'Tab') event.preventDefault();

  if ([' ', 'Enter'].includes(event.key)) {
    if (src === 'chevron') {
      toggleDropdown(event);

      return;
    }

    onReset(event);
    requestAnimationFrame(() => inputRef.value?.focus());
  }
};

// A click on a tag's close button must not bubble into c-input's click
// handler and open the list; a click on the tag body keeps bubbling so it
// opens the list like any click in the field.
const onTagsClick = (event: Event) => {
  if (
    event.composedPath().some((n) => (n as Element).tagName === 'C-ICON-BUTTON')
  ) {
    event.stopPropagation();
  }
};

// The host-level keydown handler would `preventDefault` Space / Enter (and
// re-select the highlighted row) — let a focused close button's native
// activation through. Escape / Tab / arrows keep bubbling.
const onTagsKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
};

const onReset = (event: Event) => {
  event.stopPropagation();
  emitValue(multipleOn.value ? [] : null);
  currentIndex.value = null;
  selectionRef.value?.classList.remove('c-input-menu__selection--show');
  selectionRef.value?.replaceChildren();
  inputRef.value?.focus();
  dropdownRef.value?.updateList(true);
};

const onInputClick = () => {
  if (!props.disabled) dropdownRef.value?.open();
};

const onUpdateInput = () => {
  dropdownRef.value?.open();
  dropdownRef.value?.updateList();
};

const updateStatusText = () => {
  if (statusDebounce !== null) {
    clearTimeout(statusDebounce);
    statusDebounce = null;
  }

  statusDebounce = window.setTimeout(() => {
    const items = dropdownItems.value;

    let statusText = '';

    if (currentIndex.value === null) {
      statusText = items.length
        ? `${items.length} option${items.length !== 1 ? 's' : ''} available`
        : 'No options available';
    }

    const ending = items.length
      ? ', navigate using the up and down arrows'
      : '';
    dropdownRef.value?.setStatusText(statusText + ending);
    statusDebounce = null;
  }, 1400);
};

const onInputFocus = () => {
  if (props.disabled) return;
  updateStatusText();
};

// ---- keyboard navigation (host-level) -----------------------------------

// Seed the highlight from the current selection when the list opens from the
// keyboard: the (first) picked option, else nothing.
const seedCurrentIndexFromSelection = () => {
  if (!hasSelection.value) return;

  if (multipleOn.value) {
    const idx = firstSelectedIndex();
    currentIndex.value = idx >= 0 ? idx : null;

    return;
  }

  currentIndex.value = getSelectionIndex(displayValue.value);
};

// `multiple`: the row a key toggles is the one holding DOM focus (arrow
// navigation and clicks both focus rows), else the tracked highlight.
const toggleRowFromKey = (event: KeyboardEvent) => {
  const target = event.composedPath()[0];

  if (target instanceof HTMLElement && target.matches('li[role="option"]')) {
    target.click();

    return;
  }

  if (currentIndex.value !== null) {
    dropdownRef.value?.selectItem(currentIndex.value);
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  const alphanumeric = /^[0-9a-zA-Z ]+$/;

  const items = dropdownItems.value;

  if (props.disabled) return;

  // `multiple`: Backspace on the readonly field input removes the last pick.
  // Only when the input itself is the target (the real target, not the
  // host-retargeted one) — never a focused option row or a tag button.
  if (event.key === 'Backspace') {
    if (
      multipleOn.value &&
      event.composedPath()[0] === inputRef.value &&
      selectedOptions.value.length
    ) {
      event.preventDefault();
      removeValue(
        selectedOptions.value[selectedOptions.value.length - 1].value,
      );
    }

    return;
  }

  if (event.key.match(alphanumeric) && event.key.length === 1) {
    if (!dropdownVisible.value) dropdownRef.value?.open();
    requestAnimationFrame(() => {
      const now = performance.now();

      if (now - lastKeyPressTime > 3000) {
        searchString = event.key;
      } else {
        searchString += event.key;
      }

      lastKeyPressTime = now;

      const selectionIndex = getSelectionIndex(searchString);
      currentIndex.value = selectionIndex >= 0 ? selectionIndex : null;
    });
  }

  if (event.key === 'Escape') {
    // Consume the Escape only when it actually closes the dropdown, so an
    // enclosing modal (whose stack controller skips defaultPrevented events)
    // stays open; a second press then reaches the modal.
    if (dropdownVisible.value) event.preventDefault();

    dropdownRef.value?.close();
    inputRef.value?.focus();

    if (!hasSelection.value) currentIndex.value = null;

    return;
  }

  if (event.key === 'Tab') {
    dropdownRef.value?.close();
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();

    if (!items.length) return;

    if (!dropdownVisible.value) {
      dropdownRef.value?.open();
      seedCurrentIndexFromSelection();

      return;
    }

    requestAnimationFrame(() => {
      currentIndex.value =
        currentIndex.value === null
          ? 0
          : Math.min(currentIndex.value + 1, items.length - 1);
      dropdownRef.value?.focusItem(currentIndex.value);
    });
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();

    if (currentIndex.value === 0) {
      dropdownRef.value?.close();
      inputRef.value?.focus();
    }

    if (!dropdownVisible.value) {
      dropdownRef.value?.open();
      seedCurrentIndexFromSelection();

      return;
    }

    currentIndex.value =
      currentIndex.value === null
        ? items.length - 1
        : Math.max(currentIndex.value - 1, 0);
    dropdownRef.value?.focusItem(currentIndex.value);
  }

  if (event.key === ' ') {
    event.preventDefault();

    // `multiple`: Space toggles the row (the listbox convention); single mode
    // keeps Enter as the only commit key.
    if (multipleOn.value && dropdownVisible.value) toggleRowFromKey(event);
  }

  if (event.key === 'Enter') {
    event.preventDefault();

    if (multipleOn.value) {
      // Closed: open the list instead of re-clicking (and silently unticking)
      // the remembered row; open: toggle the row.
      if (!dropdownVisible.value) {
        dropdownRef.value?.open();
        seedCurrentIndexFromSelection();
      } else {
        toggleRowFromKey(event);
      }

      return;
    }

    if (currentIndex.value === null) return;
    dropdownRef.value?.selectItem(currentIndex.value);
  }

  if (event.key === 'Home' && dropdownVisible.value) {
    currentIndex.value = 0;
  }

  if (event.key === 'End' && dropdownVisible.value) {
    currentIndex.value = items.length - 1;
  }
};

// ---- public method ------------------------------------------------------

/**
 * Reset select state
 *
 * @seeded from csc-ui — verify
 */
const reset = () => {
  emitValue(multipleOn.value ? [] : null);
  dropdownRef.value?.updateList(true);
};

defineExpose({ reset });

// ---- slotted <c-option> discovery ---------------------------------------

// Parts exported through the inner c-dropdown. The dropdown renders CLONES of
// the consumer's <c-option> markup inside its own shadow root, so the
// consumer's page styles can't reach that content; forwarding every `part`
// name found inside the options lets `c-select::part(<name>)` style it.
// The static `exportparts="menu, list, item"` in the template is the
// verifiable contract; the consumer names are appended imperatively (Vue never
// re-patches a static attribute, so the extension survives re-renders).
const STATIC_EXPORTED_PARTS = ['menu', 'list', 'item', 'indicator', 'mark'];

const syncExportedParts = (extra: string[]) => {
  const el = dropdownRef.value as unknown as HTMLElement | null;

  if (!el || typeof el.setAttribute !== 'function') return;

  el.setAttribute(
    'exportparts',
    [...STATIC_EXPORTED_PARTS, ...extra].join(', '),
  );
};

const refreshOptions = () => {
  if (!host) return;

  const options = Array.from(
    host.querySelectorAll('c-option'),
  ) as HTMLElement[];
  optionElements.value = options;

  syncExportedParts(
    Array.from(
      new Set(
        Array.from(host.querySelectorAll('c-option [part]')).flatMap((el) =>
          (el.getAttribute('part') ?? '').split(/\s+/).filter(Boolean),
        ),
      ),
    )
      .filter((name) => !STATIC_EXPORTED_PARTS.includes(name))
      .sort(),
  );

  if (options.length && !optionElementsExist.value) {
    optionElementsExist.value = true;
  }

  hasConsumerPre.value = !!host.querySelector(':scope > [slot="pre"]');
  hasConsumerPost.value = !!host.querySelector(':scope > [slot="post"]');

  type OptionEl = {
    name: string;
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
      emitValue(
        picked.map((o) =>
          props.returnObject ? { name: o.name, value: o.value } : o.value,
        ) as CSelectValue,
      );
    }

    return;
  }

  // `selected` may arrive as `""` (Boolean attribute) — coerce, never test
  // by truthiness.
  const selection = (options as OptionEl[]).find((o) =>
    coerceBoolean(o.selected ?? o.getAttribute('selected')),
  );

  if (selection) {
    emitValue(
      props.returnObject
        ? { name: selection.name, value: selection.value }
        : selection.value,
    );
  }
};

let childObserver: MutationObserver | null = null;

onMounted(() => {
  // Guarantee the dropdown has its parent reference even if the template
  // property bind didn't land before the child mounted.
  if (dropdownRef.value && host) {
    (dropdownRef.value as { parent?: HTMLElement } & HTMLElement).parent = host;
    dropdownRef.value.addEventListener('selectOption', onSelectOption);
    dropdownRef.value.addEventListener(
      'dropdownStateChange',
      onDropdownStateChange,
    );
  }

  host?.addEventListener('keydown', handleKeyDown, { passive: false });

  refreshOptions();

  if (host && typeof MutationObserver !== 'undefined') {
    childObserver = new MutationObserver(refreshOptions);
    childObserver.observe(host, { childList: true, subtree: true });
  }

  // componentDidLoad: seed current index from an initial value.
  if (multipleOn.value) {
    syncMultiple();
  } else if (value.value) {
    const selection = dropdownItems.value.find((item) =>
      props.returnObject
        ? item.name === (value.value as SelectItem).name &&
          item.value === (value.value as SelectItem).value
        : item.value === value.value,
    );

    if (selection) {
      setCurrentIndex({
        name: selection.name,
        value: selection.value,
      });
    }
  }
});

onBeforeUnmount(() => {
  childObserver?.disconnect();
  host?.removeEventListener('keydown', handleKeyDown);

  if (statusDebounce !== null) clearTimeout(statusDebounce);
  dropdownRef.value?.removeEventListener('selectOption', onSelectOption);
  dropdownRef.value?.removeEventListener(
    'dropdownStateChange',
    onDropdownStateChange,
  );
});
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. The select's internal regions (content row, readonly input, chevron,
  selection overlay) are styled by the `tv` config above against global design
  tokens. What remains here:
    - The host box: `:host{display:block;cursor:text}` overrides the global
      `:host{display:contents}` so the field is a real box hosting the
      light-DOM c-input. Utilities can't target the host.
      The former `--c-input-*` theming bridges are all dropped: c-input is now
      on tv and no longer reads them. The floating label therefore
      uses c-input's own default colour (tertiary-600) — a standard floating-
      label look; re-pinning it isn't possible via `::part()` (c-input sits two
      shadow boundaries deep, inside c-dropdown) and a new override var would
      violate the `::part()`-only customization rule, so the default is
      accepted.
    - `.c-input__content slot{display:none}`: a `<slot>` is a shadow node Vue
      renders with no class hook; the projected <c-option> data source must
      never paint.
    - `.c-input-menu__selection--show`: shown imperatively (JS toggles this
      literal class) and read by the `:has()` rule — the visible rich-selection
      overlay, recoloured to the active colour.
    - The `:has()` rule hiding the duplicate readonly input in
      option-as-selection mode, and `input::placeholder` (a native
      pseudo-element) — neither is expressible as a utility on this element.
  Authored against global design tokens only.
-->
<style>
:host {
  display: block;
  cursor: text;
}

/* The default slot only carries the <c-option> data source — never paint it. */
.c-input__content slot {
  display: none;
}

/* option-as-selection mode: the rich <c-option> clone is the visible value, so
 * reveal the overlay and recolour it to the active colour. */
.c-input-menu__selection--show {
  align-items: center;
  display: flex;
  width: 100%;
  color: var(--c-primary);
}

/* …and hide the readonly text input that would otherwise sit beside it. */
.c-input-menu__input:has(.c-input-menu__selection--show) input.c-input__input {
  display: none;
}

input.c-input__input::placeholder {
  color: var(--c-on-surface-muted);
  opacity: 1;
}
</style>
