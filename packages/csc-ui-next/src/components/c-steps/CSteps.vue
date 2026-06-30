<template>
  <span class="sr-only">{{ a11yMessage }}</span>

  <div ref="stepsRef" :class="ui.root()" aria-hidden="true" part="root">
    <slot />
  </div>

  <div v-if="isMobile" :class="ui.label()" aria-hidden="true" part="label">
    {{ label }}
  </div>
</template>

<script setup lang="ts">
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

// Multi-root template (fragment) + we write to the host below — keep
// fallthrough attrs on the host element instead of tripping the "renders
// fragment" warning.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * old per-component `--_c-steps-*` override-variable layer is dropped and
 * authored directly against the design tokens. Customization is via `::part()`
 * (ADR-0006); there is no `override` prop.
 *
 * The `c-steps` `root` keeps the `c-steps` marker class because the
 * imperatively-inserted `.divider` siblings are styled via `::slotted(.divider)`
 * in the escape-hatch <style> below (they read CSS custom properties scoped to
 * `.c-steps`, including the JS-toggled `.mobile` variant). The host itself
 * stays a real box (focus target + grid) in the escape hatch.
 */
const steps = tv({
  slots: {
    // Mobile current-step label sits below the row, aligned to the start
    // (left) to match the original — NOT centered.
    label: 'font-medium',
    // `c-steps` marker class is the hook the `::slotted(.divider)` rules need.
    root: 'c-steps flex w-full flex-nowrap',
  },
});

interface CStepsProps {
  value?: number | string;
}

const props = withDefaults(defineProps<CStepsProps>(), {
  value: 1,
});

const ui = computed(() => steps());

const host = useHost();

const stepsRef = useTemplateRef<HTMLElement>('stepsRef');

const isMobile = ref(false);

const label = ref('');

const stepCount = ref(0);

let initialized = false;

// Reflect current/complete onto each <c-step> and maintain `.divider`
// elements between them in the light DOM (projected through the slot and
// styled via ::slotted(.divider)). Faithful to the Stencil version which
// imperatively inserts divider <div>s as siblings of the steps.
const handleDividers = () => {
  if (!host) return;

  const steps = Array.from(host.querySelectorAll('c-step')) as HTMLElement[];

  const dividers = host.querySelectorAll('.divider');
  stepCount.value = steps.length;

  steps.forEach((item, index) => {
    const current = index + 1 === +props.value;

    const complete = index + 1 < +props.value;
    (item as unknown as { current: boolean }).current = current;
    (item as unknown as { complete: boolean }).complete = complete;

    if (index + 1 < steps.length) {
      const div = (
        initialized ? dividers[index] : document.createElement('div')
      ) as HTMLDivElement;
      div.classList.toggle('complete', complete);

      if (!initialized) {
        div.classList.add('divider');
        item.after(div);
      }
    }

    if (current) label.value = item.textContent || '';
  });

  initialized = true;
};

const a11yMessage = computed(() => {
  const total = stepCount.value;

  const current = +props.value;

  if (!total) return '';

  const completed = current - 1;

  return `Steps, step ${Math.min(current, total)} of ${total}. ${label.value}. ${completed} step${completed !== 1 ? 's' : ''} marked as completed.`;
});

let resizeObserver: null | ResizeObserver = null;

// Minimum horizontal breathing room kept between two adjacent step labels so
// they read as separate even when packed tightly. The dot itself is 22px, so a
// label narrower than that still reserves the dot's footprint.
const STEP_LABEL_GAP = 16;

const DOT_SIZE = 22;

// Measure the width the steps actually need on a single line: the sum of each
// step's intrinsic label width (the labels are grid-centred and content-sized,
// so their box width is the text width) plus a gap between neighbours. This
// replaces the old `steps.length * 180` heuristic, which collapsed to the mobile
// layout far sooner than the labels genuinely required.
const measureRequiredWidth = (steps: HTMLElement[]): number => {
  const labelsWidth = steps.reduce((total, step) => {
    const label = step.shadowRoot?.querySelector(
      '[part="label"]',
    ) as HTMLElement | null;

    const width = label?.getBoundingClientRect().width ?? 0;

    return total + Math.max(width, DOT_SIZE);
  }, 0);

  return labelsWidth + STEP_LABEL_GAP * Math.max(steps.length - 1, 0);
};

// The labels are only measurable while in the desktop layout — the mobile
// layout hides them with `display:none`. We cache the last desktop measurement
// so we can still decide to re-expand while collapsed.
let cachedRequiredWidth = 0;

onMounted(() => {
  if (!host) return;
  host.setAttribute('tabindex', '0');
  handleDividers();

  resizeObserver = new ResizeObserver(([entry]) => {
    const steps = Array.from(host.querySelectorAll('c-step')) as HTMLElement[];

    if (!isMobile.value) {
      cachedRequiredWidth = measureRequiredWidth(steps);
    }

    isMobile.value = cachedRequiredWidth > entry.contentRect.width;
    stepsRef.value?.classList.toggle('mobile', isMobile.value);
    steps.forEach((node) => node.classList.toggle('mobile', isMobile.value));
  });
  requestAnimationFrame(() => host && resizeObserver?.observe(host));
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

watch(() => props.value, handleDividers);
</script>

<!--
  Escape-hatch CSS (ADR-0007): constructs Tailwind utilities cannot express.
  - :host box + :host(:focus-visible) outline — the host is the focusable
    element (tabindex=0) and must be a real, sized box. This deliberately
    overrides the global `:host{display:contents}`; the per-type sheet is
    adopted after the shared sheet, so it wins.
  - .c-steps slot — the default `<slot>` element itself must be flex so the
    projected steps + `.divider` siblings lay out in a row.
  - ::slotted(.divider[.complete]) — styling the imperatively-inserted, light-DOM
    divider lines between steps (consumer/JS-projected children). The `.mobile`
    variants adjust the divider geometry when <c-steps> collapses. Tokens only.
  All static / variant styling lives in the `tv` config above.
-->
<style>
:host {
  width: 100%;
  display: grid;
  gap: 8px;
  border-radius: 6px;
}

:host(:focus) {
  outline: none;
}

:host(:focus-visible) {
  outline: 2px var(--c-primary) solid;
  outline-offset: 2px;
}

.c-steps {
  --c-steps-divider-width: calc(100% + 160px);
  --c-steps-divider-margin: 10px -80px 0;
}

.c-steps slot {
  display: flex;
  justify-items: space-between;
  width: 100%;
}

::slotted(.divider) {
  height: 2px;
  flex: 1;
  background-color: var(--c-border-strong);
  width: var(--c-steps-divider-width);
  margin: var(--c-steps-divider-margin) !important;
}

::slotted(.divider.complete) {
  background-color: var(--c-primary);
  height: 4px;
  margin-top: 9px;
}

.c-steps.mobile {
  --c-steps-divider-width: calc(100% + 11px);
  --c-steps-divider-margin: 10px -10px 0;
}
</style>
