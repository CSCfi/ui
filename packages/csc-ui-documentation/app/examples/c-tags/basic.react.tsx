// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CTag, CTags } from '@cscfi/csc-ui-react';

export const Basic = () => (
  <div style={{ display: 'grid', gap: '1rem' }}>
    <CTags>
      <CTag active>All</CTag>
      <CTag>Biosciences</CTag>
      <CTag>Chemistry</CTag>
      <CTag>Physics</CTag>
    </CTags>

    <CTags size="small">
      <CTag active>All</CTag>
      <CTag>Biosciences</CTag>
      <CTag>Chemistry</CTag>
      <CTag>Physics</CTag>
    </CTags>
  </div>
);
