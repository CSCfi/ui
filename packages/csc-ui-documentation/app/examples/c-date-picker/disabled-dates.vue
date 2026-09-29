<template>
  <div>
    <c-date-picker
      v-model="date"
      :disabled-dates="disabledDates"
      :is-date-disabled="isWeekend"
      :min="today"
      hint="Weekdays from today, except Christmas week"
      label="Appointment"
    />

    <p>Value: {{ date ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CDatePickerDisabledDate } from '@cscfi/csc-ui';

// No weekends, no Christmas week, nothing before today.
const isWeekend = (iso: string) => [0, 6].includes(new Date(iso).getUTCDay());

const today = new Date().toISOString().slice(0, 10);

const year = today.slice(0, 4);

const disabledDates: CDatePickerDisabledDate[] = [
  { start: `${year}-12-24`, end: `${year}-12-31` },
];

const date = ref<string | null>(null);
</script>
