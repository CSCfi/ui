import { CBreadcrumb, CBreadcrumbItem, CIcon } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiHome } from '@mdi/js';

export const Basic = () => {
  return (
    <CBreadcrumb>
      <CBreadcrumbItem aria-label="Home" href="https://csc.fi">
        <CIcon path={mdiHome} size={20} slot="icon" />
      </CBreadcrumbItem>
      <CBreadcrumbItem href="https://csc.fi/en/services">
        Services
      </CBreadcrumbItem>
      <CBreadcrumbItem>Supercomputers</CBreadcrumbItem>
    </CBreadcrumb>
  );
};
