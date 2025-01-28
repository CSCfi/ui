<template>
  <component-example name="complex">
    <template #title>Complex example</template>

    <c-switch v-model="singleSelection" v-control class="mb-4">
      Single selection
    </c-switch>

    <c-data-table
      id="complex"
      :data="data"
      :headers="headers"
      :single-selection="singleSelection"
      horizontal-scrolling
      selectable
    />
  </component-example>
</template>

<script setup lang="ts">
import { mdiDelete, mdiHeartPlus } from '@mdi/js';
import { CDataTableData, CDataTableHeader } from '@cscfi/csc-ui';
import users from '../../data/mock-users';

const data = ref<CDataTableData[]>(users);

const headers: CDataTableHeader[] = [
  {
    key: 'id',
    value: 'Id',
    pinned: true,
    component: {
      tag: 'c-tag',
      params: {
        active: true,
        flat: true,
      },
    },
  },
  { key: 'firstName', value: 'First name' },
  { key: 'lastName', value: 'Last name' },
  {
    key: 'progress',
    value: 'Progress',
    width: '200px',
    component: {
      tag: 'c-progress-bar',
      injectValue: true,
      params: {
        style: {
          width: '100%',
        },
        hideDetails: true,
      },
    },
  },
  {
    key: 'progress2',
    value: 'Efficiency',
    width: '200px',
    component: {
      tag: 'c-progress-bar',
      injectValue: true,
      params: {
        style: {
          width: '100%',
        },
        hideDetails: true,
        color: '#830051',
      },
    },
  },
  {
    key: 'failure',
    value: 'Failure rate',
    width: '200px',
    component: {
      tag: 'c-progress-bar',
      injectValue: true,
      params: {
        style: {
          width: '100%',
        },
        hideDetails: true,
        color: 'red',
      },
    },
  },
  {
    key: 'salary',
    value: 'Salary',
    width: '200px',
    justify: 'end',
  },
  { key: 'email', value: 'Email', hidden: true },
  { key: 'city', value: 'City', hidden: false },
  {
    key: 'actions',
    value: null,
    sortable: false,
    pinned: true,
    align: 'end',
    children: [
      {
        value: 'Remove user',
        component: {
          tag: 'c-button',
          params: {
            text: true,
            path: mdiDelete,
            size: 'small',
            title: 'Remove user',
            onClick: ({ event, data }) => {
              // stop clicking on the button from opening the row details
              event.stopPropagation();

              onDelete(data.id.value as number);
            },
          },
        },
      },
      {
        value: 'Add to favourites',
        component: {
          tag: 'c-button',
          params: {
            text: true,
            path: mdiHeartPlus,
            title: 'Add to favourites',
            size: 'small',
            onClick: ({ event, data }) => {
              // stop clicking on the button from opening the row details
              event.stopPropagation();

              alert(
                data.firstName.value +
                  ' ' +
                  data.lastName.value +
                  ' added to favourites',
              );
            },
          },
        },
      },
    ],
  },
];

const onDelete = (id: number) => {
  data.value = data.value.filter((row) => row.id.value !== id);
};

const singleSelection = ref(false);
</script>
