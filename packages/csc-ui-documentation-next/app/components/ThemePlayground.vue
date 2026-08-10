<template>
  <figure class="my-6 rounded-lg border border-border bg-surface-muted p-4">
    <figcaption
      class="mb-3 text-[0.8125rem] font-semibold text-on-surface-faint"
    >
      Theme playground — re-seeds this whole site live
    </figcaption>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
      <label
        v-for="family in FAMILIES"
        :key="family"
        class="flex cursor-pointer items-center gap-2 text-sm text-on-surface"
      >
        <input
          type="color"
          :value="seeds[family]"
          class="size-8 cursor-pointer rounded border border-border bg-surface"
          @input="onInput(family, $event)"
        />

        <code>{{ family }}</code>
      </label>
    </div>

    <c-button class="mt-4" size="small" @click="onReset">
      Reset to defaults
    </c-button>
  </figure>
</template>

<script setup lang="ts">
import { applyTheme, resetTheme, type Family } from '@cscfi/csc-ui-next';

// The eight themable families. Kept in sync by hand with FAMILIES
// in csc-ui-next src/theme/ramp.js — DEFAULT_SEEDS/FAMILIES are not exported
// from the package root, so the current seeds are read from the live tokens.
const FAMILIES: Family[] = [
  'primary',
  'secondary',
  'accent',
  'success',
  'info',
  'warning',
  'error',
  'link',
];

const seeds = reactive({} as Record<Family, string>);

// Read each family's step-500 token off the document root. Token values are
// 8-digit hex (#rrggbbaa); <input type="color"> only accepts #rrggbb.
const readSeeds = () => {
  const style = getComputedStyle(document.documentElement);

  for (const family of FAMILIES) {
    seeds[family] = style
      .getPropertyValue(`--c-${family}-500`)
      .trim()
      .slice(0, 7);
  }
};

// Client-only component (used inside <client-only>), so the DOM is available.
onMounted(readSeeds);

const onInput = (family: Family, event: Event) => {
  seeds[family] = (event.target as HTMLInputElement).value;

  // Merges with earlier calls — other families keep their overrides.
  applyTheme({ [family]: seeds[family] });
};

// The header color switcher writes the same root custom properties through
// applyTheme, so resetTheme() clears its selection too; re-reading the seeds
// snaps the inputs back to the defaults.
const onReset = () => {
  resetTheme();
  readSeeds();
};
</script>
