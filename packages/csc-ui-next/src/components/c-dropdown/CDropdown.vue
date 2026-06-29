<template>
  <!-- Closed state: the consumer's <c-input> lives in the default slot,
       rendered inline where the field sits. On open we move that c-input
       into the dialog (`input-top`/`input-bottom`) and reveal `dummyRef`
       to hold the field's place in the flow so the page doesn't jump.
       Authored as the unnamed default slot because Vue's defineCustomElement
       collapses `<slot name="default">` to an unnamed native <slot> anyway. -->
  <slot />

  <div ref="dummyRef" class="dummy" />

  <dialog
    ref="dialogRef"
    :class="[ui.dialog(), isMobile ? 'mobile' : '']"
    tabindex="-1"
    @cancel="close"
  >
    <div @click.stop>
      <div
        :id="'announce-' + hostId"
        :class="ui.visuallyHidden()"
        aria-atomic="true"
        aria-live="polite"
      >
        {{ statusText }}
      </div>

      <div class="input-top-wrapper">
        <slot name="input-top" />
      </div>

      <ul
        :id="`${hostId}--results`"
        ref="listRef"
        :aria-expanded="isOpen"
        :class="[ui.list(), isOpen ? 'active' : '', isMobile ? 'mobile' : '']"
        role="listbox"
        tabindex="-1"
      >
        <!-- Empty states (autocomplete only) -->
        <li v-if="!itemsArray.length && minimumQueryItem" :class="ui.info()">
          <svg :class="ui.infoIcon()" aria-hidden="true" viewBox="0 0 24 24">
            <path :d="mdiInformation" />
          </svg>
          {{ minimumQueryItem }}
        </li>

        <li v-else-if="!itemsArray.length && emptyItem" :class="ui.info()">
          <svg :class="ui.infoIcon()" aria-hidden="true" viewBox="0 0 24 24">
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
            :aria-pos-in-set="String(i + 1)"
            :aria-selected="!!opt.selected"
            :aria-set-size="String(itemsArray.length)"
            :class="[
              dropdown({ disabled: !!opt.disabled }).item(),
              opt.disabled ? 'disabled' : '',
            ]"
            :data-name="opt.name"
            role="option"
            tabindex="-1"
            @click="onSelect(opt, $event)"
            v-html="optionHtml(opt)"
          />
        </template>

        <!-- Item mode: plain {name,value,disabled} objects. -->
        <template v-else>
          <li
            v-for="(item, i) in itemsArray"
            :key="`item-${i}`"
            :aria-pos-in-set="String(i + 1)"
            :aria-selected="index === i"
            :aria-set-size="String(itemsArray.length)"
            :class="[
              dropdown({ disabled: !!item.disabled }).item(),
              item.disabled ? 'disabled' : '',
            ]"
            :data-name="item.name"
            :title="item.name"
            role="option"
            tabindex="-1"
            @click="onSelect(item, $event)"
          >
            <svg
              v-if="index === i"
              :class="ui.check()"
              aria-hidden="true"
              class="check"
              viewBox="0 0 24 24"
            >
              <path :d="mdiCheck" />
            </svg>

            <span v-html="highlightMatchingText(item.name)" />
          </li>
        </template>
      </ul>

      <div :class="{ active: openedOnTop }" class="input-bottom-wrapper">
        <slot name="input-bottom" />
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { mdiAlert, mdiCheck, mdiInformation } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watch,
} from 'vue';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004): the slots are
 * the menu's visual regions (`dialog`, `list`, `item`, the info/empty row and
 * its icon, the selected-row check). `variants.disabled` replaces the
 * `li.disabled` cascade. The per-component `--c-dropdown-*` override-variable
 * layer is dropped in favour of the global design tokens (`bg-white`,
 * `bg-primary-200`, `text-primary-600`, …); consumer customization is via
 * `::part()` (ADR-0006), there is no `override` prop.
 *
 * What can't be a utility stays in the escape-hatch <style> below (ADR-0007):
 * the host box (`:host{display:block;position:relative}`), the imperative
 * state-class hooks the JS toggles (`ul.active` visibility + fade-in keyframe,
 * `.mobile` full-screen layout, `.input-bottom-wrapper.active` padding),
 * `<mark>` and `li span / li c-option-value` ellipsis rules (those nodes are
 * injected via `v-html`, so Vue can't put a class on them), and the keyframe.
 */
const dropdown = tv({
  defaultVariants: { disabled: false },
  slots: {
    check: 'w-4 h-4 shrink-0 fill-current',
    // The positioned menu surface. `position:fixed` + the imperative
    // top/left/width/maxHeight the JS writes inline drive placement.
    dialog:
      'rounded border-0 bg-transparent m-0 mt-[-4px] p-0 pt-1 overflow-visible fixed',
    info: 'flex items-center flex-nowrap gap-2 text-sm min-h-[42px] px-[10px] w-full cursor-default pointer-events-none whitespace-nowrap text-[var(--c-text-system)]',
    infoIcon: 'w-[18px] h-[18px] shrink-0 fill-current',
    item: 'flex items-center flex-nowrap gap-3 cursor-pointer text-sm min-h-[42px] outline-none px-[10px] pointer-events-auto whitespace-nowrap w-full rounded select-none hover:bg-primary-200 hover:text-primary-600 hover:ring-1 hover:ring-inset hover:ring-primary-600 focus:bg-primary-200 focus:text-primary-600 focus:ring-1 focus:ring-inset focus:ring-primary-600 aria-selected:bg-primary-200 aria-selected:text-primary-600 aria-selected:rounded-none hover:aria-selected:rounded focus:aria-selected:rounded',
    // Static list look; visibility + fade-in (`.active`) and the mobile
    // full-screen layout stay in the escape-hatch <style>.
    list: 'list-none m-0 p-0 outline-none pointer-events-auto w-full h-max overflow-y-scroll rounded bg-white shadow-[2px_4px_10px_#00000029]',
    visuallyHidden:
      'absolute w-px h-px p-0 overflow-hidden border-0 [clip:rect(1px,1px,1px,1px)]',
  },
  variants: {
    // Mirrors `li.disabled` — applied per-row (overrides the hover/selected
    // utilities above because compound order is preserved).
    disabled: {
      true: {
        // pointer-events-none means :hover/:focus never fire on a disabled
        // row, so only the aria-selected branch needs neutralising here.
        item: 'cursor-default pointer-events-none bg-tertiary-600/5 [filter:grayscale(1)_opacity(0.75)] aria-selected:bg-tertiary-600/5 aria-selected:text-inherit aria-selected:ring-0 aria-selected:rounded',
      },
    },
  },
});

const ui = computed(() => dropdown());

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

interface CDropdownProps {
  /** Whether items are <c-option> elements or plain objects */
  dropdownItemType?: string;
  /** Id used to build option/announce element ids */
  hostId?: string;
  /** Current highlighted index */
  index?: null | number;
  /** Dropdown options: a NodeList of <c-option> or an array of items */
  items?: ArrayLike<DropdownItem>;
  /** Items per page before adding scroll */
  itemsPerPage?: number;
  /** Dropdown parent (the c-select / c-autocomplete host element) */
  parent?: HTMLElement | null;
  /** Parent type — drives autocomplete-only behaviour (highlight, messages) */
  type?: string;
}

type DropdownItem = {
  disabled?: boolean;
  name: string;
  outerHTML?: string;
  querySelector?: (s: string) => Element | null;
  selected?: boolean;
  value: number | string;
};

const props = withDefaults(defineProps<CDropdownProps>(), {
  dropdownItemType: 'item',
  hostId: '',
  index: null,
  items: () => [],
  itemsPerPage: 0,
  parent: null,
  type: 'select',
});

const host = useHost();

const dialogRef = useTemplateRef<HTMLDialogElement>('dialogRef');

const dummyRef = useTemplateRef<HTMLDivElement>('dummyRef');

const listRef = useTemplateRef<HTMLUListElement>('listRef');

const isOpen = ref(false);

const statusText = ref('');

const isMobile = ref(false);

const openedOnTop = ref(false);

// Live-DOM option properties (`opt.selected` etc.) aren't reactive, so
// updateList() bumps this counter to force the list computed to re-read.
const version = ref(0);

let outsideClickFn: (() => void) | null = null;

let resizeObserver: null | ResizeObserver = null;

let inputElement:
  | ({ hideDetails?: boolean; slot: string } & HTMLElement)
  | null = null;

let debounce: null | number = null;

let isOpening = false;

let originalOverflowValue = '';

let hideDetails = false;

const inputSize = { height: 0, width: 0 };

const itemsArray = computed<DropdownItem[]>(() => {
  void version.value; // dependency: re-read on updateList()

  const it = props.items as ArrayLike<DropdownItem> | null;

  return it ? (Array.from(it) as DropdownItem[]) : [];
});

const setIsMobile = () => {
  isMobile.value = window.matchMedia(
    'only screen and (max-width: 760px)',
  ).matches;
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
      optionValue.innerHTML = highlightMatchingText(
        optionValue.textContent ?? '',
      );
    }
  }

  return opt.outerHTML ?? '';
};

