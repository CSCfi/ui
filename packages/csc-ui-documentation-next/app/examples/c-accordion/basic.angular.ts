// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <c-accordion
      [value]="expanded()"
      (changeValue)="expanded.set($any($event).detail)"
    >
      <c-accordion-item heading="Project billing" value="billing">
        <p>Billing units are deducted monthly based on the resources in use.</p>
      </c-accordion-item>

      <c-accordion-item heading="Members and roles" value="members">
        <p>Invite members by email and assign them a role in the project.</p>
      </c-accordion-item>

      <c-accordion-item heading="Data storage" value="storage">
        <p>Allas object storage is available to every project by default.</p>
      </c-accordion-item>
    </c-accordion>
  `,
})
export class BasicExampleComponent {
  expanded = signal<'billing' | 'members' | 'storage'>('billing');
}
