<template>
  <transition mode="out-in" name="c-message">
    <div v-if="visible" :key="messageKey" :class="ui.root()" part="root">
      <span v-if="showError" :class="ui.line()">
        <svg :class="ui.icon()" aria-hidden="true" viewBox="0 0 24 24">
          <path :d="errorIconPath" />
        </svg>

        <span :class="ui.visuallyHidden()">Error:</span>

        <span>{{ errorMessage }}</span>
      </span>

      <span v-else :class="ui.line()">
        <span :class="ui.visuallyHidden()">Hint:</span>

        <span>{{ hint }}</span>
      </span>
    </div>
  </transition>
</template>

<script setup lang="ts">
/**
 * @csspart root - The message row showing the hint or error message text
 */
import { mdiCloseCircle } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004). The old
 * `--_c-message-*` indirection vars are dropped: the hint colour maps to the
 * muted on-surface token and the error colour to the error status role, selected
 * by the `error` variant (ADR-0010) — keyed on an error message actually being
 * shown, not on `valid` alone, so an invalid parent with no message keeps its
 * hint neutral. Consumer customization is via `::part()` (ADR-0006).
 */
const message = tv({
  defaultVariants: {
    error: false,
  },
  slots: {
    icon: 'fill-current size-4 relative -top-0.5 shrink-0',
    line: 'flex items-start gap-1 min-h-4 text-current',
    root: 'text-xs min-h-4 px-3 leading-none',
    // Visually-hidden but screen-reader accessible.
    visuallyHidden:
      'absolute w-px h-px m-[-1px] p-0 overflow-hidden whitespace-nowrap border-0 [clip:rect(0_0_0_0)]',
  },
  variants: {
    error: {
      false: { root: 'text-on-surface-muted' },
      true: { root: 'text-error' },
    },
  },
});

interface CMessageProps {
  /**
   * Error message shown in place of the hint while the parent is invalid
   *
   * @freeform
   */
  errorMessage?: string;
  /**
   * Hint text for the input
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hint?: string;
  /**
   * Id of the related input element
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  inputId?: string;
  /**
   * Parent validíty
   *
   * @seeded from csc-ui — verify
   */
  valid?: boolean;
}

const props = withDefaults(defineProps<CMessageProps>(), {
  errorMessage: '',
  hint: '',
  inputId: '',
  valid: true,
});

const showError = computed(() => !props.valid && Boolean(props.errorMessage));

const ui = computed(() => message({ error: showError.value }));

const errorIconPath = mdiCloseCircle;

const visible = computed(() => Boolean(props.hint || showError.value));

const messageKey = computed(() =>
  showError.value ? `error:${props.errorMessage}` : `hint:${props.hint}`,
);
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The static styling lives in the `tv` config above; here remain:
    - `:host{display:block}` — restores a real box on the host (the global
      sheet sets `:host{display:contents}`, which would otherwise collapse the
      element so it can't be positioned by a parent — e.g. c-otp-input places
      it as a grid item via `grid-column`/`grid-row`, which a `display:contents`
      box ignores). Matches the original c-message `:host{display:block}`. The
      per-type sheet is adopted after the shared sheet, so it wins.
    - the Vue <Transition> enter/leave classes (Vue toggles these on the
      transitioning element, so they can't be a tv slot) implementing the
      vertical slide + fade between the hint and error states — same pattern as
      the inline message in c-checkbox / c-radio-group.
-->
<style>
:host {
  display: block;
}

.c-message-enter-active,
.c-message-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.25, 0.8, 0.5, 1),
    transform 0.2s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-message-enter-from,
.c-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
