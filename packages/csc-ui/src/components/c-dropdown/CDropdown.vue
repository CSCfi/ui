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
    part="menu"
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
        :aria-multiselectable="multiple ? 'true' : undefined"
        :class="[ui.list(), isOpen ? 'active' : '', isMobile ? 'mobile' : '']"
        part="list"
        role="listbox"
        tabindex="-1"
      >
        <!-- Select-all row (ADR-0046): pinned above the options, it toggles
             every listed enabled option. A `role="option"` like the rows, but
             never an item row — `data-select-all` keeps it out of the
             positional option-row paths (focus, select, status, peek). -->
        <li
          v-if="selectAllRow"
          ref="selectAllRef"
          :aria-selected="selectAllRow.state === 'all'"
          :class="dropdown({ selectAll: true }).item()"
          :data-name="selectAllRow.label"
          data-select-all
          part="select-all"
          role="option"
          tabindex="-1"
          @click="onSelectAll"
        >
          <selection-indicator
            :checked="selectAllRow.state === 'all'"
            :indeterminate="selectAllRow.state === 'some'"
            class="relative"
          />

          <span class="c-dropdown__label">{{ selectAllRow.label }}</span>
        </li>

        <!-- Option mode: <c-option> elements projected by the consumer.
             Render each option's outerHTML, mirroring Stencil — inside a
             wrapper span so the multiple-mode indicator can precede it. -->
        <template v-if="dropdownItemType === 'option'">
          <li
            v-for="(opt, i) in itemsArray"
            :key="`option-${i}`"
            :aria-pos-in-set="String(i + 1)"
            :aria-selected="
              multiple ? isSelectedValue(opt.value) : !!opt.selected
            "
            :aria-set-size="String(itemsArray.length)"
            :class="[
              dropdown({ disabled: isDisabled(opt) }).item(),
              isDisabled(opt) ? 'disabled' : '',
            ]"
            :data-name="nameOf(opt)"
            part="item"
            role="option"
            tabindex="-1"
            @click="onSelect(opt, $event)"
          >
            <selection-indicator
              v-if="multiple"
              :checked="isSelectedValue(opt.value)"
              :disabled="isDisabled(opt)"
              class="relative"
            />

            <span class="c-dropdown__label" v-html="opt.outerHTML" />
          </li>
        </template>

        <!-- Item mode: plain {name,value,disabled} objects. -->
        <template v-else>
          <li
            v-for="(item, i) in itemsArray"
            :key="`item-${i}`"
            :aria-pos-in-set="String(i + 1)"
            :aria-selected="
              multiple ? isSelectedValue(item.value) : index === i
            "
            :aria-set-size="String(itemsArray.length)"
            :class="[
              dropdown({ disabled: isDisabled(item) }).item(),
              isDisabled(item) ? 'disabled' : '',
            ]"
            :data-name="item.name"
            :title="item.name"
            part="item"
            role="option"
            tabindex="-1"
            @click="onSelect(item, $event)"
          >
            <selection-indicator
              v-if="multiple"
              :checked="isSelectedValue(item.value)"
              :disabled="isDisabled(item)"
              class="relative"
            />

            <svg
              v-else-if="index === i"
              :class="ui.check()"
              aria-hidden="true"
              class="check"
              viewBox="0 0 24 24"
            >
              <path :d="mdiCheck" />
            </svg>

            <span class="c-dropdown__label">{{ item.name }}</span>
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
/**
 * @slot default - The anchor c-input of the parent select / autocomplete, rendered inline while the menu is closed
 *
 * @csspart menu - The positioned dialog surface holding the field and the list
 * @csspart list - The scrolling listbox
 * @csspart item - One option row
 * @csspart select-all - The pinned select-all row at the top of the list in `multiple` mode; carries the same indicator / mark parts as an option row
 * @csspart indicator - The decorative checkbox box on an option row in `multiple` mode; border, fill and glyph draw with `currentColor`, so `color` recolours them together
 * @csspart mark - The check glyph inside a row indicator; draws with `currentColor`
 * @slot input-top - Target the c-input is moved into when the menu opens below the field
 * @slot input-bottom - Target the c-input is moved into when the menu opens above the field
 */
