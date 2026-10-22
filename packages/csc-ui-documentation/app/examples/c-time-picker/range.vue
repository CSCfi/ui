<template>
  <div>
    <c-time-picker
      v-model="maintenance"
      hint="An end before the start spans midnight"
      label="Maintenance maintenance"
      clearable
      range
    />

    <p>
      Value:
      {{ maintenance ? `${maintenance.start} – ${maintenance.end}` : 'null' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { CTimePickerRange } from '@cscfi/csc-ui';

import { ref } from 'vue';

const maintenance = ref<CTimePickerRange | null>(null);
</script>
