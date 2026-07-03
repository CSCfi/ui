<template>
  <div
    :class="[
      ui.root(),
      {
        'c-radio-group--disabled': disabled,
        'c-radio-group--error': !valid,
      },
    ]"
    aria-labelledby="c-radio-group__label"
    class="c-radio-group"
    part="root"
    role="radiogroup"
  >
    <label
      v-if="label || hasLabelContent"
      id="c-radio-group__label"
      :class="ui.label()"
      part="label"
    >
      <span v-if="label">{{ label }}</span>

      <span v-show="!label"><slot /></span>

      <span v-if="required" :class="ui.required()" aria-hidden="true">
        &nbsp;*
      </span>
    </label>

    <div :class="ui.items()" part="items">
      <label
        v-for="(item, index) in resolvedItems"
        :key="String(item.value) + index"
        :class="[
          ui.radio(),
          {
            'c-radio--disabled': item.disabled || disabled,
            'c-radio--error': !valid,
          },
        ]"
        class="c-radio"
        @keydown="onKeyDown($event, item, index)"
      >
        <input
          :aria-checked="isChecked(item)"
          :aria-disabled="item.disabled || disabled"
          :checked="isChecked(item)"
          :class="ui.input()"
          :disabled="item.disabled || disabled"
          :name="radioName"
          type="radio"
          @change="select(item, index)"
        />

        <span
          :ref="(el) => setRippleRef(el, index)"
          :class="ui.ripple()"
          class="c-radio__ripple"
        >
          <span
            v-for="r in ripples.filter((rp) => rp.group === index)"
            :key="r.id"
            :class="ui.rippleEffect()"
            :style="r.style"
            aria-hidden="true"
          />

          <span :class="ui.selection()" class="c-radio__selection" />
        </span>

        <div :class="ui.radioLabel()">{{ item.name }}</div>
      </label>
    </div>

    <transition mode="out-in" name="c-radio-group-message">
      <span
        v-if="!hideDetails && messageVisible"
        :key="messageKey"
        :class="ui.message()"
        part="message"
      >
        <svg
          v-if="!valid"
          :class="ui.messageIcon()"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path :d="errorIconPath" />
        </svg>

        <span :class="ui.visuallyHidden()">
          {{ !valid ? 'Error: ' : 'Hint: ' }}
        </span>

        <span>{{ !valid && validation ? validation : hint }}</span>
      </span>
    </transition>
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot for the label
 *
 * @csspart root - The radiogroup wrapper element carrying the disabled/error states
 * @csspart label - The group label above the radio buttons
 * @csspart items - The wrapper around the rendered radio button rows
 * @csspart message - The hint/error message line below the radios
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-radio
 */
import { mdiCloseCircle } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  type ComponentPublicInstance,
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useId,
  watch,
} from 'vue';

import { emitModelValue } from '../../shared/emitModelValue';
import { useRipple } from '../../shared/useRipple';

/** Events dispatched by `<c-radio-group>`. */
interface CRadioGroupEvents {
  /**
   * Fired when a radio option is selected, carrying the selected item's
   * value — or the whole item object when `return-object` is set.
   */
  changeValue: number | RadioItem | string;
  /**
   * Native bubbling input event fired on selection so a plain Vue `v-model`
   * works without the `v-control` directive. No detail.
   */
  input: void;
  /**
   * v-model contract event fired on selection, carrying the selected item's
   * value — or the whole item object when `return-object` is set.
   */
  'update:value': number | RadioItem | string;
}

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); the old
 * `--_c-radio-group-*` indirection layer is dropped for direct token utilities.
 * Customization is via `::part()` (ADR-0006); there is no `override` prop.
 *
 * Each radio's ring is a `.c-radio__selection` box (ring via `box-shadow`) and
 * the filled dot is its `::after` pseudo. The dot's SELECTED state
 * (`input:checked ~ .ripple .selection::after { transform: scale(1) }`),
 * the hover tint, and the focus-visible outline are all sibling-driven (they
 * depend on the live `:checked`/`:focus-visible` of a sibling input) and so
 * cannot be `tv` variants — they remain in the escape-hatch `<style>` below
 * (ADR-0007). The STATIC dot look (`after:` size/position/scale-0/transition)
 * is authored here in `tv`.
 *
 * `inline`, `disabled`, and error (`!valid`) map to props, so the layout and
 * colour changes they drive are `tv` variants/compoundVariants here.
 */
