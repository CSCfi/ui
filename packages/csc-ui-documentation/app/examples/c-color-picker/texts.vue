<template>
  <div>
    <c-color-picker
      v-model="color"
      :swatches
      :texts
      hint="Kirjoita väri tai valitse se"
      label="Väri"
      alpha
    />

    <p>Value: {{ color ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CColorPickerSwatch, CColorPickerTexts } from '@cscfi/csc-ui';

import { ref } from 'vue';

// Every text, so none falls back to English.
const texts: CColorPickerTexts = {
  alpha: 'Läpinäkyvyys',
  blue: 'Sininen',
  brightness: 'Kirkkaus',
  chooseColor: 'Valitse väri',
  chroma: 'Kroma',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  done: 'Valmis',
  green: 'Vihreä',
  hex: 'Heksa',
  hue: 'Sävy',
  lightness: 'Valoisuus',
  notation: 'Merkintätapa',
  openPicker: 'Avaa värivalitsin',
  red: 'Punainen',
  restoreOriginal: 'Palauta alkuperäinen väri',
  saturation: 'Kylläisyys',
  swatches: 'Värimallit',
  toggleSwatches: 'Näytä värimallit',
};

const swatches: CColorPickerSwatch[] = [
  { name: 'Meri', value: '#1f6feb' },
  { name: 'Koralli', value: '#e5534b' },
  { name: 'Sammal', value: '#57ab5a' },
];

const color = ref<null | string>('#1f6feb');
</script>
