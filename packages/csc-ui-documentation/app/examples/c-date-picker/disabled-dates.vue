<template>
  <div>
    <c-date-picker
      v-model="date"
      :disabled-dates
      :is-date-disabled="isWeekend"
      :min="today"
      hint="Weekdays from today, except Christmas week"
      label="Appointment"
    />

    <p>Value: {{ date ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CDatePickerDisabledDate } from '@cscfi/csc-ui';

import { ref } from 'vue';

// No weekends, no Christmas week, nothing before today.
const isWeekend = (iso: string) => [0, 6].includes(new Date(iso).getUTCDay());

const today = new Date().toISOString().slice(0, 10);

const year = today.slice(0, 4);

const disabledDates: CDatePickerDisabledDate[] = [
  { end: `${year}-12-31`, start: `${year}-12-24` },
];

const date = ref<null | string>(null);
</script>