const radioGroup = tv({
  compoundVariants: [
    {
      class: {
        message: 'text-error',
        required: 'text-error',
        ripple: 'text-error',
        root: 'text-error',
      },
      disabled: false,
      error: true,
    },
    {
      class: {
        message: 'text-error',
      },
      disabled: true,
      error: true,
    },
  ],
  defaultVariants: {
    disabled: false,
    error: false,
    inline: false,
  },
  slots: {
    input: 'absolute opacity-0 cursor-pointer h-0 w-0',
    items: 'flex flex-wrap',
    label: 'text-left',
    message:
      'flex items-start gap-1 px-3 text-xs leading-none min-h-4 text-on-surface-muted',
    messageIcon: 'fill-current h-4 w-4 relative -top-0.5 shrink-0',
    radio:
      'flex items-start relative cursor-pointer text-base select-none gap-1 leading-[1.2]',
    radioLabel: 'pt-3',
    required: 'text-error',
    // 42px circular ripple surface around the radio ring.
    ripple:
      'inline-block relative h-[42px] w-[42px] min-w-[42px] rounded-full overflow-hidden text-primary transition-colors duration-200 ease-in-out',
    // Material click ripple: an absolutely-positioned circle, always centred in
    // the 42px surface (which clips via overflow-hidden + rounded-full). Tweens
    // scale/opacity via the `transition` util (ADR-0004, no bespoke @keyframes).
    // `bg-current` so it follows the ripple surface's state colour.
    rippleEffect:
      'pointer-events-none absolute rounded-full bg-current transition-[transform,opacity] duration-[600ms] ease-out',
    root: 'flex flex-col gap-1 w-fit',
    // 20x20 ring (box-shadow inset) with a hidden dot `::after`; the dot is
    // revealed by the sibling-driven escape-hatch rule on :checked.
    // Resting state uses `after:[transform:scale(0)]` (NOT `after:scale-0`,
    // which sets the separate CSS `scale` property and would survive the
    // escape-hatch `transform: scale(1)`, pinning the dot permanently invisible).
    selection:
      "absolute top-[11px] left-[11px] h-5 w-5 bg-transparent rounded-full shadow-[inset_0_0_0_2px_currentColor] transition-shadow duration-150 ease-in-out after:content-[''] after:absolute after:top-[5px] after:left-[5px] after:h-2.5 after:w-2.5 after:rounded-full after:bg-current after:[transform:scale(0)] after:transition-transform after:duration-150 after:ease-in-out",
    visuallyHidden:
      'absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(1px,1px,1px,1px)]',
  },
  variants: {
    disabled: {
      false: {},
      true: {
        ripple: 'text-on-surface-muted',
        root: 'text-on-surface-muted opacity-75 cursor-default',
      },
    },
    error: {
      false: {},
      true: {},
    },
    inline: {
      false: { items: 'flex-col gap-0.5' },
      // Column layout: items stack with a 2px gap. Inline: row with 12px gap.
      true: { items: 'flex-row gap-3' },
    },
  },
});

