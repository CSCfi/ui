<template>
  <div :class="ui.root()" part="root">
    <label
      :class="[
        ui.bar({ singleLine }),
        { 'c-progress--indeterminate': indeterminate },
      ]"
      :style="{ '--_c-progress-bar-value': `${safeValue}%` }"
      class="c-progress"
      part="bar"
    >
      <progress
        :aria-valuenow="indeterminate ? undefined : String(safeValue)"
        :value="indeterminate ? undefined : safeValue"
        max="100"
        role="progressbar"
      >
        {{ indeterminate ? '' : `${safeValue}%` }}
      </progress>
    </label>

    <div
      v-if="!indeterminate && !hideDetails"
      :class="ui.details({ singleLine, negative: value < 0 })"
      part="details"
    >
      {{ value }} % {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed, onMounted, useHost, watchEffect } from 'vue';

// Multi-root-ish template still writes to the host below — keep fallthrough
// attrs on the host element instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004): the `root`
 * flex wrapper, the `bar` (label) box, and the `details` percentage line, with
 * the `singleLine` / `negative` states as variants. The old per-component
 * `--c-progress-bar-*` indirection vars are dropped; values are authored
 * directly against design tokens (`tertiary-200`, `primary-600`, `error-600`)
 * and the literal 16px height / 4px border the defaults resolved to.
 *
 * The native `<progress>` element (with its `::-webkit-*` / `::-moz-*`
 * pseudo-elements) and the indeterminate `::before` + `@keyframes` are not
 * expressible as utilities, so they remain in the escape-hatch <style> below
 * (ADR-0007). The `c-progress` / `c-progress--indeterminate` marker classes are
 * the hooks those rules target; `--_c-progress-bar-value` carries the dynamic
 * percentage into the Firefox/indeterminate rules. Customization is via the
 * stamped parts (ADR-0006).
 */
const progress = tv({
  defaultVariants: {
    negative: false,
    singleLine: false,
  },
  slots: {
    bar: 'relative basis-full h-2 w-[calc(100%-8px)] m-1 overflow-hidden rounded-2xl opacity-75 transform-gpu bg-tertiary-200 shadow-[0_0_0_4px_var(--c-tertiary-200)] focus-within:outline-2 focus-within:outline-solid focus-within:outline-primary-600 focus-within:outline-offset-6',
    details: 'basis-full mt-0.5 pl-4 text-sm text-end whitespace-nowrap',
    // 16px design height minus 2×4px border = 8px (h-2); 100% minus 2×4px (w-...).
    root: 'flex flex-wrap items-center',
  },
  variants: {
    negative: {
      true: { details: 'text-error-600' },
    },
    singleLine: {
      true: {
        bar: 'flex-1',
        details: 'flex-none',
      },
    },
  },
});

const ui = computed(() => progress());

interface CProgressBarProps {
  hideDetails?: boolean;
  indeterminate?: boolean;
  label?: string;
  singleLine?: boolean;
  value?: number;
}

const props = withDefaults(defineProps<CProgressBarProps>(), {
  hideDetails: false,
  indeterminate: false,
  label: '',
  singleLine: false,
  value: 0,
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

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The box layout, colours and the singleLine/negative states live in
  the `tv` config above. Remaining here:
   - the native <progress> element and its `::-webkit-progress-*` /
     `::-moz-progress-bar` pseudo-elements (form-control internals);
   - the indeterminate `::before` and its bespoke `@keyframes`.
  Tokens only; the dynamic `--_c-progress-bar-value` is bound inline in the
  template. The `c-progress` / `c-progress--indeterminate` marker classes are
  the hooks these rules target.
-->
<style>
.c-progress progress {
  background-color: var(--c-tertiary-200);
  border-radius: 16px;
  width: 100%;
  overflow: hidden;
  height: 8px;
  position: absolute;
  border: none;
  appearance: none;
}

.c-progress progress:focus {
  outline: none;
}

.c-progress progress::-webkit-progress-bar {
  background-color: transparent;
}

.c-progress progress::-webkit-progress-value {
  transition: width 0.3s ease-in-out;
  background-color: var(--c-primary-600);
  border-radius: 16px;
}

.c-progress progress::-moz-progress-bar {
  transition: padding-bottom 1s;
  padding-left: 60px;
  padding-bottom: var(--_c-progress-bar-value);
  background-color: var(--c-primary-600);
  height: 0;
  transform-origin: 0 0;
  transform: rotate(-90deg) translateX(-60px);
}

.c-progress progress:indeterminate::-moz-progress-bar {
  width: 0;
}

.c-progress--indeterminate::before {
  content: '';
  z-index: 1;
  position: absolute;
  background-color: var(--c-primary-600);
  border-radius: 16px;
  left: -100%;
  height: 100%;
  transform: translateX(var(--_c-progress-bar-value, 0%));
  transition: transform 0.3s ease-in-out;
  animation: c-progress-indeterminate 2s infinite linear;
  width: 50%;
  transform-origin: 0% 50%;
}

@keyframes c-progress-indeterminate {
  0% {
    transform: translateX(100%) scaleX(1);
  }
  30% {
    transform: translateX(170%) scaleX(1.75);
  }
  70% {
    transform: translateX(500%) scaleX(0.1);
  }
  100% {
    transform: translateX(500%) scaleX(0.1);
  }
}
</style>
