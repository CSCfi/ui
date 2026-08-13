// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CButton, CLoader } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ display: 'grid', gap: '12px', justifyItems: 'start' }}>
      <CButton onClick={() => setLoading(!loading)}>Toggle loader</CButton>

      {/* The loader fills the nearest position: relative ancestor */}
      <div style={{ position: 'relative', height: '160px', width: '100%' }}>
        <CLoader visible={loading} contentdelay={1}>
          Loading resources
        </CLoader>
      </div>
    </div>
  );
};
