<template>
  <div>
    <c-swiper :value.prop="flavor" @change-value="onChange">
      <c-swiper-tab value="standard" label="Standard">
        <c-icon slot="icon" :path="mdiServer" />
        4 cores, 8 GB RAM
      </c-swiper-tab>

      <c-swiper-tab value="performance" label="Performance">
        <c-icon slot="icon" :path="mdiMemory" />
        8 cores, 32 GB RAM
      </c-swiper-tab>

      <c-swiper-tab value="gpu" label="GPU">
        <c-icon slot="icon" :path="mdiRocket" />
        1 GPU, 112 GB RAM
      </c-swiper-tab>
    </c-swiper>

    <p>Selected flavor: {{ flavor }}</p>
  </div>
</template>

<script setup lang="ts">
import { mdiMemory, mdiRocket, mdiServer } from '@mdi/js';

const flavor = ref<number | string>('standard');

const onChange = (event: Event) => {
  flavor.value = (event as CustomEvent<number | string>).detail;
};
</script>