const minimumQueryItem = computed(() => {
  const p = props.parent as {
    loading?: boolean;
    minimumQueryLength?: number;
    minimumQueryLengthMessage?: string;
    query?: string;
  } | null;

  if (!p) return '';

  const {
    loading,
    minimumQueryLength = 0,
    minimumQueryLengthMessage = '',
    query,
  } = p;

  if (
    props.type !== 'autocomplete' ||
    (query?.length ?? 0) > minimumQueryLength ||
    loading
  )
    return '';

  return minimumQueryLengthMessage.replace(
    '{n}',
    minimumQueryLength.toString(),
  );
});

const emptyItem = computed(() => {
  const p = props.parent as {
    loading?: boolean;
    noMatchingItemsMessage?: string;
    query?: string;
  } | null;

  if (!p) return '';

  const { loading, noMatchingItemsMessage = '', query } = p;

  if (!query || loading) return '';

  return noMatchingItemsMessage;
});

// ---- events -------------------------------------------------------------

const emit = (name: string, detail?: unknown) =>
  host?.dispatchEvent(
    new CustomEvent(name, { bubbles: true, composed: true, detail }),
  );

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
  const dialog = dialogRef.value;

  if (!dialog || !host) return;

  const { innerHeight, innerWidth } = window;

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

      const { bottom, height, right } = dialog.getBoundingClientRect();

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

    if (dummyRef.value) {
      dummyRef.value.style.width = `${getParentSlotRect().width}px`;
      dummyRef.value.style.height = `${inputSize.height}px`;
      dummyRef.value.style.display = 'block';
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
    const lis = listRef.value?.querySelectorAll('li[role="option"]');

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
  const dialog = dialogRef.value;

  if (!dialog || dialog.open) return;
  outsideClickFn = handleOutsideClick.bind(null);
  dialog.addEventListener('click', outsideClickFn);
  requestAnimationFrame(() => {
    isOpen.value = true;
    positionMenu();
  });
};

