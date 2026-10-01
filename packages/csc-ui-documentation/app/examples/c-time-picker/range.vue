<template>
  <div>
    <c-time-picker
      v-model="maintenance"
      hint="An end before the start spans midnight"
      label="Maintenance maintenance"
      range
      clearable
    />

    <p>
      Value:
      {{ maintenance ? `${maintenance.start} – ${maintenance.end}` : 'null' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CTimePickerRange } from '@cscfi/csc-ui';

const maintenance = ref<CTimePickerRange | null>(null);
</script>
