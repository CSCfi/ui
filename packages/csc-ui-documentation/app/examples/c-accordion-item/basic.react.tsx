// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccountGroup, mdiCreditCardOutline, mdiDatabase } from '@mdi/js';
import { CAccordion, CAccordionItem, CIcon } from '@cscfi/csc-ui-react';

export const Basic = () => {
  return (
    <div>
      <CAccordion>
        <CAccordionItem heading="Project billing" value="billing">
          <CIcon slot="icon" path={mdiCreditCardOutline} />
          <p>
            Billing units are deducted monthly based on the resources in use.
          </p>
        </CAccordionItem>
        <CAccordionItem heading="Members and roles" value="members">
          <CIcon slot="icon" path={mdiAccountGroup} />
          <p>Invite members by email and assign them a role in the project.</p>
        </CAccordionItem>
        <CAccordionItem heading="Data storage" value="storage">
          <CIcon slot="icon" path={mdiDatabase} />
          <p>Allas object storage is available to every project by default.</p>
        </CAccordionItem>
      </CAccordion>
    </div>
  );
};
