// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-tabs value="summary">
        <c-tab value="summary">Summary</c-tab>
        <c-tab value="members">Members</c-tab>
        <c-tab value="settings">Settings</c-tab>

        <c-tab-items slot="items">
          <c-tab-item value="summary">
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
    </div>
  `,
})
export class BasicExampleComponent {}
