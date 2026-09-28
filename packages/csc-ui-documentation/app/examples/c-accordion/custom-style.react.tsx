// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CAccordion, CAccordionItem } from '@cscfi/csc-ui-react';

const styles = `
/* The default look is the accordion frame; this recolours the expanded
   item from primary to secondary through its parts. */
c-accordion.custom-style {
  c-accordion-item[expanded] {
    &::part(root) {
      border-color: var(--c-secondary);
      background-color: color-mix(in srgb, var(--c-secondary) 5%, transparent);
      box-shadow: inset 2px 0 0 0 var(--c-secondary);
    }

    &::part(header),
    &::part(indicator) {
      color: var(--c-secondary);
    }

    /* The header's hover and pressed washes follow the recolour too. */
    &::part(header):hover {
      background-color: color-mix(in srgb, var(--c-secondary) 8%, transparent);
    }

    &::part(header):active {
      background-color: color-mix(in srgb, var(--c-secondary) 15%, transparent);
    }

    &::part(content) {
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--c-secondary) 25%, transparent);
    }
  }
}
`;

export const CustomStyle = () => {
  const [expanded, setExpanded] = useState<'billing' | 'members' | 'storage'>(
    'billing',
  );

  return (
    <>
      <style>{styles}</style>

      <CAccordion
        className="custom-style"
        value={expanded}
        onChangeValue={(event) =>
          setExpanded(event.detail as 'billing' | 'members' | 'storage')
        }
      >
        <CAccordionItem heading="Project billing" value="billing">
          <p>
            Billing units are deducted monthly based on the resources in use.
          </p>
        </CAccordionItem>

        <CAccordionItem heading="Members and roles" value="members">
          <p>Invite members by email and assign them a role in the project.</p>
        </CAccordionItem>

        <CAccordionItem heading="Data storage" value="storage">
          <p>Allas object storage is available to every project by default.</p>
        </CAccordionItem>
      </CAccordion>
    </>
  );
};
