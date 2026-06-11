<template>
  <div
    class="c-status"
    :class="type ? `c-status--${type}` : null"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  type: { type: String, default: '' },
});
</script>

<style>
:host {
  --_c-status-background-color: var(--c-status-background-color, var(--c-primary-200));
  --_c-status-info-text-color: var(--c-status-info-text-color, var(--c-info-800));
  --_c-status-info-background-color: var(--c-status-info-background-color, var(--c-info-200));
  --_c-status-warning-text-color: var(--c-status-warning-text-color, var(--c-warning-800));
  --_c-status-warning-background-color: var(--c-status-warning-background-color, var(--c-warning-200));
  --_c-status-error-text-color: var(--c-status-error-text-color, var(--c-error-800));
  --_c-status-error-background-color: var(--c-status-error-background-color, var(--c-error-200));
  --_c-status-success-text-color: var(--c-status-success-text-color, var(--c-success-800));
  --_c-status-success-background-color: var(--c-status-success-background-color, var(--c-success-200));

  display: block;
}

.c-status {
  align-items: center;
  background-color: var(--_c-status-background-color);
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px currentColor;
  color: var(--c-primary-800);
  display: inline-flex;
  font-size: 14px;
  justify-content: center;
  line-height: 1;
  min-height: 24px;
  min-width: 88px;
  overflow: hidden;
  padding: 4px 16px;
  position: relative;
}

.c-status--info {
  color: var(--_c-status-info-text-color);
  background-color: var(--_c-status-info-background-color);
}

.c-status--warning {
  color: var(--_c-status-warning-text-color);
  background-color: var(--_c-status-warning-background-color);
}

.c-status--error {
  color: var(--_c-status-error-text-color);
  background-color: var(--_c-status-error-background-color);
}

.c-status--success {
  color: var(--_c-status-success-text-color);
  background-color: var(--_c-status-success-background-color);
}
</style>
