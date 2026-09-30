<template>
  <div>
    <c-time-picker
      v-model="shift"
      :texts="texts"
      format="H.mm"
      hint="Kirjoita ajat tai valitse listoista"
      label="Työvuoro"
      range
    />

    <p>Value: {{ shift ? `${shift.start} – ${shift.end}` : 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CTimePickerRange, CTimePickerTexts } from '@cscfi/csc-ui';

// The AM/PM texts the list leaves out come from Intl for the page's lang.
const texts: CTimePickerTexts = {
  chooseTime: 'Valitse aika',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  end: 'Loppuaika',
  hours: 'Tunnit',
  minutes: 'Minuutit',
  openClock: 'Avaa kellonajan valinta',
  start: 'Alkuaika',
};

const shift = ref<CTimePickerRange | null>(null);
</script>
