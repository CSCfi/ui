// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiHome } from '@mdi/js';
import { CBreadcrumb, CBreadcrumbItem, CIcon } from '@cscfi/csc-ui-react';

export const Basic = () => {
  return (
    <CBreadcrumb>
      <CBreadcrumbItem aria-label="Home" href="https://csc.fi">
        <CIcon slot="icon" path={mdiHome} size={20} />
      </CBreadcrumbItem>
      <CBreadcrumbItem href="https://csc.fi/en/services">
        Services
      </CBreadcrumbItem>
      <CBreadcrumbItem>Supercomputers</CBreadcrumbItem>
    </CBreadcrumb>
  );
};
