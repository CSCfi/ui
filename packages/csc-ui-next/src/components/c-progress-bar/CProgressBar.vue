<template>
  <label
    class="c-progress"
    :class="{
      'c-progress--indeterminate': indeterminate,
      'c-progress--adjacent-details': singleLine,
    }"
    :style="{ '--_c-progress-bar-value': `${safeValue}%` }"
  >
    <progress
      role="progressbar"
      max="100"
      :value="indeterminate ? undefined : safeValue"
      :aria-valuenow="indeterminate ? undefined : String(safeValue)"
    >
      {{ indeterminate ? '' : `${safeValue}%` }}
    </progress>
  </label>

  <div
    v-if="!indeterminate && !hideDetails"
    class="c-progress__percentage"
    :class="{
      'c-progress__percentage--negative': value < 0,
      'c-progress--adjacent-details': singleLine,
    }"
  >
    {{ value }} % {{ label }}
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useHost, watchEffect } from 'vue';

// Multi-root template (fragment) + we write to the host below — keep
// fallthrough attrs on the host element instead of tripping the "renders
// fragment" warning.
defineOptions({ inheritAttrs: false });

const props = defineProps({
  value: { type: Number, default: 0 },
  hideDetails: { type: Boolean, default: false },
  singleLine: { type: Boolean, default: false },
  label: { type: String, default: '' },
  indeterminate: { type: Boolean, default: false },
});

const safeValue = computed(() => {
  if (props.value >= 0 && props.value <= 100) return props.value;
  if (props.value < 0) return 0;
  return 100;
});

const host = useHost();
onMounted(() => {
  if (!host) return;
  watchEffect(() => {
    host.setAttribute('aria-busy', (!props.indeterminate).toString());
    host.setAttribute('title', `${safeValue.value} %`);
  });
});
</script>

<style>
:host {
  --_c-progress-bar-color: var(--c-progress-bar-color, var(--c-primary-600));
  --_c-progress-bar-background-color: var(
    --c-progress-bar-background-color,
    var(--c-tertiary-200)
  );
  --_c-progress-bar-border-width: var(--c-progress-bar-border-width, 4px);
  --_c-progress-bar-height: var(--c-progress-bar-height, 16px);
  --_c-progress-bar-value: var(--c-progress-bar-value, 0%);

  align-items: center;
  display: flex;
  flex-wrap: wrap;
}

.c-progress {
  position: relative;
  background-color: var(--_c-progress-bar-background-color);
  border-radius: var(--_c-progress-bar-height);
  box-shadow: 0 0 0 var(--_c-progress-bar-border-width)
    var(--_c-progress-bar-background-color);
  flex-basis: 100%;
  height: calc(
    var(--_c-progress-bar-height) - calc(var(--_c-progress-bar-border-width) * 2)
  );
  margin: var(--_c-progress-bar-border-width);
  opacity: 0.75;
  overflow: hidden;
  transform: translateZ(0);
  width: calc(100% - calc(var(--_c-progress-bar-border-width) * 2));
}

.c-progress.c-progress--adjacent-details {
  flex: 1;
}

.c-progress__percentage {
  flex-basis: 100%;
  font-size: 14px;
  margin-top: 2px;
  text-align: end;
  white-space: nowrap;
  padding-left: 16px;
}

.c-progress__percentage--negative {
  color: var(--c-error-600);
}

.c-progress__percentage.c-progress--adjacent-details {
  flex: 0;
}

.c-progress progress {
  background-color: var(--_c-progress-bar-background-color);
  border-radius: var(--_c-progress-bar-height);
  width: 100%;
  overflow: hidden;
  height: calc(
    var(--_c-progress-bar-height) - calc(var(--_c-progress-bar-border-width) * 2)
  );
  position: absolute;
  border: none;
  appearance: none;
}

.c-progress progress:focus { outline: none; }

.c-progress:focus-within {
  outline: 2px var(--c-primary-600) solid;
  outline-offset: 6px;
}

.c-progress progress::-webkit-progress-bar {
  background-color: transparent;
}

.c-progress progress::-webkit-progress-value {
  transition: width 0.3s ease-in-out;
  background-color: var(--_c-progress-bar-color);
  border-radius: var(--_c-progress-bar-height);
}

.c-progress progress::-moz-progress-bar {
  transition: padding-bottom 1s;
  padding-left: 60px;
  padding-bottom: var(--_c-progress-bar-value);
  background-color: var(--_c-progress-bar-color);
  height: 0;
  transform-origin: 0 0;
  transform: rotate(-90deg) translateX(-60px);
}

.c-progress progress:indeterminate::-moz-progress-bar { width: 0; }

.c-progress--indeterminate::before {
  content: '';
  z-index: 1;
  position: absolute;
  background-color: var(--_c-progress-bar-color);
  border-radius: var(--_c-progress-bar-height);
  left: -100%;
  height: 100%;
  transform: translateX(var(--_c-progress-bar-value, 0%));
  transition: transform 0.3s ease-in-out;
  animation: c-progress-indeterminate 2s infinite linear;
  width: 50%;
  transform-origin: 0% 50%;
}

@keyframes c-progress-indeterminate {
  0% { transform: translateX(100%) scaleX(1); }
  30% { transform: translateX(170%) scaleX(1.75); }
  70% { transform: translateX(500%) scaleX(0.1); }
  100% { transform: translateX(500%) scaleX(0.1); }
}
</style>
