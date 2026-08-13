// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CPagination } from '@cscfi/csc-ui-react';
import type { CPaginationOptions } from '@cscfi/csc-ui';

export const Basic = () => {
  const [options] = useState<CPaginationOptions>({
    itemCount: 96,
    itemsPerPage: 10,
    pageSizes: [10, 25, 50],
  });

  const [page, setPage] = useState(1);

  return (
    <div>
      <CPagination
        value={options}
        onChangeValue={(event) =>
          setPage((event.detail as CPaginationOptions).currentPage ?? 1)
        }
      />

      <p>Current page: {page}</p>
    </div>
  );
};
