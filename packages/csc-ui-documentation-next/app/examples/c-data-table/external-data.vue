<template>
  <div>
    <!-- With `external`, the table renders `data` verbatim and only emits
         state changes; sorting and paging here go through a simulated server
         request. `item-count` tells the pager the true total. -->
    <c-data-table
      :columns.prop="columns"
      :data.prop="page"
      :item-count="TOTAL"
      :loading="loading"
      :page="query.page"
      :sort.prop="query.sort"
      external
      page-size="5"
      @change:page="onPage"
      @change:page-size="onPageSize"
      @change:sort="onSort"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  CDataTableColumn,
  CDataTableRow,
  CDataTableSort,
} from '@cscfi/csc-ui-next';

const columns: CDataTableColumn[] = [
  { header: 'Job', key: 'name', sortable: true },
  { align: 'end', header: 'Runtime (h)', key: 'runtime', sortable: true },
  { header: 'State', key: 'state' },
];

// ---- a pretend server ------------------------------------------------
const TOTAL = 57;

const allRows = Array.from({ length: TOTAL }, (_, i) => ({
  name: `job-${String(i + 1).padStart(3, '0')}`,
  runtime: ((i * 13) % 96) + 1,
  state: i % 4 ? 'completed' : 'running',
}));

const fetchPage = (q: {
  page: number;
  pageSize: number;
  sort: CDataTableSort | null;
}): Promise<CDataTableRow[]> =>
  new Promise((resolve) => {
    const sorted = [...allRows].sort((a, b) => {
      if (!q.sort) return 0;

      const { column, direction } = q.sort;

      const va = a[column as keyof typeof a];

      const vb = b[column as keyof typeof b];

      return (va < vb ? -1 : va > vb ? 1 : 0) * (direction === 'asc' ? 1 : -1);
    });

    const start = (q.page - 1) * q.pageSize;

    setTimeout(() => resolve(sorted.slice(start, start + q.pageSize)), 600);
  });
// -----------------------------------------------------------------------

const query = ref({
  page: 1,
  pageSize: 5,
  sort: { column: 'name', direction: 'asc' } as CDataTableSort | null,
});

const page = ref<CDataTableRow[]>([]);

const loading = ref(false);

const load = async () => {
  loading.value = true;
  page.value = await fetchPage(query.value);
  loading.value = false;
};

const onSort = (event: Event) => {
  query.value.sort = (event as CustomEvent<CDataTableSort>).detail;
  query.value.page = 1;
  load();
};

const onPage = (event: Event) => {
  query.value.page = (event as CustomEvent<number>).detail;
  load();
};

const onPageSize = (event: Event) => {
  query.value.pageSize = (event as CustomEvent<number>).detail;
  load();
};

onMounted(load);
</script>
