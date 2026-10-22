<template>
  <div>
    <c-date-picker v-model="leave" label="Leave" clearable range />

    <p>Value: {{ leave ? `${leave.start} – ${leave.end}` : 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CDatePickerRange } from '@cscfi/csc-ui';

import { ref } from 'vue';

const leave = ref<CDatePickerRange | null>(null);
</script>
