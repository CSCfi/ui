<template>
  <div class="c-alert" :class="type ? `c-alert--${type}` : null">
    <svg v-if="type" width="22" height="22" viewBox="0 0 24 24">
      <path :d="icon" />
    </svg>
    <div class="c-alert__content">
      <slot name="title" />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAlert,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiInformation,
} from "@mdi/js";
import { computed } from "vue";

const props = defineProps({
  type: { type: String, default: "" },
});

const icons: Record<string, string> = {
  warning: mdiAlert,
  error: mdiCloseCircle,
  success: mdiCheckCircle,
  info: mdiInformation,
};

const icon = computed(() => icons[props.type] || "");
</script>

<style>
:host {
  display: block;
}

.c-alert {
  --c-alert-color: var(--c-primary-600);

  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  color: var(--c-alert-color);
  border: 2px solid currentColor;
  border-left-width: 12px;
  border-radius: 6px;
  padding: 12px;
}

.c-alert--info,
.c-alert--error,
.c-alert--success,
.c-alert--warning {
  grid-template-columns: auto 1fr;
}

.c-alert--info {
  --c-alert-color: var(--c-info-600);
}
.c-alert--error {
  --c-alert-color: var(--c-error-600);
}
.c-alert--success {
  --c-alert-color: var(--c-success-600);
}
.c-alert--warning {
  --c-alert-color: var(--c-warning-600);
}

.c-alert__content {
  color: rgba(0, 0, 0, 0.87);
  display: grid;
  align-items: center;
  grid-template-columns: 1fr;
  gap: 8px;
}

svg {
  fill: currentColor;
}

::slotted(*[slot="title"]) {
  margin: 0 !important;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
}
</style>