import { mdiCheck } from '@mdi/js';
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

import { coerceBoolean } from '../../shared/coerceBoolean';
import { optionLabel } from '../../shared/optionLabel';
import { applyPeekCap } from '../../shared/peekCap';
import { SELECT_ALL_INDEX } from '../../shared/selectAll';
import SelectionIndicator from '../../shared/SelectionIndicator.vue';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-dropdown>`. */
interface CDropdownEvents {
  /**
   * Fired when the dropdown menu opens or closes; the detail is the new open
   * state.
   */
  dropdownStateChange: boolean;
  /**
   * Fired when the user selects an option row, carrying the option's name
   * and value for the parent (c-select) to commit.
   */
  selectOption: { name: string; value: number | string };
  /**
   * Fired when the select-all row is activated; the parent (c-select) toggles
   * every listed enabled option.
   */
  selectall: void;
}

/**
 * Styling lives in this `tailwind-variants` config: the slots are
 * the menu's visual regions (`dialog`, `list`, `item`, the selected-row
 * check). `variants.disabled` replaces the
 * `li.disabled` cascade. The per-component `--c-dropdown-*` override-variable
 * layer is dropped in favour of the semantic design tokens (the overlay
 * surface and the primary item-state roles); customization is via
 * `::part()`, there is no `override` prop.
 *
 * What can't be a utility stays in the escape-hatch <style> below:
 * the host box (`:host{display:block;position:relative}`), the imperative
 * state-class hooks the JS toggles (`ul.active` visibility + fade-in keyframe,
 * `.mobile` full-screen layout, `.input-bottom-wrapper.active` padding),
 * the `li span / li c-option-value` ellipsis rules (those nodes are injected
 * via `v-html`, so Vue can't put a class on them), and the keyframe.
 */
const dropdown = tv({
  defaultVariants: { disabled: false, selectAll: false },
  slots: {
    check: 'w-4 h-4 shrink-0 fill-current',
    // The positioned menu surface. `position:fixed` + the imperative
    // top/left/width/maxHeight the JS writes inline drive placement.
    dialog:
      'rounded border-0 bg-transparent m-0 mt-[-4px] p-0 pt-1 overflow-visible fixed',
    item: 'flex items-center flex-nowrap gap-3 cursor-pointer text-sm min-h-[42px] outline-none px-[10px] py-2 pointer-events-auto whitespace-nowrap w-full rounded select-none hover:bg-primary-subtle hover:text-primary hover:ring-1 hover:ring-inset hover:ring-primary focus:bg-primary-subtle focus:text-primary focus:ring-1 focus:ring-inset focus:ring-primary aria-selected:bg-primary-subtle aria-selected:text-primary aria-selected:rounded-none hover:aria-selected:rounded focus:aria-selected:rounded',
    // Static list look; visibility + fade-in (`.active`) and the mobile
    // full-screen layout stay in the escape-hatch <style>.
    list: 'list-none m-0 p-0 outline-none pointer-events-auto w-full h-max overflow-y-auto scrollbar-hidden rounded bg-surface-overlay text-on-surface shadow-[2px_4px_10px_#00000029] overscroll-none',
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
        item: 'cursor-default pointer-events-none bg-on-surface/5 [filter:grayscale(1)_opacity(0.75)] aria-selected:bg-on-surface/5 aria-selected:text-inherit aria-selected:ring-0 aria-selected:rounded',
      },
    },
    // The pinned select-all row (ADR-0046): sticks to the list's top edge on
    // an opaque fill with a hairline below. `z-10` is load-bearing — the
    // positioned row indicators that scroll beneath it come later in tree
    // order and would paint over it otherwise.
    selectAll: {
      true: {
        item: 'sticky top-0 z-10 rounded-none bg-surface-overlay border-b border-solid border-divider hover:aria-selected:rounded-none focus:aria-selected:rounded-none',
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

// Internal-only element (never consumer-authored), so these unions stay
// local and unexported — c-select / c-autocomplete are the only callers.
type CDropdownItemType = 'item' | 'option';

type CDropdownParentType = 'autocomplete' | 'select';

interface CDropdownProps {
  /** Whether items are <c-option> elements or plain objects */
  dropdownItemType?: CDropdownItemType;
  /**
   * Id used to build option/announce element ids
   *
   * @freeform
   */
  hostId?: string;
  /** Current highlighted index; `-1` (`SELECT_ALL_INDEX`) is the select-all row */
  index?: null | number;
  /** Dropdown options: a NodeList of <c-option> or an array of items */
  items?: ArrayLike<DropdownItem>;
  /** Items per page before adding scroll */
  itemsPerPage?: number;
  /**
   * Multi-select mode: rows toggle instead of committing, each carries a
   * decorative checkbox indicator, and the listbox is `aria-multiselectable`
   */
  multiple?: boolean;
  /** Dropdown parent (the c-select / c-autocomplete host element) */
  parent?: HTMLElement | null;
  /**
   * The select-all row in `multiple` mode, as the parent computes it (label,
   * tri-state, counts for the live region); `null` renders no row
   */
  selectAllRow?: CDropdownSelectAllRow | null;
  /**
   * Values of the currently selected items in `multiple` mode; drives each
   * row's `aria-selected` and its indicator
   */
  selected?: (number | string)[];
  /** Parent type — drives autocomplete-only behaviour (highlight, messages) */
  type?: CDropdownParentType;
}

type DropdownItem = {
  disabled?: boolean | string;
  name: string;
  outerHTML?: string;
  selected?: boolean;
  value: number | string;
};

/**
 * The select-all row as the parent computes it (ADR-0046): the label, the
 * indicator's tri-state and the counts the live region speaks.
 */
interface CDropdownSelectAllRow {
  label: string;
  selected: number;
  state: 'all' | 'none' | 'some';
  total: number;
}

const props = withDefaults(defineProps<CDropdownProps>(), {
  dropdownItemType: 'item',
  hostId: '',
  index: null,
  items: () => [],
  itemsPerPage: 0,
  multiple: false,
  parent: null,
  selectAllRow: null,
  selected: () => [],
  type: 'select',
});

const host = useHost();

// Multiple-mode selection, keyed by value. A reactive prop (unlike the live
// `.selected` flags on <c-option> elements), so `aria-selected` and the row
// indicators re-render without an `updateList()` bump.
const selectedSet = computed(() => new Set(props.selected));

const isSelectedValue = (value: number | string) =>
  selectedSet.value.has(value);

const dialogRef = useTemplateRef<HTMLDialogElement>('dialogRef');

const dummyRef = useTemplateRef<HTMLDivElement>('dummyRef');

const listRef = useTemplateRef<HTMLUListElement>('listRef');

const selectAllRef = useTemplateRef<HTMLLIElement>('selectAllRef');

// The option rows in visual order — the positional list every index-based
// path (focus, select, status, peek) walks. The select-all row is a
// `role="option"` too but never an item row, so it is excluded here and
// addressed by `SELECT_ALL_INDEX` instead.
const optionRows = () =>
  Array.from(
    listRef.value?.querySelectorAll<HTMLElement>(
      'li[role="option"]:not([data-select-all])',
    ) ?? [],
  );

const rowAt = (index: null | number): HTMLElement | undefined => {
  if (index === null) return undefined;

  if (index === SELECT_ALL_INDEX) return selectAllRef.value ?? undefined;

  return optionRows()[index];
};

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

// The dialog's viewport-fit `max-height` while one applies (positionMenu),
// else Infinity — the list's peek cap has to stay under it.
let dialogCeiling = Infinity;

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

// ---- events -------------------------------------------------------------

const emit = useHostEmit<CDropdownEvents>();

// Both dropdown events cross the shadow boundary to the parent select.
const bubbling = { bubbles: true, composed: true };

// A <c-option disabled> in option mode delivers its Boolean attribute as `""`
// (the defineCustomElement quirk coerceBoolean exists for), so never test
// `disabled` by truthiness.
const isDisabled = (item: DropdownItem) => coerceBoolean(item.disabled);

// An option's label: its `name`, else — for a slotted <c-option> element —
// the text of its `c-option-value` / its own text (ADR-0045). The `items`
// array always carries `name`.
const nameOf = (item: DropdownItem): string =>
  (item.name as string | undefined) ??
  (item instanceof HTMLElement ? optionLabel(item) : String(item.value));

const onSelect = (item: DropdownItem, event: Event) => {
  if (isDisabled(item)) {
    event.preventDefault();

    return;
  }

  emit('selectOption', { name: nameOf(item), value: item.value }, bubbling);
};

// The select-all row: the parent owns the selection and toggles every listed
// enabled option. A keyboard toggle keeps `index` on the row, so the index
// watcher does not re-announce — do it here (the debounce lets the parent's
// new counts land first).
const onSelectAll = () => {
  emit('selectall', undefined, bubbling);
  updateStatusText();
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

// The parent select forwards `hide-details` to its c-input through the
// `data-hide-details` attribute, which c-input resolves AHEAD of its
// `hideDetails` prop (see c-input). Setting only the prop here therefore had
// no effect: the field kept its message area while moved into the dialog and
// the list rendered below that gap instead of flush under the field. Drive
// both channels.
const setInputHideDetails = (value: boolean) => {
  if (!inputElement) return;

  inputElement.hideDetails = value;
  inputElement.dataset.hideDetails = String(value);
};

// What the c-input carried before the open-state override above, so close()
// can put back exactly what the parent had rendered. Recomputing the
// parent's setting here instead (the old `!!parent.hideDetails` mount-time
// snapshot) mis-read a valueless `hide-details` attribute — the host
// property holds the raw empty string, which is falsy — and stamping that
// stale `data-hide-details="false"` onto the c-input silently overrode the
// parent's binding for good (Vue's vnode diff never sees imperative writes).
// Captured on open, `null` while nothing is overridden.
let inputHideDetailsBeforeOpen: {
  attr: string | undefined;
  prop: boolean | undefined;
} | null = null;

const captureInputHideDetails = () => {
  if (!inputElement || inputHideDetailsBeforeOpen) return;

  inputHideDetailsBeforeOpen = {
    attr: inputElement.dataset.hideDetails,
    prop: inputElement.hideDetails,
  };
};

const restoreInputHideDetails = () => {
  if (!inputElement || !inputHideDetailsBeforeOpen) return;

  const { attr, prop } = inputHideDetailsBeforeOpen;

  inputElement.hideDetails = prop;

  if (attr === undefined) delete inputElement.dataset.hideDetails;
  else inputElement.dataset.hideDetails = attr;

  inputHideDetailsBeforeOpen = null;
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

  captureInputHideDetails();

  const { innerHeight, innerWidth } = window;

  dialog.style.width = 'auto';
  // Drop a previous open's viewport-fit cap before measuring afresh.
  dialog.style.maxHeight = '';
  dialogCeiling = Infinity;
  dialog.style.opacity = '0';
  dialog.showModal();

  requestAnimationFrame(() => {
    // Cap the list first (its rows are laid out now) so the dialog below is
    // measured at its capped height.
    applyListCap();

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
        dialogCeiling = parentTop;
      }

      if (!isInView.y || openedOnTop.value) {
        openedOnTop.value = true;

        setInputHideDetails(true);
        inputSlot = 'input-bottom';
        dialog.style.top = 'auto';
        // Anchor the dialog's bottom edge to the field's bottom edge (the
        // field is 44px by default, 36px for `size="small"`).
        dialog.style.bottom = `${innerHeight - size.top - getParentSlotRect().height}px`;
      }
    }

    if (dummyRef.value) {
      dummyRef.value.style.width = `${getParentSlotRect().width}px`;
      dummyRef.value.style.height = `${inputSize.height}px`;
      dummyRef.value.style.display = 'block';
    }

    if (inputElement) {
      inputElement.slot = inputSlot;
      setInputHideDetails(true);
    }

    dialog.style.opacity = '1';

    // The field has just moved slots: re-cap the list next frame, once the
    // dialog's chrome around it has its final height.
    if (Number.isFinite(dialogCeiling)) requestAnimationFrame(applyListCap);

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
    const selection = rowAt(props.index);

    const ending = itemsArray.value.length
      ? ', to navigate use up and down arrows'
      : '';

    const total = optionRows().length;

    const position = (props.index ?? -1) + 1;

    const isDisabled = !!selection?.classList?.contains('disabled');

    const beginning = isDisabled ? 'Disabled option - ' : '';

    let selectionText = selection
      ? `${beginning}${selection.dataset.name} -  ${position} of ${total} is highlighted`
      : null;

    if (props.index === SELECT_ALL_INDEX && props.selectAllRow) {
      const { label, selected, total: listed } = props.selectAllRow;
      selectionText = `${label} - ${selected} of ${listed} options selected`;
    }

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

/**
 * Open dropdown
 *
 * @seeded from csc-ui — verify
 */
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

/**
 * Close dropdown
 *
 * @seeded from csc-ui — verify
 */
const close = () => {
  const dialog = dialogRef.value;

  if (!dialog) return;
  dialog.close();
  dialogCeiling = Infinity;
  isOpen.value = false;

  if (inputElement) {
    // Vue's defineCustomElement compiles `<slot name="default" />` to an
    // unnamed native <slot>, so we revert to that by clearing the attribute
    // — `slot="default"` would no longer match the projected slot.
    inputElement.slot = '';
    restoreInputHideDetails();
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
  requestAnimationFrame(() => rowAt(index)?.focus());
};

/**
 * Select item
 *
 * @seeded from csc-ui — verify
 */
const selectItem = (index: number) => {
  const item = rowAt(index);

  if (!item) return true;

  if (item.classList.contains('disabled')) return true;
  item.click();

  return false;
};

/**
 * Update list items
 *
 * @seeded from csc-ui — verify
 */
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
      rowAt(index)?.focus();
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

  emit('dropdownStateChange', value, bubbling);
});

// ---- peek cap (ADR-0043) -------------------------------------------------

// The list hides its scrollbar, so when it overflows it must end on a
// half-visible row — the peek: `itemsPerPage` full rows first, and never past
// what the dialog's viewport-fit cap leaves it. Measured from the real rows,
// so taller <c-option> content sizes correctly. The mobile sheet fills the
// screen and takes no cap.
const applyListCap = () => {
  const list = listRef.value;

  const dialog = dialogRef.value;

  if (!list || !dialog) return;

  if (isMobile.value) {
    list.style.maxHeight = '';

    return;
  }

  // Under a viewport-fit cap the list gets what the dialog's other content
  // (the moved field, paddings) leaves. `scrollHeight` measures that content
  // even where the dialog's own box is capped and the list spills past it.
  const ceiling = Number.isFinite(dialogCeiling)
    ? dialogCeiling - (dialog.scrollHeight - list.offsetHeight)
    : undefined;

  applyPeekCap(list, {
    ceiling,
    itemsPerPage: props.itemsPerPage,
    rows: optionRows(),
  });
};

// Opening caps from positionMenu's measuring frame; item and breakpoint
// changes while open re-cap a frame later, once the new rows are patched in
// (a `flush: 'post'` watcher can still run ahead of the patch).
let capFrame = 0;

watch([itemsArray, isMobile, () => !!props.selectAllRow], () => {
  if (!isOpen.value) return;

  cancelAnimationFrame(capFrame);
  capFrame = requestAnimationFrame(() => {
    capFrame = 0;
    applyListCap();
  });
});

onMounted(() => {
  if (!host) return;
  setIsMobile();
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
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. The static look of the dialog/list/item/info/check regions lives in
  the `tv` config above. What remains here, authored against global design
  tokens only:
    - The host box: `:host(c-dropdown){display:block;position:relative}` — it
      anchors the (position:fixed) dialog and the slotted light-DOM c-input,
      and overrides the global `:host{display:contents}`. Utilities can't
      target the host.
    - `li c-option-value` ellipsis — those nodes come from `v-html`
      (option outerHTML), unreachable by a class; `li span` shares the rule.
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

dialog::backdrop {
  opacity: 0;
}

dialog[open].mobile {
  background-color: var(--c-surface-overlay);
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

/* The row's label wrapper (`v-html`-injected option markup, or the plain
 * item-name span) and `v-html`-injected <c-option-value> nodes — unlayered so
 * it wins over the injected content's own display; scoped by class so it
 * never hits the indicator span before it. */
li .c-dropdown__label,
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
