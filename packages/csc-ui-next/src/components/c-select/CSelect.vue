<template>
  <c-dropdown
    ref="dropdownRef"
    :parent="host"
    :id="`${id}-dropdown`"
    :host-id="`${id}-dropdown`"
    :index="currentIndex"
    :items-per-page="itemsPerPage"
    :dropdown-item-type="optionElementsExist ? 'option' : 'item'"
    :items="dropdownItems"
    type="select"
  >
    <c-input
      ref="cInputRef"
      :active="dropdownVisible"
      :filled="!!value"
      :disabled="disabled"
      :hide-details="hideDetails"
      :hint="hint"
      :label="label"
      :label-on-top="labelOnTop"
      :required="required"
      :shadow="shadow"
      :valid="valid"
      :validation="validation"
      :input-id="inputId"
      @click="onInputClick"
    >
      <span
        v-if="hasConsumerPre"
        slot="pre"
        style="display: contents"
      ><slot name="pre" /></span>

      <div class="c-input__content">
        <div class="c-input-menu__input">
          <input
            ref="inputRef"
            type="text"
            readonly
            :aria-expanded="String(dropdownVisible)"
            :aria-owns="inputId + '-items'"
            aria-autocomplete="list"
            autocomplete="off"
            class="c-input__input"
            role="combobox"
            :value="displayValue"
            :name="name || undefined"
            :disabled="disabled"
            @input="onUpdateInput"
            @focus="onInputFocus"
          >

          <div ref="selectionRef" class="c-input-menu__selection" />
        </div>

        <c-spinner
          v-if="loading"
          :size="20"
          color="var(--_c-select-active-color)"
        />

        <c-icon-button
          v-else-if="value && clearable"
          aria-label=""
          size="x-small"
          :disabled="disabled"
          text
          @click="onReset"
          @keydown="onButtonKeyDown('reset', $event)"
        >
          <c-icon :path="mdiClose" :size="20" />
        </c-icon-button>

        <c-icon-button
          v-else
          size="x-small"
          class="c-input-menu__chevron"
          :class="{ 'c-input-menu__chevron--active': dropdownVisible }"
          :disabled="disabled"
          text
          @click="toggleDropdown"
          @keydown="onButtonKeyDown('chevron', $event)"
        >
          <c-icon :path="mdiChevronDown" :size="24" />
        </c-icon-button>

        <!-- Consumer's <c-option> elements: data source only, hidden via
             `.c-input__content slot { display: none }`. The dropdown renders
             clones; we read the originals through host.querySelectorAll. -->
        <slot />
      </div>

      <span
        v-if="hasConsumerPost"
        slot="post"
        style="display: contents"
      ><slot name="post" /></span>
    </c-input>
  </c-dropdown>
</template>

<script setup lang="ts">
import { mdiChevronDown, mdiClose } from '@mdi/js';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  watch,
} from 'vue';

// Port of c-select (Stencil). Thin orchestrator over c-dropdown + c-input:
// owns the readonly combobox input, the chevron/clear buttons, keyboard
// navigation and the value contract, and drives the dropdown via its
// exposed methods. Form participation via ElementInternals (Stencil's
// @AttachInternals) is intentionally dropped to match the rest of the
// csc-ui-next form components, which rely on event-based binding + v-control.

type SelectItem = {
  name: string;
  value: string | number;
  disabled?: boolean;
  selected?: boolean;
};

// The single root is the internal <c-dropdown>; every prop it needs is bound
// explicitly below. Fallthrough attrs a consumer puts on <c-select> (notably
// `style`, plus `class` / `v-model`) therefore have no business on c-dropdown
// — and because c-dropdown renders a fragment they'd trip the "Extraneous
// non-props attributes (style) … renders fragment" warning. Opt out so those
// attrs stay on the c-select host element (which is `display: block`, so
// `style`/`class` apply there as the consumer intends) instead of leaking in.
defineOptions({ inheritAttrs: false });

