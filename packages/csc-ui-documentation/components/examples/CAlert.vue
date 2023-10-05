<template>
  <component-example name="basic" rows>
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
      inline
      hide-details
      return-value
    ></c-radio-group>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic
import { ref } from 'vue';
import { CAlertType, CRadioGroupItem } from '@cscfi/csc-ui';

const type = ref<CAlertType>(CAlertType.Info);

const types: CRadioGroupItem[] = [
  { value: '', label: 'Default' },
  { value: CAlertType.Info, label: 'Info' },
  { value: CAlertType.Success, label: 'Success' },
  { value: CAlertType.Warning, label: 'Warning' },
  { value: CAlertType.Error, label: 'Error' },
];
// @example-end
</script>

<style lang="scss"></style>
