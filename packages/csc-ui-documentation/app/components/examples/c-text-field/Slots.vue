<template>
  <component-example name="slots" rows>
    <template #title>Slots</template>

    <c-text-field placeholder="Search for something..." shadow>
      <c-icon slot="pre" :path="mdiMagnify" size="16" />

      <c-button slot="post" size="small" ghost>Search</c-button>
    </c-text-field>

    <c-text-field v-model="clearableValue" v-control label="Clearable">
      <c-icon-button slot="post" size="x-small" text @click="onClear()">
        <c-icon :path="mdiClose" />
      </c-icon-button>
    </c-text-field>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { mdiClose, mdiMagnify } from '@mdi/js';

const clearableValue = ref('');

const onClear = () => {
  clearableValue.value = '';
};
</script>
