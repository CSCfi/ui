<template>
  <span class="visuallyhidden">{{ a11yMessage }}</span>
  <div ref="stepsEl" class="c-steps flex w-full flex-nowrap" aria-hidden="true">
    <slot />
  </div>
  <div v-if="isMobile" class="c-steps__label" aria-hidden="true">
    {{ label }}
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watch,
} from "vue";

const props = defineProps({
  value: { type: [Number, String], default: 1 },
});

const host = useHost();
const stepsEl = useTemplateRef<HTMLElement>("stepsEl");
const isMobile = ref(false);
const label = ref("");
const stepCount = ref(0);

let initialized = false;

// Reflect current/complete onto each <c-step> and maintain `.divider`
// elements between them in the light DOM (projected through the slot and
// styled via ::slotted(.divider)). Faithful to the Stencil version which
// imperatively inserts divider <div>s as siblings of the steps.
const handleDividers = () => {
  if (!host) return;
  const steps = Array.from(host.querySelectorAll("c-step")) as HTMLElement[];
  const dividers = host.querySelectorAll(".divider");
  stepCount.value = steps.length;

  steps.forEach((item, index) => {
    const current = index + 1 === +props.value;
    const complete = index + 1 < +props.value;
    (item as unknown as { current: boolean }).current = current;
    (item as unknown as { complete: boolean }).complete = complete;

    if (index + 1 < steps.length) {
      const div = (
        initialized ? dividers[index] : document.createElement("div")
      ) as HTMLDivElement;
      div.classList.toggle("complete", complete);
      if (!initialized) {
        div.classList.add("divider");
        item.after(div);
      }
    }

    if (current) label.value = item.textContent || "";
  });

  initialized = true;
};

const a11yMessage = computed(() => {
  const total = stepCount.value;
  const current = +props.value;
  if (!total) return "";
  const completed = current - 1;
  return `Steps, step ${Math.min(current, total)} of ${total}. ${label.value}. ${completed} step${completed !== 1 ? "s" : ""} marked as completed.`;
});

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (!host) return;
  host.setAttribute("tabindex", "0");
  handleDividers();

  resizeObserver = new ResizeObserver(([entry]) => {
    const steps = host.querySelectorAll("c-step");
    const maxWidth = steps.length * 180;
    isMobile.value = maxWidth > entry.contentRect.width;
    stepsEl.value?.classList.toggle("mobile", isMobile.value);
    steps.forEach((node) => node.classList.toggle("mobile", isMobile.value));
  });
  requestAnimationFrame(() => host && resizeObserver?.observe(host));
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

watch(() => props.value, handleDividers);
</script>

<style>
:host {
  --_c-steps-outline-color: var(--c-steps-outline-color, var(--c-primary-600));
  --_c-steps-color: var(--c-step-color, var(--c-tertiary-500));
  --_c-steps-color-complete: var(--c-step-color-complete, var(--c-primary-600));

  width: 100%;
  display: grid;
  gap: 8px;
  border-radius: 6px;
}

:host(:focus) {
  outline: none;
}

:host(:focus-visible) {
  outline: 2px var(--_c-steps-outline-color) solid;
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
  background-color: var(--_c-steps-color);
  width: var(--c-steps-divider-width);
  margin: var(--c-steps-divider-margin) !important;
}

::slotted(.divider.complete) {
  background-color: var(--_c-steps-color-complete);
  height: 4px;
  margin-top: 9px;
}

.c-steps.mobile {
  --c-steps-divider-width: calc(100% + 11px);
  --c-steps-divider-margin: 10px -10px 0;
}

.c-steps__label {
  text-align: center;
  font-weight: 500;
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
</style>
