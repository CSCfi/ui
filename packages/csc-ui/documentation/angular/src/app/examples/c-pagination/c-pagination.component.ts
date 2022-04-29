import { ChangeDetectorRef, Component } from '@angular/core';
import countries from '../countries.json';

interface CPaginationOptions {
  itemCount: number;
  currentPage?: number;
  totalVisible?: number;
  itemsPerPage?: number;
  startFrom?: number;
  endTo?: number;
}

@Component({
  selector: 'app-c-pagination',
  templateUrl: './c-pagination.component.html',
  styleUrls: ['./c-pagination.component.scss'],
})
export class CPaginationComponent {
  templates = {
    basic: `<c-tag *ngFor="let country of countries | slice: options.startFrom:options.endTo + 1">
      {{ country }}
    </c-tag>
  <c-pagination cControl [(ngModel)]="options"></c-pagination>`,
    simple: `<c-tag *ngFor="let country of countries | slice: options.startFrom:options.endTo + 1">
      {{ country }}
    </c-tag>
  <c-pagination cControl [(ngModel)]="options" hide-details simple></c-pagination>`,
    advanced: `<c-card>
  <c-card-title>Example</c-card-title>
  <c-card-content>
    <div>
      <c-tag *ngFor="let country of countries | slice: options.startFrom:options.endTo + 1">
        {{ country }}
      </c-tag>
    </div>
  </c-card-content>
  <c-card-actions justify="stretch">
    <c-pagination
      cControl
      [(ngModel)]="options"
      (changeValue)="updateView()"
      simple
    ></c-pagination>
  </c-card-actions>
</c-card>

<p>Programmatically change pagination values:</p>

<c-row gap="8">
  <c-button (click)="example1()">Page 2</c-button>
  <c-button (click)="example2()">50 items per page</c-button>
</c-row>
`,
  };
  scripts = {
    basic: `interface PaginationObject {
  itemCount: number;
  currentPage?: number;
  totalVisible?: number;
  itemsPerPage?: number;
  startFrom?: number;
  endTo?: number;
}

...

countries = [
  'Afganistan',
  'Aland Islands',
  'Albania',
  'Algeria',
  'American Samoa',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antarctica',
  'Antigua-Barbuda',
  'Argentina',
  ...
];
  
options: PaginationObject = {
  itemCount: this.countries.length,
  itemsPerPage: 25,
  currentPage: 1,
  startFrom: 0,
  endTo: 24,
};`,
    advanced: `interface PaginationObject {
  itemCount: number;
  currentPage?: number;
  totalVisible?: number;
  itemsPerPage?: number;
  startFrom?: number;
  endTo?: number;
}

...

countries = [
  'Afganistan',
  'Aland Islands',
  'Albania',
  'Algeria',
  'American Samoa',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antarctica',
  'Antigua-Barbuda',
  'Argentina',
  ...
];

options: PaginationObject = {
  itemCount: this.countries.length,
  itemsPerPage: 25,
  currentPage: 1,
  startFrom: 0,
  endTo: 24,
};

/**
 * Slice pipe requires manual update after pagination change
 */
updateView() {
  this._changeDetectorRef.detectChanges();
}

// Options object needs to be fully replaced in order to trigger pagination change programmatically
example1() {
  this.options = { ...this.options, currentPage: 2 };
}

// Options object needs to be fully replaced in order to trigger pagination change programmatically
example2() {
  this.options = {
    ...this.options,
    itemsPerPage: 50,
  };
}`,
  };
  countries = Object.values(countries).sort();
  options: CPaginationOptions = {
    itemCount: this.countries.length,
    itemsPerPage: 25,
    currentPage: 1,
    startFrom: 0,
    endTo: 24,
  };

  optionsSimple: CPaginationOptions = {
    itemCount: this.countries.length,
    itemsPerPage: 25,
    currentPage: 1,
    startFrom: 0,
    endTo: 24,
  };

  options2: CPaginationOptions = {
    itemCount: this.countries.length,
    itemsPerPage: 25,
    currentPage: 1,
    startFrom: 0,
    endTo: 24,
  };

  constructor(private _changeDetectorRef: ChangeDetectorRef) {}

  /**
   * Slice pipe requires manual update after pagination change
   */
  updateView() {
    this._changeDetectorRef.detectChanges();
  }

  example1() {
    // Options object needs to be fully replaced in order to trigger pagination change programmatically
    this.options2 = { ...this.options2, currentPage: 2 };
  }

  example2() {
    // Options object needs to be fully replaced in order to trigger pagination change programmatically
    this.options2 = {
      ...this.options2,
      itemsPerPage: 50,
    };
  }
}