interface CRadioGroupProps {
  /**
   * Disable the radio group
   *
   * @seeded from csc-ui — verify
   */
  disabled?: boolean;
  /**
   * Hide the hint and error messages
   *
   * @seeded from csc-ui — verify
   */
  hideDetails?: boolean;
  /**
   * Hint text for the input
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hint?: string;
  /**
   * Id of the element
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hostId?: string;
  /**
   * Display radio buttons inline
   *
   * @seeded from csc-ui — verify
   */
  inline?: boolean;
  /**
   * Radio group items
   *
   * @seeded from csc-ui — verify
   */
  items?: RadioItem[];
  /**
   * Label of the radio group
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  label?: string;
  /**
   * Set as required
   *
   * @seeded from csc-ui — verify
   */
  required?: boolean;
  /**
   * Return the whole item object
   *
   * @seeded from csc-ui — verify
   */
  returnObject?: boolean;
  /**
   * Set the validity of the input
   *
   * @seeded from csc-ui — verify
   */
  valid?: boolean;
  /**
   * Custom validation message
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  validation?: string;
  /**
   * Value of the radio group
   *
   * @seeded from csc-ui — verify
   */
  value?: null | number | RadioItem | string;
}

interface RadioItem {
  disabled?: boolean;
  name: string;
  value: number | string;
}

const props = withDefaults(defineProps<CRadioGroupProps>(), {
  disabled: false,
  hideDetails: false,
  hint: '',
  hostId: '',
  inline: false,
  items: () => [],
  label: '',
  required: false,
  returnObject: false,
  valid: true,
  validation: 'Required field',
  value: null,
});

const ui = computed(() =>
  radioGroup({
    disabled: props.disabled,
    error: !props.valid,
    inline: props.inline,
  }),
);

const errorIconPath = mdiCloseCircle;

const host = useHost();

// Whether the default slot carries actual LABEL content. We inspect the host's
// light-DOM children directly rather than the rendered `<slot>` because the slot
// only renders when the label is shown — querying it would be circular (the
// label's v-if depends on this flag). Slotted <c-radio> children are the radio
// items, not label content, so they're excluded. Kept in sync by the same
// MutationObserver that scans the radios (childList + characterData + subtree).
const hasLabelContent = ref(false);

const updateHasLabel = () => {
  if (!host) return;
  hasLabelContent.value = Array.from(host.childNodes).some((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? '').trim().length > 0;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      return (node as Element).tagName !== 'C-RADIO';
    }

    return false;
  });
};

// One ripple composable drives every item: the surface is resolved per-spawn
// from the per-index container ref, and each ripple is tagged with its item
// index (`group`) so the template renders it into the right surface.
const rippleContainers = ref<(HTMLElement | null)[]>([]);

const setRippleRef = (
  el: ComponentPublicInstance | Element | null,
  index: number,
) => {
  rippleContainers.value[index] = el instanceof HTMLElement ? el : null;
};

const { ripples, spawn } = useRipple({});

const autoId = useId();

const radioName = computed(() => props.hostId || autoId);

// Items scanned from slotted <c-radio> children. When present, these take
// precedence over the `items` prop — matches Stencil behaviour where the
// slot wins. Returning objects is forced off in slot mode because <c-radio>
// only carries a primitive `value`.
const scannedItems = ref<RadioItem[]>([]);

const slotMode = ref(false);

const resolvedItems = computed<RadioItem[]>(() =>
  slotMode.value ? scannedItems.value : props.items,
);

const internalValue = ref<null | number | RadioItem | string>(props.value);
watch(
  () => props.value,
  (v) => {
    internalValue.value = v;
  },
);

const isChecked = (item: RadioItem) => {
  if (slotMode.value || !props.returnObject) {
    return internalValue.value === item.value;
  }

  return (internalValue.value as null | RadioItem)?.value === item.value;
};

const select = (item: RadioItem, index: number) => {
  if (item.disabled || props.disabled) return;
  // Click ripple, always centred in the item's 42px surface (matches the
  // original which passed `center: true` for both pointer and keyboard).
  spawn(null, {
    center: true,
    container: () => rippleContainers.value[index],
    group: index,
  });

  // Typed against the event map so the emitted detail is compile-checked.
  const next: CRadioGroupEvents['changeValue'] =
    !slotMode.value && props.returnObject ? item : item.value;
  internalValue.value = next;
  // changeValue/update:value + native `input` (plain v-model) + host `value`
  // mirror. The value watch above is visuals-only, so no loop.
  emitModelValue(host, next);
};

