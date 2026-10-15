<template>
  <div>
    <c-color-picker
      v-model="color"
      :swatches
      hint="One of the project colours"
      label="Project colour"
      swatches-only
    />

    <p>Value: {{ color ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CColorPickerSwatch } from '@cscfi/csc-ui';

import { ref } from 'vue';

// Name every swatch: the name is what the field shows and what assistive
// technology reads.
const swatches: CColorPickerSwatch[] = [
  { name: 'Ocean', value: '#1f6feb' },
  { name: 'Coral', value: '#e5534b' },
  { name: 'Moss', value: '#57ab5a' },
  { name: 'Sand', value: '#c69026' },
  { name: 'Plum', value: '#986ee2' },
  { name: 'Slate', value: '#768390' },
];

const color = ref<null | string>('#57ab5a');
</script>
