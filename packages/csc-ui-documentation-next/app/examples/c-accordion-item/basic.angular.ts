// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiAccountGroup, mdiCreditCardOutline, mdiDatabase } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-accordion>
        <c-accordion-item heading="Project billing" value="billing">
          <c-icon slot="icon" [path]="mdiCreditCardOutline"></c-icon>
          <p>Billing units are deducted monthly based on the resources in use.</p>
        </c-accordion-item>
        <c-accordion-item heading="Members and roles" value="members">
          <c-icon slot="icon" [path]="mdiAccountGroup"></c-icon>
          <p>Invite members by email and assign them a role in the project.</p>
        </c-accordion-item>
        <c-accordion-item heading="Data storage" value="storage">
          <c-icon slot="icon" [path]="mdiDatabase"></c-icon>
          <p>Allas object storage is available to every project by default.</p>
        </c-accordion-item>
      </c-accordion>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiAccountGroup = mdiAccountGroup;
  mdiCreditCardOutline = mdiCreditCardOutline;
  mdiDatabase = mdiDatabase;
}
