<template>
  <c-dropdown
    :id="`${id}-dropdown`"
    ref="dropdownRef"
    :dropdown-item-type="optionElementsExist ? 'option' : 'item'"
    :host-id="`${id}-dropdown`"
    :index="currentIndex"
    :items="dropdownItems"
    :items-per-page
    :parent="host"
    type="select"
  >
    <c-input
      ref="cInputRef"
      :active="dropdownVisible"
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
      @click="onInputClick"
    >
      <span v-if="hasConsumerPre" slot="pre" style="display: contents">
        <slot name="pre" />
      </span>

      <div :class="ui.content()" class="c-input__content">
        <div :class="ui.inputWrap()" class="c-input-menu__input">
          <input
            ref="inputRef"
            :aria-expanded="dropdownVisible"
            :aria-owns="inputId + '-items'"
            :class="ui.input()"
            :disabled
            :name="name || undefined"
            :value="displayValue"
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
        </div>

        <c-spinner v-if="loading" :size="20" color="var(--c-primary)" />

        <c-icon-button
          v-else-if="value && clearable"
          :class="ui.iconButton()"
          :disabled
          aria-label=""
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

<script setup lang="ts">
/**
 * @slot default - Use c-option elements only
 * @slot pre - Leading content forwarded to the inner c-input, rendered before the select's value
 * @slot post - Trailing content forwarded to the inner c-input, rendered after the select's controls
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-option
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

import type { CSelectItem } from '../../types';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelValue } from '../../shared/emitModelValue';

/** Events dispatched by `<c-select>`. */
interface CSelectEvents {
  /**
   * Fired when the selection changes (an option is picked or the value is
   * cleared), carrying the new value — the option's value, or the whole
   * `{ name, value }` item when `return-object` is set; `null` when cleared.
   */
  changeValue: CSelectItem | null | number | string;
  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;
  /**
   * Fired alongside `changeValue` with the same detail — the `v-model`
   * contract.
   */
  'update:value': CSelectItem | null | number | string;
}

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004): the slots are
 * the select's internal regions (the flex content row, the readonly combobox
 * `input`, the rich-selection overlay, the chevron toggle). The
 * `chevronActive` / `selectionShown` variants replace the
 * `.c-input-menu__chevron--active` / `.c-input-menu__selection--show` classes.
 * The per-component `--c-select-*` override-variable layer is dropped in favour
 * of the global design tokens (`text-primary-600` for the active colour,
 * `text-[var(--c-text-body)]` for text, `text-tertiary-500` for placeholder);
 * consumer customization is via `::part()` (ADR-0006), there is no `override`
 * prop.
 *
 * Child recolouring (cross-component contract): the chevron/clear `c-icon` and
 * the loading `c-spinner` inherit colour from `currentColor`, so a `text-*`
 * utility on their wrapper themes them — no `--c-icon-*` / `--c-spinner-*` vars.
 * The wrapped `c-input` is not yet on tv and still reads its `--c-input-*`
 * vars; its defaults already match the select defaults except for the floating
 * label colour, so a single `--c-input-label-color` bridge remains in the
 * escape-hatch <style> below (ADR-0007), alongside the host box, the projected
 * `<slot>` hiding and the `:has()`/`::placeholder` selectors utilities can't
 * express.
 */
const select = tv({
  defaultVariants: { chevronActive: false },
  slots: {
    chevron:
      'aspect-square -mr-1.5 rotate-0 transition-transform duration-300 ease-in-out',
    content: 'flex items-center w-full',
    // The clear button / spinner wrappers share the icon-button box metrics.
    iconButton: 'aspect-square -mr-1.5',
    input:
      'max-h-8 py-2 bg-transparent border-0 text-on-surface flex-[1_1_auto] [font-family:var(--c-font-family)] text-base leading-5 max-w-full min-w-0 w-full cursor-pointer outline-none focus:outline-none active:outline-none placeholder:text-on-surface-muted placeholder:opacity-100',
    inputWrap: 'w-full flex justify-items-stretch',
    selection: 'hidden pointer-events-none',
  },
  variants: {
    chevronActive: { true: { chevron: 'rotate-180' } },
  },
});

// Port of c-select (Stencil). Thin orchestrator over c-dropdown + c-input:
// owns the readonly combobox input, the chevron/clear buttons, keyboard
// navigation and the value contract, and drives the dropdown via its
// exposed methods. Form participation via ElementInternals (Stencil's
// @AttachInternals) is intentionally dropped to match the rest of the
// csc-ui-next form components, which rely on event-based binding + v-control.

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

interface CSelectProps {
  /** Make the selected value clearable */
  clearable?: boolean;
  /** Disable the input */
  disabled?: boolean;
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
  /**
   * Custom validation message
   *
   * @freeform
   */
  validation?: string;
  /** Selected value (scalar, or object when return-object is set) */
  value?: CSelectItem | null | number | string;
}

const props = withDefaults(defineProps<CSelectProps>(), {
  clearable: false,
  disabled: false,
  hideDetails: false,
  hint: '',
  hostId: '',
  items: () => [],
  itemsPerPage: 6,
  label: '',
  labelOnTop: false,
  loading: false,
  name: '',
  optionAsSelection: false,
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
const value = ref<null | number | SelectItem | string>(props.value);
watch(
  () => props.value,
  (v) => {
    value.value = v as typeof value.value;
    onValueChanged(v);
  },
);

const currentIndex = ref<null | number>(null);

const dropdownVisible = ref(false);

const ui = computed(() => select({ chevronActive: dropdownVisible.value }));

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

// Display name for the current value (mirrors Stencil's `_value` getter).
const displayValue = computed(() => {
  const v = value.value;

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

const onReset = (event: Event) => {
  event.stopPropagation();
  emitValue(null);
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

const handleKeyDown = (event: KeyboardEvent) => {
  const alphanumeric = /^[0-9a-zA-Z ]+$/;

  const items = dropdownItems.value;

  if (props.disabled) return;

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

    if (!value.value) currentIndex.value = null;

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

      if (value.value)
        currentIndex.value = getSelectionIndex(displayValue.value);

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

      if (value.value)
        currentIndex.value = getSelectionIndex(displayValue.value);

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
  }

  if (event.key === 'Enter') {
    event.preventDefault();

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
  emitValue(null);
  dropdownRef.value?.updateList(true);
};

defineExpose({ reset });

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

  hasConsumerPre.value = !!host.querySelector(':scope > [slot="pre"]');
  hasConsumerPost.value = !!host.querySelector(':scope > [slot="post"]');

  const selection = options.find(
    (o) => (o as { selected?: boolean } & HTMLElement).selected,
  ) as ({ name: string; value: number | string } & HTMLElement) | undefined;

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
  if (value.value) {
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
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The select's internal regions (content row, readonly input, chevron,
  selection overlay) are styled by the `tv` config above against global design
  tokens. What remains here:
    - The host box: `:host{display:block;cursor:text}` overrides the global
      `:host{display:contents}` so the field is a real box hosting the
      light-DOM c-input. Utilities can't target the host.
      The former `--c-input-*` theming bridges are all dropped: c-input is now
      on tv (ADR-0004) and no longer reads them. The floating label therefore
      uses c-input's own default colour (tertiary-600) — a standard floating-
      label look; re-pinning it isn't possible via `::part()` (c-input sits two
      shadow boundaries deep, inside c-dropdown) and a new override var would
      violate ADR-0006, so the default is accepted.
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
