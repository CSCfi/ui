// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  mdiAlertOutline,
  mdiCheck,
  mdiDelete,
  mdiInformationOutline,
  mdiPlus,
  mdiStarOutline,
} from '@mdi/js';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-grid">
      <div class="example-row">
        <c-icon-button aria-label="Add">
          <c-icon [path]="mdiPlus"></c-icon>
        </c-icon-button>

        <c-icon-button aria-label="Favourite" variant="secondary">
          <c-icon [path]="mdiStarOutline"></c-icon>
        </c-icon-button>

        <c-icon-button aria-label="Approve" variant="success">
          <c-icon [path]="mdiCheck"></c-icon>
        </c-icon-button>

        <c-icon-button aria-label="Details" variant="info">
          <c-icon [path]="mdiInformationOutline"></c-icon>
        </c-icon-button>

        <c-icon-button aria-label="Warnings" variant="warning">
          <c-icon [path]="mdiAlertOutline"></c-icon>
        </c-icon-button>

        <c-icon-button aria-label="Delete" variant="danger">
          <c-icon [path]="mdiDelete"></c-icon>
        </c-icon-button>
      </div>

      <div class="example-row">
        <c-icon-button appearance="outlined" aria-label="Add">
          <c-icon [path]="mdiPlus"></c-icon>
        </c-icon-button>

        <c-icon-button
          appearance="outlined"
          aria-label="Favourite"
          variant="secondary"
        >
          <c-icon [path]="mdiStarOutline"></c-icon>
        </c-icon-button>

        <c-icon-button
          appearance="outlined"
          aria-label="Approve"
          variant="success"
        >
          <c-icon [path]="mdiCheck"></c-icon>
        </c-icon-button>

        <c-icon-button
          appearance="outlined"
          aria-label="Details"
          variant="info"
        >
          <c-icon [path]="mdiInformationOutline"></c-icon>
        </c-icon-button>

        <c-icon-button
          appearance="outlined"
          aria-label="Warnings"
          variant="warning"
        >
          <c-icon [path]="mdiAlertOutline"></c-icon>
        </c-icon-button>

        <c-icon-button
          appearance="outlined"
          aria-label="Delete"
          variant="danger"
        >
          <c-icon [path]="mdiDelete"></c-icon>
        </c-icon-button>
      </div>

      <div class="example-row">
        <c-icon-button appearance="ghost" aria-label="Add">
          <c-icon [path]="mdiPlus"></c-icon>
        </c-icon-button>

        <c-icon-button
          appearance="ghost"
          aria-label="Favourite"
          variant="secondary"
        >
          <c-icon [path]="mdiStarOutline"></c-icon>
        </c-icon-button>

        <c-icon-button
          appearance="ghost"
          aria-label="Approve"
          variant="success"
        >
          <c-icon [path]="mdiCheck"></c-icon>
        </c-icon-button>

        <c-icon-button appearance="ghost" aria-label="Details" variant="info">
          <c-icon [path]="mdiInformationOutline"></c-icon>
        </c-icon-button>

        <c-icon-button
          appearance="ghost"
          aria-label="Warnings"
          variant="warning"
        >
          <c-icon [path]="mdiAlertOutline"></c-icon>
        </c-icon-button>

        <c-icon-button appearance="ghost" aria-label="Delete" variant="danger">
          <c-icon [path]="mdiDelete"></c-icon>
        </c-icon-button>
      </div>

      <div class="example-row">
        <c-icon-button appearance="text" aria-label="Add">
          <c-icon [path]="mdiPlus"></c-icon>
        </c-icon-button>

        <c-icon-button
          appearance="text"
          aria-label="Favourite"
          variant="secondary"
        >
          <c-icon [path]="mdiStarOutline"></c-icon>
        </c-icon-button>

        <c-icon-button appearance="text" aria-label="Approve" variant="success">
          <c-icon [path]="mdiCheck"></c-icon>
        </c-icon-button>

        <c-icon-button appearance="text" aria-label="Details" variant="info">
          <c-icon [path]="mdiInformationOutline"></c-icon>
        </c-icon-button>

        <c-icon-button
          appearance="text"
          aria-label="Warnings"
          variant="warning"
        >
          <c-icon [path]="mdiAlertOutline"></c-icon>
        </c-icon-button>

        <c-icon-button appearance="text" aria-label="Delete" variant="danger">
          <c-icon [path]="mdiDelete"></c-icon>
        </c-icon-button>
      </div>
    </div>
  `,
})
export class VariantsExampleComponent {
  mdiAlertOutline = mdiAlertOutline;
  mdiCheck = mdiCheck;
  mdiDelete = mdiDelete;
  mdiInformationOutline = mdiInformationOutline;
  mdiPlus = mdiPlus;
  mdiStarOutline = mdiStarOutline;
}
