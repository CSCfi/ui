<template>
  <div>
    <c-data-table
      :columns.prop="columns"
      :data.prop="data"
      :sort.prop="sort"
      page-size="5"
      @change:sort="onSort"
    />

    <p>Sorted by: {{ sort.column }} ({{ sort.direction }})</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CDataTableColumn, CDataTableSort } from '@cscfi/csc-ui';

const columns: CDataTableColumn[] = [
  { header: 'Project', key: 'name', sortable: true },
  { align: 'end', header: 'Members', key: 'members', sortable: true },
  { header: 'Facility', key: 'facility' },
  { header: 'Created', key: 'created', sortable: true },
];

const data = [
  { created: '2026-01-14', facility: 'Puhti', members: 12, name: 'Aurora' },
  { created: '2026-02-02', facility: 'Mahti', members: 3, name: 'Borealis' },
  { created: '2026-02-19', facility: 'LUMI', members: 41, name: 'Cirrus' },
  { created: '2026-03-05', facility: 'Allas', members: 7, name: 'Drift' },
  { created: '2026-03-28', facility: 'Puhti', members: 18, name: 'Ember' },
  { created: '2026-04-11', facility: 'LUMI', members: 2, name: 'Fjord' },
  { created: '2026-05-01', facility: 'Mahti', members: 25, name: 'Glacier' },
  { created: '2026-05-23', facility: 'Allas', members: 9, name: 'Halo' },
];

const sort = ref<CDataTableSort>({ column: 'name', direction: 'asc' });

const onSort = (event: Event) => {
  sort.value = (event as CustomEvent<CDataTableSort>).detail;
};
</script>
