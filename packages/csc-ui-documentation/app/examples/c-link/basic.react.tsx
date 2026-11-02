// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CLink } from '@cscfi/csc-ui-react';

const styles = `
/* Restyle the link through its part (ADR-0006). */
c-link.normal-weight::part(root) {
  font-weight: 400;
}
`;

export const Basic = () => {
  return (
    <div className="example-row">
      <style>{styles}</style>

      <CLink href="https://csc.fi">Default link</CLink>

      <CLink href="https://csc.fi" underline>
        Underlined link
      </CLink>

      <CLink href="https://csc.fi" target="_blank">
        Opens in a new tab
      </CLink>

      <CLink className="normal-weight" href="https://csc.fi">
        Normal weight
      </CLink>
    </div>
  );
};
