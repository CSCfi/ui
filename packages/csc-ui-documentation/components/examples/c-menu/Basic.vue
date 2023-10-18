<template>
  <component-example name="basic">
    <template #title>Basic usage</template>

    <c-menu :items="items">Basic menu</c-menu>

    <c-menu :items="items" flat>Flat menu</c-menu>

    <c-menu :items="items" small>Small menu</c-menu>

    <c-menu :items="items" custom>
      <c-icon-button ghost badge="8" tabindex="-1">
        <c-icon :path="mdiEmailOutline"></c-icon>
      </c-icon-button>
    </c-menu>

    <teleport to="body">
      <c-toasts ref="toastsRef"></c-toasts>
    </teleport>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { mdiInformationOutline, mdiEmailOutline } from '@mdi/js';
import { CToastType } from '@cscfi/csc-ui';

const toastsRef = ref<HTMLCToastsElement | null>(null);

const items = [
  { name: 'Item 1', action: () => onItemClick('Item 1 selected') },
  { name: 'Item 2', action: () => onItemClick('Item 2 selected') },
  {
    name: 'Item 3',
    action: () => onItemClick('Item 3 selected'),
    disabled: true,
  },
  {
    name: 'Item 4',
    action: () => onItemClick('Item 4 selected'),
    icon: mdiInformationOutline,
    iconPosition: 'end',
  },
  { name: 'Item 5', action: () => onItemClick('Item 5 selected') },
  { name: 'Item 6', action: () => onItemClick('Item 6 selected') },
  { name: 'Item 7', action: () => onItemClick('Item 7 selected') },
  { name: 'Item 8', action: () => onItemClick('Item 8 selected') },
  { name: 'Item 9', action: () => onItemClick('Item 9 selected') },
  { name: 'Item 10', action: () => onItemClick('Item 10 selected') },
  { name: 'Item 11', action: () => onItemClick('Item 11 selected') },
  { name: 'Item 12', action: () => onItemClick('Item 12 selected') },
  { name: 'Item 13', action: () => onItemClick('Item 13 selected') },
  { name: 'Item 14', action: () => onItemClick('Item 14 selected') },
  { name: 'Item 15', action: () => onItemClick('Item 15 selected') },
  { name: 'Item 16', action: () => onItemClick('Item 16 selected') },
  { name: 'Item 17', action: () => onItemClick('Item 17 selected') },
  { name: 'Item 18', action: () => onItemClick('Item 18 selected') },
  { name: 'Item 19', action: () => onItemClick('Item 19 selected') },
  { name: 'Item 20', action: () => onItemClick('Item 20 selected') },
];

const onItemClick = (message: string) => {
  toastsRef.value?.addToast({
    message,
    duration: 3000,
    type: CToastType.Success,
  });
};
</script>
