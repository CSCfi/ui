// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CDivider } from '@cscfi/csc-ui-react';

export const Vertical = () => {
  return (
    <div className="example-row">
      <span>Details</span>
      <CDivider vertical />
      <span>Members</span>
      <CDivider vertical />
      <span>Settings</span>
    </div>
  );
};
