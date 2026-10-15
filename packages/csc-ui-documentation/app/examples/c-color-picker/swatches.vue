<template>
  <div>
    <c-color-picker
      v-model="color"
      :swatches
      hint="Pick a suggestion or any other colour"
      label="Label colour"
    />

    <p>Value: {{ color ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CColorPickerSwatch } from '@cscfi/csc-ui';

import { ref } from 'vue';

const swatches: CColorPickerSwatch[] = [
  { name: 'Ocean', value: '#1f6feb' },
  { name: 'Coral', value: '#e5534b' },
  { name: 'Moss', value: '#57ab5a' },
  { name: 'Sand', value: '#c69026' },
  { name: 'Plum', value: '#986ee2' },
  { name: 'Slate', value: '#768390' },
];

const color = ref<null | string>(null);
</script>
