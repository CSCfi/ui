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

const months = [
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
];

const weekdays = [
  'sunnuntai',
  'maanantai',
  'tiistai',
  'keskiviikko',
  'torstai',
  'perjantai',
  'lauantai',
];

// Every text, so none falls back to Intl for the page's lang or to English;
// the month and year step labels show under type="month", Today under
// show-today.
const texts: CDatePickerTexts = {
  chooseDate: 'Valitse päivä',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  // A day's name, its month in the partitive: keskiviikko 14. helmikuuta 2001.
  date: (iso) => {
    const [y, m, d] = iso.split('-').map(Number);

    const weekday = weekdays[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];

    return `${weekday} ${d}. ${months[m - 1]}ta ${y}`;
  },
  done: 'Valmis',
  end: 'Loppupäivä',
  endMonth: 'Loppukuukausi',
  endYear: 'Loppuvuosi',
  month: 'Kuukausi',
  months,
  monthsShort: [
    'tammi',
    'helmi',
    'maalis',
    'huhti',
    'touko',
    'kesä',
    'heinä',
    'elo',
    'syys',
    'loka',
    'marras',
    'joulu',
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
  startMonth: 'Alkukuukausi',
  startYear: 'Alkuvuosi',
  thisMonth: 'Tämä kuukausi',
  today: 'Tänään',
  unavailable: 'ei valittavissa',
  weekdays,
  weekdaysShort: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
  weekNumber: 'Viikko',
  year: 'Vuosi',
};

const period = ref<CDatePickerRange | null>(null);
</script>
