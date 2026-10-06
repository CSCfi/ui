// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CSpinner } from '@cscfi/csc-ui-react';

export const Basic = () => {
  return (
    <div className="example-row">
      <CSpinner />
      <CSpinner size={48} width={4} />
      <CSpinner color="var(--c-success)" size={48} width={4} />
    </div>
  );
};
