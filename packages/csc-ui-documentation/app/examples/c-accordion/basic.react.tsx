// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CAccordion, CAccordionItem } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [expanded, setExpanded] = useState<'billing' | 'members' | 'storage'>(
    'billing',
  );

  return (
    <CAccordion
      value={expanded}
      onChangeValue={(event) =>
        setExpanded(event.detail as 'billing' | 'members' | 'storage')
      }
    >
      <CAccordionItem heading="Project billing" value="billing">
        <p>Billing units are deducted monthly based on the resources in use.</p>
      </CAccordionItem>

      <CAccordionItem heading="Members and roles" value="members">
        <p>Invite members by email and assign them a role in the project.</p>
      </CAccordionItem>

      <CAccordionItem heading="Data storage" value="storage">
        <p>Allas object storage is available to every project by default.</p>
      </CAccordionItem>
    </CAccordion>
  );
};
