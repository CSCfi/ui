// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CDataTable } from '@cscfi/csc-ui-react';
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

export const Selection = () => {
  const [selected, setSelected] = useState<string[]>(['ds-2']);

  return (
    <div>
      {/* With client-side data and pagination, selecting a full page offers a
          two-step "select all N rows" banner. */}
      <CDataTable
        columns={columns}
        data={data}
        getRowId={getRowId}
        selected={selected}
        pageSize={4}
        selection="multiple"
        onChangeSelected={(event) =>
          setSelected(
            (event.detail as { ids: string[]; rows: CDataTableRow[] }).ids,
          )
        }
      />

      <p>Selected ids: {selected.length ? selected.join(', ') : '—'}</p>
    </div>
  );
};
