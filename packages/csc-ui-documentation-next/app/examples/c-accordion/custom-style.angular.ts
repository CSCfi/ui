// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // The styles target :root and ::part(), so they must apply globally.
  encapsulation: ViewEncapsulation.None,
  template: `
    <c-accordion
      class="custom-style"
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
  styles: [
    `
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
    `,
  ],
})
export class CustomStyleExampleComponent {
  expanded = signal<'billing' | 'members' | 'storage'>('billing');
}
