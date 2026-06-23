<template>
  <!-- Closed state: the consumer's <c-input> lives in the default slot,
       rendered inline where the field sits. On open we move that c-input
       into the dialog (`input-top`/`input-bottom`) and reveal `dummyEl`
       to hold the field's place in the flow so the page doesn't jump.
       Authored as the unnamed default slot because Vue's defineCustomElement
       collapses `<slot name="default">` to an unnamed native <slot> anyway. -->
  <slot />

  <div ref="dummyEl" class="dummy" />

  <dialog
    ref="dialogEl"
    tabindex="-1"
    :class="{ mobile: isMobile }"
    @cancel="close"
  >
    <div @click.stop>
      <div
        :id="'announce-' + hostId"
        class="visuallyhidden"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ statusText }}
      </div>

      <div class="input-top-wrapper">
        <slot name="input-top" />
      </div>

      <ul
        ref="listEl"
        :id="`${hostId}--results`"
        role="listbox"
        :aria-expanded="String(isOpen)"
        :class="{ active: isOpen, mobile: isMobile }"
        tabindex="-1"
      >
        <!-- Empty states (autocomplete only) -->
        <li v-if="!itemsArray.length && minimumQueryItem" class="info">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="mdiInformation" />
          </svg>
          {{ minimumQueryItem }}
        </li>
        <li v-else-if="!itemsArray.length && emptyItem" class="info">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="mdiAlert" />
          </svg>
          {{ emptyItem }}
        </li>

        <!-- Option mode: <c-option> elements projected by the consumer.
             Render each option's outerHTML, mirroring Stencil. -->
        <template v-else-if="dropdownItemType === 'option'">
          <li
            v-for="(opt, i) in itemsArray"
            :key="`option-${i}`"
            tabindex="-1"
            role="option"
            :aria-set-size="String(itemsArray.length)"
            :aria-pos-in-set="String(i + 1)"
            :aria-selected="String(!!opt.selected)"
            :class="{ disabled: !!opt.disabled }"
            :data-name="opt.name"
            @click="onSelect(opt, $event)"
            v-html="optionHtml(opt)"
          />
        </template>

        <!-- Item mode: plain {name,value,disabled} objects. -->
        <template v-else>
          <li
            v-for="(item, i) in itemsArray"
            :key="`item-${i}`"
            tabindex="-1"
            role="option"
            :aria-set-size="String(itemsArray.length)"
            :aria-pos-in-set="String(i + 1)"
            :aria-selected="String(index === i)"
            :class="{ disabled: !!item.disabled }"
            :title="item.name"
            :data-name="item.name"
            @click="onSelect(item, $event)"
          >
            <svg
              v-if="index === i"
              class="check"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path :d="mdiCheck" />
            </svg>
            <span v-html="highlightMatchingText(item.name)" />
          </li>
        </template>
      </ul>

      <div
        class="input-bottom-wrapper"
        :class="{ active: openedOnTop }"
      >
        <slot name="input-bottom" />
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { mdiAlert, mdiCheck, mdiInformation } from '@mdi/js';
import { computed, onBeforeUnmount, onMounted, ref, useHost, watch } from 'vue';

// Three root nodes (slot, dummy, dialog) means Vue can't auto-inherit
// fallthrough attrs — opt out so an extraneous attribute on the c-dropdown
// element (e.g. `tabindex` forwarded from a parent c-select) doesn't trip
// the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

// Port of c-dropdown (Stencil). Shared menu surface driven by c-select (and
// later c-autocomplete) via the exposed methods below. Key adaptation vs.
// the Stencil original: the migrated c-input is shadow DOM (Stencil's was
// light DOM), so positioning reads `.c-input__slot` through the c-input's
// own shadowRoot rather than the parent select's shadowRoot.

type DropdownItem = {
  name: string;
  value: string | number;
  disabled?: boolean;
  selected?: boolean;
  outerHTML?: string;
  querySelector?: (s: string) => Element | null;
};

