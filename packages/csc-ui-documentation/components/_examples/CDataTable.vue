<template>
  <component-example name="basic">
    <template #title>Basic usage</template>

    <c-data-table
      id="basic"
      :data="basicData"
      :headers="basicHeaders"
      hide-footer
    />
  </component-example>

  <component-example name="complex">
    <template #title>Complex example</template>

    <c-switch v-model="singleSelection" v-control class="mb-4">
      Single selection
    </c-switch>

    <c-data-table
      id="complex"
      :data="data"
      :headers="headers"
      selectable
      :single-selection="singleSelection"
    />
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic
import { CDataTableData, CDataTableHeader } from '@cscfi/csc-ui';
import { mdiDelete, mdiEarth, mdiFlag, mdiHeartPlus } from '@mdi/js';
import users from '../data/mock-users';

const basicData: CDataTableData[] = [
  {
    country: {
      value: 'Denmark',
      formattedValue: ' ',
      children: [
        {
          value: 'Denmark',
          component: {
            tag: 'p',
            params: {
              style: {
                margin: 0,
              },
            },
          },
        },
        {
          value: '',
          component: {
            tag: 'c-icon',
            params: {
              path: mdiFlag,
              color: 'var(--c-primary-600)',
            },
          },
        },
      ],
    },
    population: { value: 5831404 },
    unemployment: { value: 4.8 },
    // items not present in the header definition can be added to be used as callback attributes
    code: { value: 'DK' },
  },
  {
    country: { value: 'Finland' },
    population: { value: 5529543 },
    unemployment: { value: 7.5 },
    code: { value: 'FI' },
  },
  {
    country: { value: 'Iceland' },
    population: { value: 366463 },
    unemployment: { value: 5.4 },
    code: { value: 'IS' },
  },
  {
    country: { value: 'Norway' },
    population: { value: 5379475 },
    unemployment: { value: 5.0 },
    code: { value: 'NO' },
  },
  {
    country: { value: 'Sweden' },
    population: { value: 10353442 },
    unemployment: { value: 8.7 },
    code: { value: 'SE' },
  },
];

const basicHeaders: CDataTableHeader[] = [
  {
    key: 'country',
    value: 'Country',
    align: 'center',
  },
  {
    key: 'population',
    value: 'Population (2020)',
  },
  {
    key: 'unemployment',
    value: 'Unemployment (%)',
  },
  {
    key: 'actions',
    value: null,
    sortable: false,
    // align: 'center',
    justify: 'end',
    children: [
      {
        value: '',
        component: {
          tag: 'c-button',
          params: {
            text: true,
            size: 'small',
            title: 'Show Code',
            onClick: ({ data }) =>
              alert(
                'Country code for ' +
                  data.country.value +
                  ': ' +
                  data.code.value +
                  '',
              ),
          },
        },
        children: [
          {
            value: '',
            component: {
              tag: 'c-icon',
              params: {
                path: mdiEarth,
              },
            },
          },
          {
            value: 'Show Code',
            component: {
              tag: 'span',
            },
          },
        ],
      },
    ],
  },
];
// @example-end

const data = ref<CDataTableData[]>(users);

const headers: CDataTableHeader[] = [
  {
    key: 'id',
    value: 'Id',
    pinned: true,
    component: {
      tag: 'c-tag',
      params: {
        onClick: ({ event, data }) => {
          // stop clicking on the tag from opening the row details
          event.stopPropagation();

          console.log(`Row with an id of ${data?.id?.value} was clicked`);
        },
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

              console.log(
                `${data.firstName.value} ${data.lastName.value} added to favourites`,
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

<style lang="scss"></style>
