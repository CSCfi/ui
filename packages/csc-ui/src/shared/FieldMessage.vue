<template>
  <div v-if="!coerceBoolean(hideDetails)" :class="ui.root()" :part>
    <Transition
      enter-active-class="transition-[opacity,translate] duration-200 ease-standard"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition-[opacity,translate] duration-200 ease-standard"
      leave-to-class="opacity-0 -translate-y-1"
      mode="out-in"
    >
      <span v-if="messageVisible" :key="messageKey" :class="ui.line()">
        <svg
          v-if="showError"
          :class="ui.icon()"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path :d="errorIconPath" />
        </svg>

        <span :class="ui.visuallyHidden()">
          {{ showError ? 'Error: ' : 'Hint: ' }}
        </span>

        <span>{{ showError ? errorMessage : hint }}</span>
      </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/**
 * Internal shared hint/error message line under a form control: the message
 * AREA is always in the flow (unless `hide-details`), reserving its min-height
 * so a validation error appearing at runtime doesn't push the content below it
 * down. Only the inner line mounts/unmounts, keyed on message identity
 * (hint vs error, or text content) so the swap slides. NOT a registered custom
 * element — imported into a host component's template and rendered inside its
 * shadow root, so the stamped `part` participates in that component's
 * `::part()` contract.
 *
 * The error message shows only while invalid AND supplied; an invalid control
 * without one keeps showing its hint AS a hint (neutral colour) — see
 * CONTEXT.md "Error message". Validation itself is the consumer's job.
 *
 * The hint↔error swap uses `<Transition>`'s explicit class props bound to
 * Tailwind utilities instead of a named transition: a non-element SFC has no
 * shadow root of its own to adopt a per-type sheet into, so no `<style>` block
 * (FormLabel precedent). Semantic-token utilities only.
 *
 * Currently used by `c-radio-group`; `c-input`, `c-checkbox`, and `c-message`
 * carry older hand-rolled copies of this anatomy and are follow-up refit
 * candidates (ADR-0031).
 */
import { mdiCloseCircle } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

import { coerceBoolean } from './coerceBoolean';

const fieldMessage = tv({
  slots: {
    icon: 'fill-current h-4 w-4 relative -top-0.5 shrink-0',
    line: 'flex items-start gap-1',
    root: 'px-3 text-xs leading-none min-h-4 text-on-surface-muted',
    visuallyHidden:
      'absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(1px,1px,1px,1px)]',
  },
  variants: {
    // The message line recolours separately from the control: an invalid
    // control with no `errorMessage` keeps showing its hint AS a hint.
    error: {
      true: { root: 'text-error' },
    },
  },
});

const errorIconPath = mdiCloseCircle;

interface FieldMessageProps {
  /** Consumer-supplied text shown in place of the hint while invalid. */
  errorMessage?: string;
  /** Suppress the whole message area (no reserved height either). */
  hideDetails?: boolean;
  /** Neutral helper text shown while valid (or when no error message is supplied). */
  hint?: string;
  /** Part name stamped on the message area (`message` unless the host reserves it). */
  part?: string;
  /** Host control's validity; `false` switches to the error message when one is supplied. */
  valid?: boolean;
}

const props = withDefaults(defineProps<FieldMessageProps>(), {
  errorMessage: '',
  hideDetails: false,
  hint: '',
  part: 'message',
  valid: true,
});

// Hosts pass their custom-element props straight through, where boolean
// attribute presence can arrive as the raw string "" (falsy) and "false" as
// a truthy string — coerce before any conditional logic.
const showError = computed(
  () => !coerceBoolean(props.valid) && Boolean(props.errorMessage),
);

const ui = computed(() => fieldMessage({ error: showError.value }));

const messageVisible = computed(() => Boolean(props.hint || showError.value));

const messageKey = computed(() =>
  showError.value ? `error:${props.errorMessage}` : `hint:${props.hint}`,
);
</script>