const props = defineProps({
  /** Items per page before adding scroll */
  itemsPerPage: { type: Number, default: 0 },
  /** Dropdown parent (the c-select / c-autocomplete host element) */
  parent: { type: Object, default: null },
  /** Dropdown options: a NodeList of <c-option> or an array of items */
  items: { type: [Array, Object], default: () => [] },
  /** Current highlighted index */
  index: { type: Number, default: null },
  /** Id used to build option/announce element ids */
  hostId: { type: String, default: '' },
  /** Parent type — drives autocomplete-only behaviour (highlight, messages) */
  type: { type: String, default: 'select' },
  /** Whether items are <c-option> elements or plain objects */
  dropdownItemType: { type: String, default: 'item' },
});

const host = useHost();
const dialogEl = ref<HTMLDialogElement | null>(null);
const dummyEl = ref<HTMLDivElement | null>(null);
const listEl = ref<HTMLUListElement | null>(null);

const isOpen = ref(false);
const statusText = ref('');
const isMobile = ref(false);
const openedOnTop = ref(false);

// Live-DOM option properties (`opt.selected` etc.) aren't reactive, so
// updateList() bumps this counter to force the list computed to re-read.
const version = ref(0);

let outsideClickFn: (() => void) | null = null;
let resizeObserver: ResizeObserver | null = null;
let inputElement: (HTMLElement & { hideDetails?: boolean; slot: string }) | null =
  null;
let debounce: number | null = null;
let isOpening = false;
let originalOverflowValue = '';
let hideDetails = false;
const inputSize = { height: 0, width: 0 };

const itemsArray = computed<DropdownItem[]>(() => {
  version.value; // dependency: re-read on updateList()
  const it = props.items as ArrayLike<DropdownItem> | null;
  return it ? (Array.from(it) as DropdownItem[]) : [];
});

const setIsMobile = () => {
  isMobile.value = window.matchMedia('only screen and (max-width: 760px)').matches;
};

// ---- query-driven highlight + empty messages (autocomplete only) --------

const highlightMatchingText = (value: string) => {
  const query = (props.parent as { query?: string } | null)?.query ?? '';
  if (props.type !== 'autocomplete' || query === '') return value;
  const regex = new RegExp(query, 'gi');
  return value
    .replace(/(<([^>]+)>)/gi, '')
    .replace(regex, (match) => `<mark>${match}</mark>`);
};

const optionHtml = (opt: DropdownItem) => {
  // For autocomplete, highlight matched text inside the option-value.
  if (props.type === 'autocomplete' && opt.querySelector) {
    const optionValue = opt.querySelector('c-option-value');
    if (optionValue) {
      optionValue.innerHTML = highlightMatchingText(optionValue.textContent ?? '');
    }
  }
  return opt.outerHTML ?? '';
};

const minimumQueryItem = computed(() => {
  const p = props.parent as
    | { query?: string; loading?: boolean; minimumQueryLength?: number; minimumQueryLengthMessage?: string }
    | null;
  if (!p) return '';
  const { query, loading, minimumQueryLength = 0, minimumQueryLengthMessage = '' } = p;
  if (props.type !== 'autocomplete' || (query?.length ?? 0) > minimumQueryLength || loading)
    return '';
  return minimumQueryLengthMessage.replace('{n}', minimumQueryLength.toString());
});

const emptyItem = computed(() => {
  const p = props.parent as
    | { query?: string; loading?: boolean; noMatchingItemsMessage?: string }
    | null;
  if (!p) return '';
  const { query, loading, noMatchingItemsMessage = '' } = p;
  if (!query || loading) return '';
  return noMatchingItemsMessage;
});

// ---- events -------------------------------------------------------------

const emit = (name: string, detail?: unknown) =>
  host?.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));

const onSelect = (item: DropdownItem, event: Event) => {
  if (item.disabled) {
    event.preventDefault();
    return;
  }
  emit('selectOption', { name: item.name, value: item.value });
};

