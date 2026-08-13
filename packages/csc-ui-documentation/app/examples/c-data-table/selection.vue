<template>
  <div>
    <!-- With client-side data and pagination, selecting a full page offers a
         two-step "select all N rows" banner. -->
    <c-data-table
      :columns.prop="columns"
      :data.prop="data"
      :get-row-id.prop="getRowId"
      :selected.prop="selected"
      page-size="4"
      selection="multiple"
      @change:selected="onSelection"
    />

    <p>Selected ids: {{ selected.length ? selected.join(', ') : '—' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CDataTableColumn, CDataTableRow } from '@cscfi/csc-ui';

const columns: CDataTableColumn[] = [
  { header: 'Dataset', key: 'name' },
  { align: 'end', header: 'Size (GB)', key: 'size' },
];

const data = Array.from({ length: 11 }, (_, i) => ({
  id: `ds-${i + 1}`,
  name: `Dataset ${i + 1}`,
  size: ((i * 37) % 90) + 4,
}));

// A stable row id keeps the selection correct across sorting and paging.
const getRowId = (row: CDataTableRow) => row.id as string;

const selected = ref<string[]>(['ds-2']);

const onSelection = (event: Event) => {
  selected.value = (
    event as CustomEvent<{ ids: string[]; rows: CDataTableRow[] }>
  ).detail.ids;
};
</script>
