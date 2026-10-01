<template>
  <!-- Anchor wrapper: a shadow-DOM box around the value field. CSS anchor
       names are tree-scoped, so the anchor must live in the same shadow root
       as the panel (`useAnchoredPanel`). -->
  <span :ref="bindAnchor" :style="anchorStyle" class="block w-full">
    <c-input
      :ref="bindField"
      :active="focused || open"
      :data-hide-details="String(hideDetails)"
      :disabled
      :error-message
      :filled="hasText"
      :hint
      :input-id
      :label
      :label-on-top
      :required
      :shadow
      :size
      :valid
    >
      <!-- The editable field (ADR-0058): typing never opens the panel. Under
           `range` a second input holds the end, both in one field box. -->
      <div
        :class="ui.content()"
        class="c-input__content"
        @focusin="onFocusIn"
        @focusout="onFocusOut"
      >
        <input
          :id="inputId"
          :ref="bindStart"
          :aria-invalid="!valid || badStart || undefined"
          :aria-label="inputLabel('start')"
          :class="ui.input({ start: range })"
          :disabled
          :inputmode
          :name="name || undefined"
          :placeholder
          :required
          :style="startWidth"
          :value="startText"
          autocomplete="off"
          part="input"
          type="text"
          @blur="commitText('start')"
          @input="onTextInput('start', $event)"
          @keydown="onKeyDown('start', $event)"
        />

        <template v-if="range">
          <span
            :class="ui.separator({ hidden: !showSeparator })"
            aria-hidden="true"
            part="separator"
          >
            –
          </span>

          <input
            :ref="bindEnd"
            :aria-invalid="!valid || badEnd || undefined"
            :aria-label="inputLabel('end')"
            :class="ui.input()"
            :disabled
            :inputmode
            :placeholder
            :value="endText"
            autocomplete="off"
            part="input"
            type="text"
            @blur="commitText('end')"
            @input="onTextInput('end', $event)"
            @keydown="onKeyDown('end', $event)"
          />
        </template>
      </div>

      <span slot="post" :class="ui.post()">
        <c-icon-button
          v-if="clearable && hasContent"
          :aria-label="clearLabel"
          :disabled
          size="x-small"
          text
          @click="onClear"
        >
          <c-icon :path="mdiClose" :size="20" />
        </c-icon-button>

        <slot name="trigger" />
      </span>
    </c-input>
  </span>
</template>

<script setup lang="ts">
/**
 * Internal shared value field of the typed pickers (`c-date-picker`,
 * `c-time-picker`): the anchor wrapper, the inner `c-input`, one input or a
 * start and an end input under `range`, and the clear button, driven by the
 * host's `useTypedField` state. NOT a registered custom element — rendered
 * inside the host's shadow root, so its stamped parts (`input`, `separator`)
 * join each host's `::part()` contract (the analyzer merges them). The host
 * puts its panel button in the `trigger` slot.
 *
 * No `<style>` block on purpose: a non-element SFC has no shadow root of its
 * own to adopt a per-type sheet into. The `::placeholder` rule for the
 * `c-typed-field__input` class lives in each host's escape-hatch block.
 */
import { mdiClose } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { type ComponentPublicInstance } from 'vue';

import type { CFieldSize } from '../types';

import { type TypedField } from './useTypedField';

const typedField = tv({
  slots: {
    content: 'flex items-center w-full min-w-0 gap-1',
    // The value text colour is set explicitly, as in c-text-field: c-input
    // drives an inheritable `color` for its state cascade.
    input:
      'c-typed-field__input bg-transparent border-0 outline-none m-0 [font:inherit] text-base leading-5 text-on-surface disabled:text-on-surface-muted [caret-color:var(--c-primary)] flex-auto min-w-0 w-full py-2 max-h-8 tabular-nums',
    post: 'inline-flex items-center gap-0.5 -mr-1.5',
    separator: 'shrink-0 mx-1 text-on-surface-muted',
  },
  variants: {
    hidden: { true: { separator: 'invisible' } },
    // The range start is as wide as its text, so the separator follows it
    // with even space both sides; the end input fills the rest.
    start: { true: { input: 'flex-none w-auto [field-sizing:content]' } },
  },
});

const ui = typedField();

const props = defineProps<{
  /** The `anchor-name` style from `useAnchoredPanel`. */
  anchorStyle: string;
  /** Accessible label of the clear button. */
  clearLabel: string;
  clearable: boolean;
  disabled: boolean;
  errorMessage: string;
  /** The `useTypedField` state this field renders. */
  field: TypedField;
  hideDetails: boolean;
  hint: string;
  inputId: string;
  /** The virtual keyboard the inputs ask for. */
  inputmode: 'numeric' | 'text';
  label: string;
  labelOnTop: boolean;
  name: string;
  /** Whether the host's panel is open — the field stays active. */
  open: boolean;
  required: boolean;
  shadow: boolean;
  size: CFieldSize;
  valid: boolean;
}>();

// Top-level bindings, so the template unwraps them.
const {
  badEnd,
  badStart,
  commitText,
  endText,
  focused,
  hasContent,
  hasText,
  inputLabel,
  onClear,
  onFocusOut,
  onKeyDown,
  onTextInput,
  placeholder,
  range,
  showSeparator,
  startText,
  startWidth,
} = props.field;

const onFocusIn = () => {
  props.field.focused.value = true;
};

type TemplateRefValue = ComponentPublicInstance | Element | null;

const bindAnchor = (el: TemplateRefValue) => {
  props.field.anchor.value = el as HTMLElement | null;
};

const bindField = (el: TemplateRefValue) => {
  props.field.field.value = el as HTMLElement | null;
};

const bindStart = (el: TemplateRefValue) => {
  props.field.startInput.value = el as HTMLInputElement | null;
};

const bindEnd = (el: TemplateRefValue) => {
  props.field.endInput.value = el as HTMLInputElement | null;
};
</script>
