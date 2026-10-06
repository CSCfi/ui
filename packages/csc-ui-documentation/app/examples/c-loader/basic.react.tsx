import { CButton, CLoader } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ display: 'grid', gap: '12px', justifyItems: 'start' }}>
      <CButton onClick={() => setLoading(!loading)}>Toggle loader</CButton>

      {/* The loader fills the nearest position: relative ancestor */}
      <div style={{ height: '160px', position: 'relative', width: '100%' }}>
        <CLoader contentdelay={1} visible={loading}>
          Loading resources
        </CLoader>
      </div>
    </div>
  );
};
