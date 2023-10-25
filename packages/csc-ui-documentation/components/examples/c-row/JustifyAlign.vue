<template>
  <component-example rows>
    <template #title>Justify and align</template>

    <c-radio-group
      v-model="justify"
      v-control
      label="Justify"
      :items="justifyItems"
      inline
      return-value
    />

    <c-radio-group
      v-model="align"
      v-control
      label="Align"
      :items="alignItems"
      inline
      return-value
    />

    <c-row gap="8" :justify="justify" :align="align">
      <c-icon-button size="x-small">
        <c-icon :path="mdiStar"></c-icon>
      </c-icon-button>

      <c-icon-button size="small">
        <c-icon :path="mdiStar"></c-icon>
      </c-icon-button>

      <c-icon-button>
        <c-icon :path="mdiStar"></c-icon>
      </c-icon-button>
    </c-row>
  </component-example>
</template>

<script setup lang="ts">
import { mdiStar } from '@mdi/js';
import { CRowAlign, CRowJustify } from '@cscfi/csc-ui';

const justifyItems = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Center', value: 'center' },
  { label: 'Space between', value: 'space-between' },
  { label: 'Space around', value: 'space-around' },
];

const alignItems = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Center', value: 'center' },
];

const align = ref<CRowAlign>('start');

const justify = ref<CRowJustify>('start');
</script>
