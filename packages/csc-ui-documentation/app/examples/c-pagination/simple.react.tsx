import type { CPaginationOptions } from '@cscfi/csc-ui';

import { CPagination } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Simple = () => {
  const [options] = useState<CPaginationOptions>({
    itemCount: 40,
    itemsPerPage: 10,
  });

  const [page, setPage] = useState(1);

  return (
    <div>
      <CPagination
        hideDetails
        onChangeValue={(event) =>
          setPage((event.detail as CPaginationOptions).currentPage ?? 1)
        }
        simple
        value={options}
      />

      <p>Current page: {page}</p>
    </div>
  );
};
