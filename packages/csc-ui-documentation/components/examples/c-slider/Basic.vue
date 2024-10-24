<template>
  <component-example rows name="basic">
    <template #title>Basic usage</template>

    <c-switch v-model="showTicks" v-control>Ticks</c-switch>

    <c-switch v-model="showLabels" v-control>Labels</c-switch>

    <c-switch v-model="showTooltip" v-control>Tooltip</c-switch>

    <c-switch v-model="isDisabled" v-control>Disabled</c-switch>

    <c-radio-group v-model="segments" v-control label="Segment count" inline>
      <c-radio value="2">2 (every 50%)</c-radio>

      <c-radio value="4">4 (every 25%)</c-radio>

      <c-radio value="5">5 (every 20%)</c-radio>

      <c-radio value="10" checked>10 (every 10%)</c-radio>
    </c-radio-group>

    <c-slider
      v-model="sliderValue"
      v-control
      aria-label="Taunos slider"
      label="Monthly usage"
      class="flex-1"
      :labels="showLabels"
      :disable-tooltip="!showTooltip"
      :disabled="isDisabled"
      :ticks="showTicks"
      :segments="segments"
    />
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const sliderValue = ref(40);

const showLabels = ref(true);

const showTicks = ref(true);

const showTooltip = ref(true);

const isDisabled = ref(false);

const segments = ref('10');
</script>
