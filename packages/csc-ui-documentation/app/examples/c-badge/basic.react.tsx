// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CBadge, CButton, CIcon, CIconButton } from '@cscfi/csc-ui-react';
import { mdiBellOutline, mdiEmailOutline } from '@mdi/js';

const styles = `
c-badge.success-badge::part(root) {
  background-color: var(--c-success-500);
}
`;

export const Basic = () => (
  <>
    <style>{styles}</style>

    <div className="example-row">
      <span style={{ position: 'relative' }}>
        <CIcon path={mdiBellOutline} size={32} />
        <CBadge>3</CBadge>
      </span>

      <CIconButton outlined>
        <CIcon path={mdiEmailOutline} />
        <CBadge className="success-badge">1</CBadge>
      </CIconButton>

      <CButton>
        Default
        <CBadge>2</CBadge>
      </CButton>
    </div>
  </>
);
