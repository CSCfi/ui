<template>
  <div class="example-row">
    <c-popover heading="Display settings">
      <c-button slot="trigger" outlined>
        Display settings
        <c-icon :path="mdiTuneVariant" />
      </c-button>

      <div class="example-grid">
        <c-switch v-model="compact">Compact rows</c-switch>

        <c-switch v-model="showIds">Show identifiers</c-switch>
      </div>
    </c-popover>

    <p>Compact: {{ compact }}, identifiers: {{ showIds }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { mdiTuneVariant } from '@mdi/js';

const compact = ref(false);

const showIds = ref(true);
</script>
