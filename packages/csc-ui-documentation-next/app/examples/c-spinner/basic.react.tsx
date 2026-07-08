// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CSpinner } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  return (
    <div className="example-row">
      <CSpinner />
      <CSpinner size={48} width={4} />
      <CSpinner size={48} width={4} color="var(--c-success)" />
    </div>
  );
};