// ---- scroll lock + positioning ------------------------------------------

const disableScroll = () => {
  document.body.style.overflow = 'hidden';
};

const enableScroll = () => {
  if (originalOverflowValue && originalOverflowValue !== 'visible') {
    document.body.style.overflow = originalOverflowValue;
    return;
  }
  document.body.style.removeProperty('overflow');
};

const getParentSlotRect = (): DOMRect => {
  // Adaptation: c-input is now shadow DOM, so reach its `.c-input__slot`
  // through the c-input element's own shadowRoot. Fall back to the host.
  const slotEl = inputElement?.shadowRoot?.querySelector('.c-input__slot');
  return (slotEl ?? host)!.getBoundingClientRect();
};

const positionMenu = () => {
  const dialog = dialogEl.value;
  if (!dialog || !host) return;
  const { innerWidth, innerHeight } = window;

  dialog.style.width = 'auto';
  dialog.style.opacity = '0';
  dialog.showModal();

  requestAnimationFrame(() => {
    let inputSlot = 'input-top';
    const { top: parentTop, width } = getParentSlotRect();
    const size = host.getBoundingClientRect();
    inputSize.height = size.height;
    inputSize.width = size.width;

    if (!isMobile.value) {
      dialog.style.width = `${width}px`;
      dialog.style.top = `${size.top}px`;
      dialog.style.bottom = 'auto';
      dialog.style.left = `${size.left}px`;

      const { bottom, right, height } = dialog.getBoundingClientRect();
      const isInView = { x: right < innerWidth, y: bottom < innerHeight };
      const fitsOnTop = parentTop - height > 0;

      if (!fitsOnTop && !isInView.y) {
        dialog.style.maxHeight = `${parentTop}px`;
      }

      if (!isInView.y || openedOnTop.value) {
        openedOnTop.value = true;
        if (inputElement) inputElement.hideDetails = true;
        inputSlot = 'input-bottom';
        dialog.style.top = 'auto';
        dialog.style.bottom = `${innerHeight - size.top - 44}px`;
      }
    }

    if (dummyEl.value) {
      dummyEl.value.style.width = `${getParentSlotRect().width}px`;
      dummyEl.value.style.height = `${inputSize.height}px`;
      dummyEl.value.style.display = 'block';
    }

    if (inputElement) {
      inputElement.slot = inputSlot;
      inputElement.hideDetails = true;
    }

    dialog.style.opacity = '1';

    (props.parent as HTMLElement | null)?.shadowRoot
      ?.querySelector('input')
      ?.focus();
  });
};

const handleOpen = () => {
  isOpening = true;
  setTimeout(() => {
    isOpening = false;
  }, 500);
};

const handleOutsideClick = () => {
  if (!isOpen.value) return;
  close();
};

// ---- status text --------------------------------------------------------

const updateStatusText = () => {
  if (debounce !== null) {
    clearTimeout(debounce);
    debounce = null;
  }
  debounce = window.setTimeout(() => {
    const lis = listEl.value?.querySelectorAll('li[role="option"]');
    const selection = lis?.[props.index ?? -1] as HTMLElement | undefined;
    const ending = itemsArray.value.length
      ? ', to navigate use up and down arrows'
      : '';
    const total = lis?.length ?? 0;
    const position = (props.index ?? -1) + 1;
    const isDisabled = !!selection?.classList?.contains('disabled');
    const beginning = isDisabled ? 'Disabled option - ' : '';

    let selectionText = selection
      ? `${beginning}${selection.dataset.name} -  ${position} of ${total} is highlighted`
      : null;

    if (props.index === null && props.type === 'autocomplete') {
      selectionText = itemsArray.value.length
        ? `${itemsArray.value.length} result${itemsArray.value.length !== 1 ? 's' : ''} available`
        : 'No search results available';
    }

    statusText.value = `${selectionText || ending}`;
    debounce = null;
  }, 1400);
};

