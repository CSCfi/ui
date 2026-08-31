// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { mdiTuneVariant } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-popover heading="Display settings">
        <c-button slot="trigger" outlined>
          Display settings
          <c-icon [path]="mdiTuneVariant" />
        </c-button>

        <div class="example-grid">
          <c-switch
            [value]="compact()"
            (changeValue)="compact.set($any($event).detail)"
          >
            Compact rows
          </c-switch>

          <c-switch
            [value]="showIds()"
            (changeValue)="showIds.set($any($event).detail)"
          >
            Show identifiers
          </c-switch>
        </div>
      </c-popover>

      <p>Compact: {{ compact() }}, identifiers: {{ showIds() }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiTuneVariant = mdiTuneVariant;

  compact = signal(false);

  showIds = signal(true);
}
