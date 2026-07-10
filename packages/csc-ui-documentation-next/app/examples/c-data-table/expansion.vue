<template>
  <div>
    <!-- The description column has expansion: 'always' — it never renders as
         a table column, its cells live in the expansion row. The custom
         expandedContent renders after them. -->
    <c-data-table
      :columns.prop="columns"
      :data.prop="data"
      :expanded-content.prop="expandedContent"
      :get-row-id.prop="getRowId"
      single-expansion
      @change:expanded="onExpanded"
    />

    <p>Expanded: {{ expanded.length ? expanded.join(', ') : '—' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import {
  type CDataTableColumn,
  type CDataTableExpandedContext,
  type CDataTableRow,
  h,
} from '@cscfi/csc-ui-next';

const columns: CDataTableColumn[] = [
  { header: 'Service', key: 'name' },
  { header: 'Category', key: 'category' },
  { expansion: 'always', header: 'Description', key: 'description' },
];

const data = [
  {
    category: 'Computing',
    description:
      'Supercomputer for medium-scale simulations and data analysis.',
    id: 'puhti',
    name: 'Puhti',
  },
  {
    category: 'Computing',
    description: 'Supercomputer for massively parallel workloads.',
    id: 'mahti',
    name: 'Mahti',
  },
  {
    category: 'Storage',
    description: 'Object storage for research data, accessible everywhere.',
    id: 'allas',
    name: 'Allas',
  },
];

const getRowId = (row: CDataTableRow) => row.id as string;

const expandedContent = ({ row }: CDataTableExpandedContext) =>
  h(
    'c-link',
    {
      href: `https://docs.csc.fi/computing/systems-${row.id}/`,
      underline: true,
      style: 'padding-inline: 6px',
    },
    `Read more about ${row.name}`,
  );

const expanded = ref<string[]>([]);

const onExpanded = (event: Event) => {
  expanded.value = (event as CustomEvent<string[]>).detail;
};
</script>