// ---- exposed imperative API (called by c-select) ------------------------

const open = () => {
  const dialog = dialogEl.value;
  if (!dialog || dialog.open) return;
  outsideClickFn = handleOutsideClick.bind(null);
  dialog.addEventListener('click', outsideClickFn);
  requestAnimationFrame(() => {
    isOpen.value = true;
    positionMenu();
  });
};

const close = () => {
  const dialog = dialogEl.value;
  if (!dialog) return;
  dialog.close();
  isOpen.value = false;

  if (inputElement) {
    // Vue's defineCustomElement compiles `<slot name="default" />` to an
    // unnamed native <slot>, so we revert to that by clearing the attribute
    // — `slot="default"` would no longer match the projected slot.
    inputElement.slot = '';
    inputElement.hideDetails = hideDetails;
  }
  if (dummyEl.value) {
    dummyEl.value.style.width = '0';
    dummyEl.value.style.display = 'none';
  }
  dialog.style.width = '0';

  if (outsideClickFn) {
    window.removeEventListener('click', outsideClickFn);
    dialog.removeEventListener('click', outsideClickFn);
  }
};

const setStatusText = (text: string) => {
  requestAnimationFrame(() => {
    statusText.value = text;
  });
};

const focusItem = (index: number) => {
  requestAnimationFrame(() => {
    const lis = listEl.value?.querySelectorAll('li[role="option"]');
    (lis?.[index] as HTMLElement | undefined)?.focus();
  });
};

const selectItem = (index: number) => {
  const lis = listEl.value?.querySelectorAll('li[role="option"]');
  const item = lis?.[index] as HTMLElement | undefined;
  if (!item) return true;
  if (item.classList.contains('disabled')) return true;
  item.click();
  return false;
};

const updateList = (reset = false) => {
  if (reset) {
    // index is owned by the parent; mirror Stencil's reset by re-reading.
    version.value++;
  }
  requestAnimationFrame(() => {
    version.value++;
  });
};

defineExpose({ open, close, setStatusText, focusItem, selectItem, updateList });

// ---- watchers -----------------------------------------------------------

watch(
  () => props.items,
  () => requestAnimationFrame(() => version.value++),
);

watch(
  () => props.index,
  (index) => {
    requestAnimationFrame(() => {
      updateStatusText();
      const lis = listEl.value?.querySelectorAll('li[role="option"]');
      (lis?.[index as number] as HTMLElement | undefined)?.focus();
    });
  },
);

watch(isOpen, (value) => {
  originalOverflowValue =
    originalOverflowValue || window.getComputedStyle(document.body).overflow;
  if (value) {
    handleOpen();
    disableScroll();
  } else {
    enableScroll();
  }
  emit('dropdownStateChange', value);
});

// Apply itemsPerPage max-height once items exceed the page size (desktop).
watch(
  [itemsArray, isOpen],
  () => {
    const dialog = dialogEl.value;
    if (
      isMobile.value ||
      !dialog ||
      !props.itemsPerPage ||
      props.itemsPerPage <= 0 ||
      itemsArray.value.length <= props.itemsPerPage
    )
      return;
    dialog.style.maxHeight = 42 * (props.itemsPerPage + 0.5) + 60 + 'px';
    if (listEl.value)
      listEl.value.style.maxHeight = 42 * (props.itemsPerPage + 0.5) + 'px';
  },
  { flush: 'post' },
);

onMounted(() => {
  if (!host) return;
  setIsMobile();
  hideDetails = !!(props.parent as { hideDetails?: boolean } | null)?.hideDetails;
  inputElement = host.querySelector('c-input') as typeof inputElement;

  resizeObserver = new ResizeObserver((entries) => {
    if (!dialogEl.value?.open) return;
    requestAnimationFrame(() => {
      if (!Array.isArray(entries) || !entries.length || isOpening) return;
      setIsMobile();
      close();
    });
  });
  resizeObserver.observe(document.body);

  requestAnimationFrame(() => version.value++);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (debounce !== null) clearTimeout(debounce);
  if (outsideClickFn) {
    window.removeEventListener('click', outsideClickFn);
    dialogEl.value?.removeEventListener('click', outsideClickFn);
  }
  enableScroll();
});
</script>

