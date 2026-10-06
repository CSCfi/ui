// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-accordion multiple outlined>
        <c-accordion-item heading="Project billing" value="billing">
          <p>
            Billing units are deducted monthly based on the resources in use.
          </p>
        </c-accordion-item>

        <c-accordion-item heading="Members and roles" value="members">
          <p>Invite members by email and assign them a role in the project.</p>
        </c-accordion-item>

        <c-accordion-item heading="Data storage" value="storage">
          <p>Allas object storage is available to every project by default.</p>
        </c-accordion-item>
      </c-accordion>
    </div>
  `,
})
export class MultipleExampleComponent {}
