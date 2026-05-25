<template>
  <component-example rows name="volume">
    <template #title>Usage without a label</template>

    <c-row gap="8" align="center">
      <c-icon-button text :disabled="volume === 0" @click="onVolumeDecrease()">
        <c-icon :path="mdiVolumeLow" />
      </c-icon-button>

      <c-slider v-model="volume" v-control aria-label="Volume" segments="5" />

      <c-icon-button
        text
        :disabled="volume === 100"
        @click="onVolumeIncrease()"
      >
        <c-icon :path="mdiVolumeHigh" />
      </c-icon-button>
    </c-row>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { mdiVolumeHigh, mdiVolumeLow } from '@mdi/js';

const volume = ref(80);

const onVolumeDecrease = () => {
  volume.value = Math.max(0, volume.value - 10);
};

const onVolumeIncrease = () => {
  volume.value = Math.min(100, volume.value + 10);
};
</script>
