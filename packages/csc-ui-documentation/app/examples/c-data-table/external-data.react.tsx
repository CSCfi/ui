// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useEffect, useState } from 'react';
import { CDataTable } from '@cscfi/csc-ui-react';
import type {
  CDataTableColumn,
  CDataTableRow,
  CDataTableSort,
} from '@cscfi/csc-ui';

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

type Query = {
  page: number;
  pageSize: number;
  sort: CDataTableSort | null;
};

export const ExternalData = () => {
  const [query, setQuery] = useState<Query>({
    page: 1,
    pageSize: 5,
    sort: { column: 'name', direction: 'asc' },
  });

  const [page, setPage] = useState<CDataTableRow[]>([]);

  const [loading, setLoading] = useState(false);

  const load = async (q: Query) => {
    setQuery(q);
    setLoading(true);
    setPage(await fetchPage(q));
    setLoading(false);
  };

  useEffect(() => {
    load(query);
  }, []);

  return (
    <div>
      {/* With `external`, the table renders `data` verbatim and only emits
          state changes; sorting and paging here go through a simulated server
          request. `itemCount` tells the pager the true total. */}
      <CDataTable
        columns={columns}
        data={page}
        itemCount={TOTAL}
        loading={loading}
        page={query.page}
        sort={query.sort}
        external
        pageSize={5}
        onChangePage={(event) =>
          load({ ...query, page: event.detail as number })
        }
        onChangePageSize={(event) =>
          load({ ...query, pageSize: event.detail as number })
        }
        onChangeSort={(event) =>
          load({
            ...query,
            page: 1,
            sort: event.detail as CDataTableSort | null,
          })
        }
      />
    </div>
  );
};
