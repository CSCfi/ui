<template>
  <div>
    <c-date-picker v-model="leave" label="Leave" range clearable />

    <p>Value: {{ leave ? `${leave.start} – ${leave.end}` : 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CDatePickerRange } from '@cscfi/csc-ui';

const leave = ref<CDatePickerRange | null>(null);
</script>
