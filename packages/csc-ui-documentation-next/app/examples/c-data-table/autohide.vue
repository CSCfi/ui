<template>
  <div>
    <!-- Drag the handle in the wrapper's bottom-right corner: with `autohide`,
         columns that stop fitting move into the expansion row (rightmost
         first). The pinned column never hides. Without `autohide` the table
         would scroll horizontally instead. -->
    <div class="resizable">
      <c-data-table :columns.prop="columns" :data.prop="data" autohide />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CDataTableColumn } from '@cscfi/csc-ui-next';

const columns: CDataTableColumn[] = [
  { header: 'Project', key: 'name', pinned: 'left' },
  { header: 'Owner', key: 'owner' },
  { header: 'Facility', key: 'facility' },
  { header: 'Quota', key: 'quota' },
  { header: 'Created', key: 'created' },
];

const data = [
  {
    created: '2026-01-14',
    facility: 'Puhti',
    name: 'Aurora',
    owner: 'aino.virtanen@example.fi',
    quota: '20 TB',
  },
  {
    created: '2026-02-02',
    facility: 'Mahti',
    name: 'Borealis',
    owner: 'eero.korhonen@example.fi',
    quota: '5 TB',
  },
  {
    created: '2026-02-19',
    facility: 'LUMI',
    name: 'Cirrus',
    owner: 'sofia.laine@example.fi',
    quota: '80 TB',
  },
];
</script>

<style scoped>
.resizable {
  max-width: 100%;
  min-width: 320px;
  overflow: auto;
  resize: horizontal;
  width: 560px;
}
</style>