const close = () => {
  const dialog = dialogRef.value;

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

  if (dummyRef.value) {
    dummyRef.value.style.width = '0';
    dummyRef.value.style.display = 'none';
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
    const lis = listRef.value?.querySelectorAll('li[role="option"]');
    (lis?.[index] as HTMLElement | undefined)?.focus();
  });
};

const selectItem = (index: number) => {
  const lis = listRef.value?.querySelectorAll('li[role="option"]');

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

defineExpose({ close, focusItem, open, selectItem, setStatusText, updateList });

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

      const lis = listRef.value?.querySelectorAll('li[role="option"]');
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
    const dialog = dialogRef.value;

    if (
      isMobile.value ||
      !dialog ||
      !props.itemsPerPage ||
      props.itemsPerPage <= 0 ||
      itemsArray.value.length <= props.itemsPerPage
    )
      return;
    dialog.style.maxHeight = `${42 * (props.itemsPerPage + 0.5) + 60}px`;

    if (listRef.value)
      listRef.value.style.maxHeight = `${42 * (props.itemsPerPage + 0.5)}px`;
  },
  { flush: 'post' },
);

onMounted(() => {
  if (!host) return;
  setIsMobile();
  hideDetails = !!(props.parent as { hideDetails?: boolean } | null)
    ?.hideDetails;
  inputElement = host.querySelector('c-input') as typeof inputElement;

  resizeObserver = new ResizeObserver((entries) => {
    if (!dialogRef.value?.open) return;
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
    dialogRef.value?.removeEventListener('click', outsideClickFn);
  }

  enableScroll();
});
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The static look of the dialog/list/item/info/check regions lives in
  the `tv` config above. What remains here, authored against global design
  tokens only:
    - The host box: `:host(c-dropdown){display:block;position:relative}` — it
      anchors the (position:fixed) dialog and the slotted light-DOM c-input,
      and overrides the global `:host{display:contents}`. Utilities can't
      target the host.
    - `<mark>` — injected via `v-html` (autocomplete query highlight), so Vue
      can't put a class on it; the active-colour underline is a box-shadow.
    - `li span / li c-option-value` ellipsis — those nodes come from `v-html`
      (option outerHTML / item name), again unreachable by a class.
    - Imperative state-class hooks the JS/positioning toggles: `dialog.mobile`
      full-screen layout, `ul.active` visibility + the `fade-in` reveal, the
      mobile list sizing, and the `.input-*-wrapper` paddings — these are
      contextual selectors and an animation that utilities don't cover.
    - `dialog::backdrop` (a native pseudo-element) and the `.dummy` placeholder
      (`display:none`; its size is set inline by the positioning code).
-->
<style>
:host(c-dropdown) {
  display: block;
  position: relative;
}

:host(c-dropdown) mark {
  background-color: transparent;
  box-shadow: 0 2px 0 0 var(--c-primary-600);
  color: inherit;
}

dialog::backdrop {
  opacity: 0;
}

dialog[open].mobile {
  background-color: var(--c-white);
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

/* Hidden until the JS adds `.active`; the reveal plays the fade-in keyframe. */
ul {
  visibility: hidden;
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

/* `v-html`-injected option/item text — no element for a utility class. */
li span,
li c-option-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
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
