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

const query = {
  page: 1,
  pageSize: 5,
  sort: { column: 'name', direction: 'asc' } as CDataTableSort | null,
};

const table = document.querySelector('c-data-table')!;
table.columns = columns;
table.itemCount = TOTAL;

const load = async () => {
  table.loading = true;
  table.page = query.page;
  table.sort = query.sort;
  table.data = await fetchPage(query);
  table.loading = false;
};

table.addEventListener('change:sort', (event) => {
  query.sort = event.detail;
  query.page = 1;
  load();
});

table.addEventListener('change:page', (event) => {
  query.page = event.detail;
  load();
});

table.addEventListener('change:page-size', (event) => {
  query.pageSize = event.detail;
  load();
});

load();
