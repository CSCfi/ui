<template>
  <transition mode="out-in" name="c-message">
    <div v-if="visible" :key="messageKey" :class="ui.root()" part="root">
      <span v-if="!valid" :class="ui.line()">
        <svg :class="ui.icon()" aria-hidden="true" viewBox="0 0 24 24">
          <path :d="errorIconPath" />
        </svg>

        <span :class="ui.visuallyHidden()">Error:</span>

        <span>{{ validation }}</span>
      </span>

      <span v-else :class="ui.line()">
        <span :class="ui.visuallyHidden()">Hint:</span>

        <span>{{ hint }}</span>
      </span>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { mdiCloseCircle } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004). The old
 * `--_c-message-*` indirection vars are dropped: the hint colour maps to the
 * muted on-surface token and the error colour to the error status role, selected
 * by the `valid` variant (ADR-0010). Consumer customization is via `::part()`
 * (ADR-0006).
 */
const message = tv({
  defaultVariants: {
    valid: true,
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
    valid: {
      false: { root: 'text-error' },
      true: { root: 'text-on-surface-muted' },
    },
  },
});

interface CMessageProps {
  hint?: string;
  inputId?: string;
  valid?: boolean;
  validation?: string;
}

const props = withDefaults(defineProps<CMessageProps>(), {
  hint: '',
  inputId: '',
  valid: true,
  validation: 'Required field',
});

const ui = computed(() => message({ valid: props.valid }));

const errorIconPath = mdiCloseCircle;

const visible = computed(() =>
  Boolean(props.hint || (!props.valid && props.validation)),
);

const messageKey = computed(() =>
  !props.valid ? `error:${props.validation}` : `hint:${props.hint}`,
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