<style>
:host(c-dropdown) {
  /**
   * @prop --c-dropdown-background-color: Menu background color
   * @prop --c-dropdown-background-color-hover: Menu item hover background color
   * @prop --c-dropdown-text-color: Menu item text color
   * @prop --c-dropdown-text-color-active: Active menu item text color
   */
  --_c-dropdown-background-color: var(--c-dropdown-background-color, var(--c-white));
  --_c-dropdown-background-color-hover: var(
    --c-dropdown-background-color-hover,
    var(--c-primary-200)
  );
  --_c-dropdown-text-color: var(--c-dropdown-text-color, var(--c-text-body));
  --_c-dropdown-text-color-active: var(
    --c-dropdown-text-color-active,
    var(--c-primary-600)
  );

  --_c-dropdown-font-size: 14px;
  --_c-dropdown-height: 42px;

  display: block;
  position: relative;
}

:host(c-dropdown) mark {
  background-color: transparent;
  box-shadow: 0 2px 0 0 var(--_c-dropdown-text-color-active);
  color: inherit;
}

dialog {
  border-radius: 4px;
  background-color: transparent;
  border: none;
  margin: -4px 0 0;
  overflow: visible;
  padding: 4px 0 0;
  position: fixed;
}

dialog::backdrop {
  opacity: 0;
}

dialog[open].mobile {
  background-color: var(--_c-dropdown-background-color);
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100svh;
  inset: 0;
}

dialog[open].mobile .input-top-wrapper {
  padding: 8px;
}

dialog .input-bottom-wrapper.active {
  padding-top: 8px;
}

.dummy {
  display: none;
}

ul {
  background-color: var(--_c-dropdown-background-color);
  box-shadow: 2px 4px 10px #00000029;
  border-radius: 4px;
  list-style: none;
  margin: 0;
  outline: none;
  padding: 0;
  pointer-events: auto;
  visibility: hidden;
  width: 100%;
  height: max-content;
  overflow-y: scroll;
}

ul.active {
  visibility: visible;
  animation: 0.2s 1 fade-in cubic-bezier(0.25, 0.8, 0.5, 1);
}

ul.active.mobile {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: calc(100svh - 60px);
}

li {
  align-items: center;
  column-gap: 12px;
  cursor: pointer;
  display: flex;
  flex-wrap: nowrap;
  font-size: var(--_c-dropdown-font-size);
  min-height: var(--_c-dropdown-height);
  outline: none;
  padding-left: 10px;
  padding-right: 10px;
  pointer-events: auto;
  white-space: nowrap;
  width: 100%;
  border-radius: 4px;
  user-select: none;
}

li span,
li c-option-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

li:hover,
li:focus,
li.active {
  background: var(--_c-dropdown-background-color-hover);
  color: var(--_c-dropdown-text-color-active);
  box-shadow: inset 0 0 0 1px var(--_c-dropdown-text-color-active);
}

li:not(.disabled, :hover, :focus)[aria-selected='true'] {
  background: var(--_c-dropdown-background-color-hover);
  color: var(--_c-dropdown-text-color-active);
  border-radius: 0;
}

li.disabled {
  background-color: rgba(var(--c-tertiary-rgb), 0.05);
  cursor: default;
  filter: grayscale(1) opacity(0.75);
}

li.info {
  cursor: default;
  pointer-events: none;
  gap: 8px;
  color: var(--c-text-system);
}

li .check,
li.info svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  fill: currentColor;
}

li.info svg {
  width: 18px;
  height: 18px;
}

.visuallyhidden {
  border: 0;
  clip: rect(1px, 1px, 1px, 1px);
  height: 1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}

@keyframes fade-in {
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