const props = defineProps({
  /** Dropdown items (when not using <c-option> elements) */
  items: { type: Array, default: () => [] },
  /** Selected value (scalar, or object when return-object is set) */
  value: { type: [String, Number, Object], default: null },
  /** Id of the element */
  hostId: { type: String, default: '' },
  /** Make the selected value clearable */
  clearable: { type: Boolean, default: false },
  /** Disable the input */
  disabled: { type: Boolean, default: false },
  /** Element label */
  label: { type: String, default: '' },
  /** Label on top of the input */
  labelOnTop: { type: Boolean, default: false },
  /** Input field name */
  name: { type: String, default: '' },
  /** Placeholder text */
  placeholder: { type: String, default: '' },
  /** Hide the hint and error messages */
  hideDetails: { type: Boolean, default: false },
  /** Hint text for the input */
  hint: { type: String, default: '' },
  /** Show loading state */
  loading: { type: Boolean, default: false },
  /** Show required validation */
  required: { type: Boolean, default: false },
  /** Set the validity of the input */
  valid: { type: Boolean, default: true },
  /** Manual validation */
  validate: { type: Boolean, default: false },
  /** Validate the input on blur */
  validateOnBlur: { type: Boolean, default: false },
  /** Custom validation message */
  validation: { type: String, default: 'Required field' },
  /** Shadow variant */
  shadow: { type: Boolean, default: false },
  /** Return object instead of value */
  returnObject: { type: Boolean, default: false },
  /** Items per page before adding scroll */
  itemsPerPage: { type: Number, default: 6 },
  /** Display the option as selection (only with <c-option> elements) */
  optionAsSelection: { type: Boolean, default: false },
});

const host = useHost();

const dropdownRef = ref<
  | (HTMLElement & {
      open: () => void;
      close: () => void;
      updateList: (reset?: boolean) => void;
      focusItem: (i: number) => void;
      selectItem: (i: number) => boolean;
      setStatusText: (t: string) => void;
    })
  | null
>(null);
const cInputRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const selectionRef = ref<HTMLDivElement | null>(null);

// Local mirror of `value` — Stencil mutates its own @Prop; Vue props are
// readonly, so selection updates flow through this ref and out via events.
const value = ref<string | number | SelectItem | null>(props.value);
watch(
  () => props.value,
  (v) => {
    value.value = v as typeof value.value;
    onValueChanged(v);
  },
);

const currentIndex = ref<number | null>(null);
const dropdownVisible = ref(false);
const optionElements = ref<HTMLElement[]>([]);
const optionElementsExist = ref(false);

const hasConsumerPre = ref(false);
const hasConsumerPost = ref(false);

let uid = 0;
let searchString = '';
let lastKeyPressTime = 0;
let statusDebounce: number | null = null;

let _uniqueId = 0;
const id = computed(() => props.hostId || `select_${_uniqueId}`);

const inputId = computed(
  () =>
    'input_' +
    (props.hostId || props.label || props.placeholder).replace(
      /[^a-zA-Z0-9-_]/g,
      '',
    ),
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
  return items.find((item) => item.value === (v as SelectItem).value)?.name ?? '';
});

// ---- value plumbing -----------------------------------------------------

const dispatch = (name: string, detail: unknown) =>
  host?.dispatchEvent(new CustomEvent(name, { detail, bubbles: false }));

const emitValue = (next: string | number | SelectItem | null) => {
  value.value = next;
  // changeValue drives v-control / v-model; update:value mirrors the other
  // csc-ui-next form components.
  dispatch('changeValue', next);
  dispatch('update:value', next);
};

const getSelectionIndex = (search: string) =>
  dropdownItems.value.findIndex((i) =>
    i.name.toLowerCase().startsWith(search.toLowerCase()),
  );

const setCurrentIndex = ({
  value: v,
  name,
}: {
  value: string | number;
  name: string;
}): SelectItem | null => {
  let selection: SelectItem | null = null;
  dropdownItems.value.forEach((item, index) => {
    const selected = item.value === v && item.name === name;
    if (optionElementsExist.value) {
      (item as SelectItem & { selected: boolean }).selected = selected;
    }
    if (selected) {
      currentIndex.value = index;
      selection = item;
    }
  });
  return selection;
};

const selectOption = ({
  value: v,
  name,
}: {
  value: string | number;
  name: string;
}) => {
  dropdownRef.value?.close();
  const selection = setCurrentIndex({ name, value: v });

  if (optionElementsExist.value && props.optionAsSelection && selection) {
    const clone = (selection as unknown as HTMLElement).cloneNode(true);
    selectionRef.value?.classList.add('c-input-menu__selection--show');
    selectionRef.value?.replaceChildren(clone);
  }

  dropdownRef.value?.updateList();
  inputRef.value?.focus();
};

