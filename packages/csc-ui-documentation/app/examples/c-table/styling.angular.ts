// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // The styles target ::part(), so they must apply globally.
  encapsulation: ViewEncapsulation.None,
  template: `
    <div>
      <c-table>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Puhti</td>
              <td><c-tag class="tag-success" flat>Running</c-tag></td>
              <td>Anna Virtanen</td>
            </tr>
            <tr>
              <td>Mahti</td>
              <td><c-tag class="tag-warning" flat>Maintenance</c-tag></td>
              <td>Mikko Korhonen</td>
            </tr>
            <tr>
              <td>Allas</td>
              <td><c-tag class="tag-success" flat>Running</c-tag></td>
              <td>Sara Niemi</td>
            </tr>
          </tbody>
        </table>
      </c-table>
    </div>
  `,
  styles: [
    `
      /* The table stays in your DOM, so page CSS reaches components inside cells. */
      c-tag.tag-success::part(root) {
        background-color: var(--c-success-subtle);
        color: var(--c-on-success-subtle);
        box-shadow: inset 0 0 0 1px var(--c-success);
      }

      c-tag.tag-warning::part(root) {
        background-color: var(--c-warning-subtle);
        color: var(--c-on-warning-subtle);
        box-shadow: inset 0 0 0 1px var(--c-warning);
      }
    `,
  ],
})
export class StylingExampleComponent {}
