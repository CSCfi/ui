// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  styles: [
    `
      /* Slotted heading content is light DOM: style it with your own CSS. It
         inherits the header row's text color, so it matches a plain 'heading'. */
      .member-heading {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        font-weight: 500;
      }

      .member-heading-meta {
        font-size: 0.8125rem;
        font-weight: 400;
        color: var(--c-on-surface-muted);
      }
    `,
  ],
  template: `
    <div>
      <c-accordion>
        <c-accordion-item value="members">
          <div slot="heading" class="member-heading">
            <span>Members and roles</span>
            <span class="member-heading-meta">3 pending invites</span>
          </div>
          <p>Invite members by email and assign them a role in the project.</p>
        </c-accordion-item>
        <c-accordion-item heading="Data storage" value="storage">
          <p>Allas object storage is available to every project by default.</p>
        </c-accordion-item>
      </c-accordion>
    </div>
  `,
})
export class CustomHeadingExampleComponent {}
