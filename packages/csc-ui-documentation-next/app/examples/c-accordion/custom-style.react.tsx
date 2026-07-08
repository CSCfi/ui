// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CAccordion, CAccordionItem } from '@cscfi/csc-ui-next-react';

const styles = `
:root, :root[data-theme='light'] {
  --accordion-content-background: var(--c-surface);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --accordion-content-background: color-mix(in srgb, var(--c-primary) 20%, transparent);
  }
}

:root[data-theme='dark'] {
  --accordion-content-background: color-mix(in srgb, var(--c-primary) 20%, transparent);
}

c-accordion.custom-style {
  c-accordion-item {
    &::part(root) {
      border: 1px solid var(--c-border);
    }

    &::part(header) {
      background-color: transparent;
    }

    &::part(content) {
      margin: 8px;
      padding: 8px;
      border-radius: 4px;
      background-color: var(--accordion-content-background);
    }

    &[expanded]::part(root) {
      border-color: var(--c-primary);
      background-color: color-mix(in srgb, var(--c-primary) 10%, transparent);
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
          <p>Billing units are deducted monthly based on the resources in use.</p>
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
