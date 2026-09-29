<template>
  <div>
    <c-date-picker
      v-model="period"
      :texts="texts"
      hint="Kirjoita päivämäärät tai valitse kalenterista"
      label="Lomajakso"
      range
      show-week-numbers
    />

    <p>Value: {{ period ? `${period.start} – ${period.end}` : 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CDatePickerRange, CDatePickerTexts } from '@cscfi/csc-ui';

// Names the texts leave out (the long weekday names, each day's accessible
// name) come from Intl for the page's lang.
const texts: CDatePickerTexts = {
  chooseDate: 'Valitse päivä',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  end: 'Loppupäivä',
  months: [
    'tammikuu',
    'helmikuu',
    'maaliskuu',
    'huhtikuu',
    'toukokuu',
    'kesäkuu',
    'heinäkuu',
    'elokuu',
    'syyskuu',
    'lokakuu',
    'marraskuu',
    'joulukuu',
  ],
  nextMonth: 'Seuraava kuukausi',
  nextYear: 'Seuraava vuosi',
  openCalendar: 'Avaa kalenteri',
  pendingStart: (date) => `Alkupäivä ${date} valittu. Valitse loppupäivä.`,
  previousMonth: 'Edellinen kuukausi',
  previousYear: 'Edellinen vuosi',
  selectMonth: 'Valitse kuukausi',
  selectYear: 'Valitse vuosi',
  start: 'Alkupäivä',
  unavailable: 'ei valittavissa',
  weekNumber: 'Viikko',
  weekdaysShort: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
};

const period = ref<CDatePickerRange | null>(null);
</script>
