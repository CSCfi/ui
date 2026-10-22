import { CAccordion, CAccordionItem, CIcon } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccountGroup, mdiCreditCardOutline, mdiDatabase } from '@mdi/js';

export const Basic = () => {
  return (
    <div>
      <CAccordion>
        <CAccordionItem heading="Project billing" value="billing">
          <CIcon path={mdiCreditCardOutline} slot="icon" />
          <p>
            Billing units are deducted monthly based on the resources in use.
          </p>
        </CAccordionItem>
        <CAccordionItem heading="Members and roles" value="members">
          <CIcon path={mdiAccountGroup} slot="icon" />
          <p>Invite members by email and assign them a role in the project.</p>
        </CAccordionItem>
        <CAccordionItem heading="Data storage" value="storage">
          <CIcon path={mdiDatabase} slot="icon" />
          <p>Allas object storage is available to every project by default.</p>
        </CAccordionItem>
      </CAccordion>
    </div>
  );
};
