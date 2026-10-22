import { CBreadcrumb, CBreadcrumbItem, CIcon } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiHome } from '@mdi/js';

// Drag the corner to narrow the box: the middle crumbs fold behind "…",
// then the current crumb's label shortens.
export const Folding = () => {
  return (
    <div
      style={{
        border: '1px dashed currentColor',
        maxWidth: '100%',
        minWidth: 160,
        overflow: 'hidden',
        padding: 8,
        resize: 'horizontal',
        width: 420,
      }}
    >
      <CBreadcrumb>
        <CBreadcrumbItem aria-label="Home" href="https://csc.fi">
          <CIcon path={mdiHome} size={20} slot="icon" />
        </CBreadcrumbItem>
        <CBreadcrumbItem href="https://csc.fi/en/services">
          Services
        </CBreadcrumbItem>
        <CBreadcrumbItem href="https://csc.fi/en/services/computing">
          Computing
        </CBreadcrumbItem>
        <CBreadcrumbItem href="https://csc.fi/en/services/computing/lumi">
          LUMI supercomputer
        </CBreadcrumbItem>
        <CBreadcrumbItem>Applying for computing resources</CBreadcrumbItem>
      </CBreadcrumb>
    </div>
  );
};