const setValue = ({
  value: v,
  name,
}: {
  value: string | number;
  name: string;
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
  if (['Enter', ' '].includes(event.key)) {
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
      if (value.value) currentIndex.value = getSelectionIndex(displayValue.value);
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
      if (value.value) currentIndex.value = getSelectionIndex(displayValue.value);
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
    (o) => (o as HTMLElement & { selected?: boolean }).selected,
  ) as (HTMLElement & { name: string; value: string | number }) | undefined;
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
  _uniqueId += 1;
  uid += 1;

  // Guarantee the dropdown has its parent reference even if the template
  // property bind didn't land before the child mounted.
  if (dropdownRef.value && host) {
    (dropdownRef.value as HTMLElement & { parent?: HTMLElement }).parent = host;
    dropdownRef.value.addEventListener('selectOption', onSelectOption);
    dropdownRef.value.addEventListener('dropdownStateChange', onDropdownStateChange);
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
  dropdownRef.value?.removeEventListener('dropdownStateChange', onDropdownStateChange);
});
</script>

<style>
:host {
  /**
   * @prop --c-select-active-color: Active select color
   * @prop --c-select-inactive-color: Inactive select color
   * @prop --c-select-background-color: Inactive select background color
   * @prop --c-select-text-color: Select text color
   * @prop --c-select-placeholder-color: Select placeholder color
   * @prop --c-select-option-background-color: Select option background color
   * @prop --c-select-option-background-color-hover: Select option hover background color
   * @prop --c-select-option-text-color: Select option text color
   */
  --_c-select-active-color: var(--c-select-active-color, var(--c-primary-600));
  --_c-select-inactive-color: var(
    --c-select-inactive-color,
    var(--c-tertiary-600)
  );
  --_c-select-background-color: var(
    --c-select-background-color,
    var(--c-transparent)
  );
  --_c-select-text-color: var(--c-select-text-color, var(--c-text-body));
  --_c-select-placeholder-color: var(
    --c-select-placeholder-color,
    var(--c-tertiary-500)
  );
  --_c-select-option-background-color: var(
    --c-select-option-background-color,
    var(--c-white)
  );
  --_c-select-option-background-color-hover: var(
    --c-select-option-background-color-hover,
    var(--c-primary-100)
  );
  --_c-select-option-text-color: var(
    --c-select-option-text-color,
    var(--c-text-body)
  );
  --_c-select-label-color: var(
    --c-select-label-color,
    var(--_c-select-text-color)
  );

  /* Bridge select tokens into the c-input custom properties. */
  --c-input-active-color: var(--_c-select-active-color);
  --c-input-inactive-color: var(--_c-select-inactive-color);
  --c-input-background-color: var(--_c-select-background-color);
  --c-input-text-color: var(--_c-select-text-color);
  --c-input-label-color: var(--_c-select-label-color);
  --c-input-placeholder-color: var(--_c-select-placeholder-color);

  display: block;
  cursor: text;
}

.c-input__content {
  align-items: center;
  display: flex;
  width: 100%;
}

/* The default slot only carries the <c-option> data source — never paint it. */
.c-input__content slot {
  display: none;
}

.c-input__content c-icon-button {
  aspect-ratio: 1;
  margin-right: -6px;
}

.c-input-menu__input {
  width: 100%;
  display: flex;
  justify-items: stretch;
}

.c-input-menu__selection {
  display: none;
  pointer-events: none;
}

.c-input-menu__selection--show {
  align-items: center;
  display: flex;
  width: 100%;
  color: var(--_c-select-active-color);
}

/* option-as-selection mode: the rich <c-option> clone in `.c-input-menu__selection`
 * is the visible value, so hide the readonly text input that would otherwise
 * sit beside it as a duplicate label. */
.c-input-menu__input:has(.c-input-menu__selection--show) input.c-input__input {
  display: none;
}

.c-input-menu__chevron {
  transform: rotate(0deg);
  transition: transform 0.3s ease-in-out;
}

.c-input-menu__chevron--active {
  transform: rotate(180deg);
}

input.c-input__input {
  max-height: 32px;
  padding: 8px 0;
  background-color: transparent;
  border: none;
  color: var(--_c-select-text-color);
  flex: 1 1 auto;
  font-family: var(--c-font-family);
  font-size: 16px;
  line-height: 20px;
  max-width: 100%;
  min-width: 0;
  width: 100%;
  cursor: pointer;
}

input.c-input__input:focus,
input.c-input__input:active {
  outline: none;
}

input.c-input__input::placeholder {
  color: var(--_c-select-placeholder-color);
  opacity: 1;
}
</style>
