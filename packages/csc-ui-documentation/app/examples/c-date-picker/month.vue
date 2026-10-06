<template>
  <div>
    <c-date-picker
      v-model="billing"
      hint="Type a month or open the month list"
      label="Billing month"
      type="month"
      clearable
    />

    <p>Value: {{ billing ?? 'null' }}</p>

    <c-date-picker
      v-model="period"
      label="Reporting period"
      type="month"
      clearable
      range
    />

    <p>Value: {{ period ? `${period.start} – ${period.end}` : 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CDatePickerRange } from '@cscfi/csc-ui';

import { ref } from 'vue';

const billing = ref<null | string>(null);

const period = ref<CDatePickerRange | null>(null);
</script>