const onKeyDown = (event: KeyboardEvent, item: RadioItem, index: number) => {
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    select(item, index);
  }
};

const messageVisible = computed(() =>
  Boolean(props.hint || (!props.valid && props.validation)),
);

const messageKey = computed(() =>
  !props.valid ? `error:${props.validation}` : `hint:${props.hint}`,
);

const scanChildren = () => {
  if (!host) return;

  const radios = Array.from(
    host.querySelectorAll(':scope > c-radio'),
  ) as HTMLElement[];

  if (radios.length === 0) {
    slotMode.value = false;

    return;
  }

  slotMode.value = true;
  scannedItems.value = radios.map((r) => {
    if (r.hasAttribute('checked') && internalValue.value == null) {
      const v = r.getAttribute('value') ?? '';
      internalValue.value = v;
      // Surface the slotted default through both legacy events and native
      // v-model (input + host `value`).
      emitModelValue(host, v);
    }

    return {
      disabled: r.hasAttribute('disabled'),
      name: (r.textContent || '').trim(),
      value: r.getAttribute('value') ?? '',
    };
  });
};

const syncFromLightDom = () => {
  scanChildren();
  updateHasLabel();
};

let observer: MutationObserver | null = null;
onMounted(() => {
  syncFromLightDom();

  if (host && typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(syncFromLightDom);
    observer.observe(host, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
  }
});
onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. Everything static lives in the `tv` config above. What remains:

  - `:host{display:flex;...}` — restores a box on the host (the global sheet
    sets `:host{display:contents}`) so the group lays out as a flex column with
    a 4px gap and fit-content width. Targets the host, not a `tv` element.
  - The sibling-driven dot reveal `input:checked ~ .ripple .selection::after
    { transform: scale(1) }`, the per-item hover tint, and the focus-visible
    outline — all depend on the live `:checked`/`:focus-visible` of a SIBLING
    input, which `tv` variants cannot observe. The static dot look is in `tv`.
  - The disabled per-item recolour of the sibling-driven dot/ring, scoped via
    the `.c-radio--disabled` / `.c-radio--error` state classes the template
    stamps on each item.
  - The hint/error message slide Transition keyframes (Vue transition classes).
  Tokens only.
-->
<style>
:host {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: fit-content;
}

/* Selected: reveal the filled dot. Sibling-input selector. */
.c-radio input:checked ~ .c-radio__ripple .c-radio__selection::after {
  transform: scale(1);
}

/* Hover tint on the ripple (skipped when the item is disabled). */
.c-radio:not(.c-radio--disabled) .c-radio__ripple:hover {
  background-color: color-mix(in srgb, var(--c-primary) 10%, transparent);
}

.c-radio input:focus {
  outline: none;
}

.c-radio input:focus-visible + .c-radio__ripple {
  outline: 2px var(--c-primary) solid;
}

.c-radio--error input:focus-visible + .c-radio__ripple {
  outline-color: var(--c-error);
}

/* Disabled item: dim the WHOLE item — the ring/dot AND the text label — and
 * drop the pointer cursor. This covers the per-item disabled case (a single
 * `disabled` radio in an enabled group), which the group-level tv `disabled`
 * variant does not reach. Matches the original `.c-radio--disabled` which set
 * colour + opacity on the whole `.c-radio`. The label text inherits this
 * `color`; the ripple needs its own override because its tv slot hardcodes
 * the primary role. Opacity lives only here (not also on the ripple) to avoid
 * double-dimming. */
.c-radio--disabled {
  color: var(--c-on-surface-muted);
  cursor: default;
  opacity: 0.75;
}

.c-radio--disabled .c-radio__ripple {
  color: var(--c-on-surface-muted);
  cursor: default;
}

.c-radio--error:not(.c-radio--disabled) .c-radio__ripple {
  color: var(--c-error);
}

/* Vertical slide + fade between hint and error messages. */
.c-radio-group-message-enter-active,
.c-radio-group-message-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.25, 0.8, 0.5, 1),
    transform 0.2s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-radio-group-message-enter-from,
.c-radio-group-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
