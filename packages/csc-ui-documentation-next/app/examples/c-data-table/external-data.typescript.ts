// @ts-nocheck — documentation code sample; shown as text, never compiled here
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

const wrapper = document.createElement('div');

// With the `external` attribute, the table renders `data` verbatim and only
// emits state changes; sorting and paging here go through a simulated server
// request. `itemCount` tells the pager the true total.
// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const table = document.createElement('c-data-table');
table.columns = columns;
table.data = [];
table.itemCount = TOTAL;
table.setAttribute('external', '');
table.setAttribute('page-size', '5');

const load = async () => {
  table.loading = true;
  table.page = query.page;
  table.sort = query.sort;
  table.data = await fetchPage(query);
  table.loading = false;
};

table.addEventListener('change:sort', (event) => {
  query.sort = event.detail as CDataTableSort | null;
  query.page = 1;
  load();
});

table.addEventListener('change:page', (event) => {
  query.page = event.detail as number;
  load();
});

table.addEventListener('change:page-size', (event) => {
  query.pageSize = event.detail as number;
  load();
});

wrapper.append(table);
document.body.append(wrapper);

load();
