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
        <c-icon :path="mdiStar" />
      </c-icon-button>

      <c-icon-button size="small">
        <c-icon :path="mdiStar" />
      </c-icon-button>

      <c-icon-button>
        <c-icon :path="mdiStar" />
      </c-icon-button>
    </c-row>
  </component-example>
</template>

<script setup lang="ts">
import { mdiStar } from '@mdi/js';
import { CRadioGroupItem, CRowAlign, CRowJustify } from '@cscfi/csc-ui';

const justifyItems: CRadioGroupItem[] = [
  { name: 'Start', value: 'start' },
  { name: 'End', value: 'end' },
  { name: 'Center', value: 'center' },
  { name: 'Space between', value: 'space-between' },
  { name: 'Space around', value: 'space-around' },
];

const alignItems: CRadioGroupItem[] = [
  { name: 'Start', value: 'start' },
  { name: 'End', value: 'end' },
  { name: 'Center', value: 'center' },
];

const align = ref<CRowAlign>('start');

const justify = ref<CRowJustify>('start');
</script>
