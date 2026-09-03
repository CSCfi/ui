<template>
  <figure class="my-6 rounded-lg border border-border bg-surface-muted p-4">
    <figcaption
      class="mb-3 text-[0.8125rem] font-semibold text-on-surface-faint"
    >
      Theme playground — re-seeds this whole site live
    </figcaption>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
      <label
        v-for="family in families"
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

    <c-button class="mt-4" size="small" @click="resetSeeds">
      Reset to defaults
    </c-button>
  </figure>
</template>

<script setup lang="ts">
import type { Family } from '@cscfi/csc-ui';

// The seeds come from the library's DEFAULT_SEEDS through the shared
// composable (also driven by the header colour switcher), not from the live
// tokens: `--c-*-500` is an oklch() string (ADR-0041), which
// <input type="color"> cannot take.
const { families, resetSeeds, seeds, setSeed } = useThemeSeeds();

const onInput = (family: Family, event: Event) =>
  setSeed(family, (event.target as HTMLInputElement).value);
</script>
