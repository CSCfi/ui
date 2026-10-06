<template>
  <div>
    <c-time-picker
      v-model="shift"
      :texts
      format="H.mm"
      hint="Kirjoita ajat tai valitse listoista"
      label="Työvuoro"
      range
    />

    <p>Value: {{ shift ? `${shift.start} – ${shift.end}` : 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CTimePickerRange, CTimePickerTexts } from '@cscfi/csc-ui';

import { ref } from 'vue';

// Every text, so none falls back to Intl for the page's lang or to English;
// AM/PM shows in a 12-hour format, Now under show-now.
const texts: CTimePickerTexts = {
  am: 'ap.',
  chooseTime: 'Valitse aika',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  done: 'Valmis',
  end: 'Loppuaika',
  hours: 'Tunnit',
  minutes: 'Minuutit',
  now: 'Nyt',
  openClock: 'Avaa kellonajan valinta',
  period: 'ap./ip.',
  pm: 'ip.',
  start: 'Alkuaika',
};

const shift = ref<CTimePickerRange | null>(null);
</script>
