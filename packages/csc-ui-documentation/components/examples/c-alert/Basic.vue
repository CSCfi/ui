<template>
  <component-example rows name="basic">
    <template #title>Basic usage</template>

    <c-alert :type="type">
      <div slot="title">Quis porro id?</div>

      Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero, harum
      pariatur deserunt obcaecati maiores cupiditate magnam! Minima omnis libero
      sequi consectetur nesciunt. Facilis maxime ratione molestiae expedita quis
      porro id?
    </c-alert>

    <c-radio-group
      v-model="type"
      v-control
      :items="types"
      hide-details
      inline
    />
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CAlertType, type CRadioGroupItem } from '@cscfi/csc-ui';

const type = ref<CAlertType>(CAlertType.Info);

const types: CRadioGroupItem[] = [
  { value: '', name: 'Default' },
  { value: CAlertType.Info, name: 'Info' },
  { value: CAlertType.Success, name: 'Success' },
  { value: CAlertType.Warning, name: 'Warning' },
  { value: CAlertType.Error, name: 'Error' },
];
</script>
