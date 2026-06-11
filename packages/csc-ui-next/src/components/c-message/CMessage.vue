<template>
  <Transition name="c-message" mode="out-in">
    <div
      v-if="visible"
      :key="messageKey"
      class="c-message-item"
      :class="`c-message-item--${valid ? 'hint' : 'error'}`"
    >
      <span v-if="!valid">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="errorIconPath" />
        </svg>
        <span class="visuallyhidden">Error: </span>
        <span>{{ validation }}</span>
      </span>
      <span v-else>
        <span class="visuallyhidden">Hint: </span>
        <span>{{ hint }}</span>
      </span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { mdiCloseCircle } from '@mdi/js';
import { computed } from 'vue';

const props = defineProps({
  hint: { type: String, default: '' },
  inputId: { type: String, default: '' },
  valid: { type: Boolean, default: true },
  validation: { type: String, default: 'Required field' },
});

const errorIconPath = mdiCloseCircle;

const visible = computed(() =>
  Boolean(props.hint || (!props.valid && props.validation)),
);

const messageKey = computed(() =>
  !props.valid ? `error:${props.validation}` : `hint:${props.hint}`,
);
</script>

<style>
:host {
  --_c-message-error-color: var(--c-message-error-color, var(--c-error-600));
  --_c-message-hint-color: var(--c-message-hint-color, var(--c-text-system));
  --_c-message-padding: var(--c-message-padding, 0 12px);

  display: block;
  line-height: 1;
  padding: var(--_c-message-padding);
}

.c-message-item {
  font-size: 12px;
  min-height: 16px;
}

.c-message-item--hint {
  color: var(--_c-message-hint-color);
}

.c-message-item--error {
  color: var(--_c-message-error-color);
}

.c-message-item > span {
  align-items: flex-start;
  color: currentColor;
  display: flex;
  gap: 4px;
  min-height: 16px;
}

.c-message-item svg {
  fill: currentColor;
  height: 16px;
  width: 16px;
  position: relative;
  top: -2px;
  flex-shrink: 0;
}

.visuallyhidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* Vertical slide + fade between hint and error — same pattern as the
 * inline message in c-checkbox/c-radio-group. */
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
