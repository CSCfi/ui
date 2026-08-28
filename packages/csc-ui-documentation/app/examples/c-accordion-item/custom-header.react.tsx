// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CAccordion, CAccordionItem } from '@cscfi/csc-ui-react';

const styles = `
/* Slotted header content is light DOM: style it with your own CSS. It
   inherits the header's text color, so it matches a plain 'heading'. */
.member-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-weight: 500;
}

.member-header-meta {
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--c-on-surface-muted);
}
`;

export const CustomHeader = () => {
  return (
    <>
      <style>{styles}</style>

      <CAccordion>
        <CAccordionItem value="members">
          <div slot="header" className="member-header">
            <span>Members and roles</span>
            <span className="member-header-meta">3 pending invites</span>
          </div>
          <p>Invite members by email and assign them a role in the project.</p>
        </CAccordionItem>
        <CAccordionItem heading="Data storage" value="storage">
          <p>Allas object storage is available to every project by default.</p>
        </CAccordionItem>
      </CAccordion>
    </>
  );
};
