// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiHome } from '@mdi/js';
import { CBreadcrumb, CBreadcrumbItem, CIcon } from '@cscfi/csc-ui-react';

// Drag the corner to narrow the box: the middle crumbs fold behind "…",
// then the current crumb's label shortens.
export const Folding = () => {
  return (
    <div
      style={{
        resize: 'horizontal',
        overflow: 'hidden',
        width: 420,
        minWidth: 160,
        maxWidth: '100%',
        padding: 8,
        border: '1px dashed currentColor',
      }}
    >
      <CBreadcrumb>
        <CBreadcrumbItem aria-label="Home" href="https://csc.fi">
          <CIcon slot="icon" path={mdiHome} size={20} />
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
