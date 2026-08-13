// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <c-tabs [value]="tab()" (changeValue)="tab.set($any($event).detail)">
      <c-tab-buttons>
        <c-button value="overview">Overview</c-button>
        <c-button value="members">Members</c-button>
        <c-button value="settings">Settings</c-button>
      </c-tab-buttons>

      <c-tab-items slot="items">
        <c-tab-item value="overview">
          <p>Overview of the project and its recent activity.</p>
        </c-tab-item>
        <c-tab-item value="members">
          <p>People with access to this project.</p>
        </c-tab-item>
        <c-tab-item value="settings">
          <p>Project name, description and visibility.</p>
        </c-tab-item>
      </c-tab-items>
    </c-tabs>
  `,
})
export class BasicExampleComponent {
  tab = signal('overview');
}
