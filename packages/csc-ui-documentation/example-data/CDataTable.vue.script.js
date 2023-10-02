
/**
 * Examples for CDataTable.vue.
 * Automatically generated at 10/2/2023, 2:21:28 PM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */
export const basic = `import { CDataTableData, CDataTableHeader } from '@cscfi/csc-ui';
import { mdiEarth, mdiFlag } from '@mdi/js';

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
`;

