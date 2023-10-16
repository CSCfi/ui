<template>
  <component-example name="basic" rows>
    <template #title>Basic usage with c-option elements</template>

    <c-select
      v-model="selectedItem"
      v-control
      label="Partition"
      placeholder="Choose partition..."
      style="max-width: 360px"
      hide-details
      return-value
    >
      <c-option value="normal" name="normal">
        <c-row align="center" justify="space-between">
          Normal
          <c-tag flat>100 BU / node / h</c-tag>
        </c-row>
      </c-option>

      <c-option value="interactive" name="interactive">
        <c-row align="center" justify="space-between">
          Interactive
          <c-tag flat>1 BU / CPU / h</c-tag>
        </c-row>
      </c-option>

      <c-option value="gpu" name="gpu" disabled>
        <c-row align="center" justify="space-between">
          GPU
          <c-tag flat badge="N/A" active>100 BU / GPU / h</c-tag>
        </c-row>
      </c-option>
    </c-select>

    <p class="mt-3">Selected partition value: {{ selectedItem || '?' }}</p>
  </component-example>

  <component-example name="optionAsValue" rows>
    <template #title>Basic usage</template>

    <template #subtitle>Option as selection</template>

    <c-select
      v-model="selectedOption"
      v-control
      label="Partition"
      placeholder="Choose partition..."
      style="max-width: 360px"
      hide-details
      return-value
      option-as-selection
    >
      <c-option value="normal" name="normal">
        <c-row align="center" justify="space-between">
          Normal
          <c-tag flat>100 BU / node / h</c-tag>
        </c-row>
      </c-option>

      <c-option value="interactive" name="interactive">
        <c-row align="center" justify="space-between">
          Interactive
          <c-tag flat>1 BU / CPU / h</c-tag>
        </c-row>
      </c-option>

      <c-option value="gpu" name="gpu" disabled>
        <c-row align="center" justify="space-between">
          GPU
          <c-tag flat badge="N/A" active>100 BU / GPU / h</c-tag>
        </c-row>
      </c-option>
    </c-select>

    <p class="mt-3">Selected partition value: {{ selectedOption || '?' }}</p>
  </component-example>

  <component-example name="objectItems" rows>
    <template #title>Items as array</template>

    <c-select
      v-model="value"
      v-control
      label="Country"
      return-value
      :items="items"
      placeholder="Choose country..."
    />

    <p class="mt-3">Selected country: {{ value || 'None' }}</p>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic|objectItems|optionAsValue
import { ref } from 'vue';
// @example-end

// @example-start|basic
const selectedItem = ref('normal');
// @example-end

// @example-start|optionAsValue
const selectedOption = ref('');
// @example-end

// @example-start|objectItems
const value = ref(null);

const items = [
  { name: 'Finland', value: 'finland' },
  { name: 'Sweden', value: 'sweden' },
  { name: 'Norway', value: 'norway' },
  { name: 'Denmark', value: 'denmark' },
  { name: 'Germany', value: 'germany' },
  { name: 'Belgium', value: 'belgium' },
  { name: 'France', value: 'france' },
];
// @example-end
</script>

<style lang="scss"></style>
