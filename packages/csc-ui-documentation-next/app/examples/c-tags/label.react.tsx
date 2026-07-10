// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CTag, CTags } from '@cscfi/csc-ui-next-react';

export const Label = () => (
  <CTags label="Research fields" required>
    <CTag active>All</CTag>
    <CTag>Biosciences</CTag>
    <CTag>Chemistry</CTag>
    <CTag>Physics</CTag>
  </CTags>
);
