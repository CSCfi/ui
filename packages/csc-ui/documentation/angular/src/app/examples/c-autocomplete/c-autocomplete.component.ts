import { Component, OnInit } from '@angular/core';
import { CAutocompleteItem } from '../../../../../../dist/types/types';
import countries from '../countries.json';

@Component({
  selector: 'app-c-autocomplete',
  templateUrl: './c-autocomplete.component.html',
  styleUrls: ['./c-autocomplete.component.scss'],
})
export class CAutocompleteComponent implements OnInit {
  examples = {
    default: `<c-autocomplete
  [(ngModel)]="value"
  [items]="filteredItems"
  [itemsPerPage]="10"
  [query]="query"
  id="listOfCountries"
  label="Countries"
  style="flex: 1"
  hide-details
  cControl
  (changeQuery)="changeQuery($event)"
>
  <i class="mdi mdi-earth" slot="pre"></i>
</c-autocomplete>

<c-button (click)="addTag()" (keyup.enter)="addTag()">Add</c-button>

<c-tag
  *ngFor="let tag of addedTags; let i = index"
  closeable
  (click)="removeTag(i)"
  (keyup.enter)="removeTag(i)"
>
  {{ tag.name }}
</c-tag>`,

    returnValue: `<c-row gap="8">
    <c-autocomplete
      [(ngModel)]="value"
      [items]="filteredItems"
      [itemsPerPage]="10"
      [query]="query"
      label="Countries"
      return-value
      hide-details
      cControl
      (changeQuery)="changeQuery($event)"
    ></c-autocomplete>

    <c-button (click)="addTag()" (keyup.enter)="addTag()">Add</c-button>
  </c-row>

  <p style="margin: 16px 0 0">
    Added values:
    <c-tag>{{ addedTags.length }}</c-tag>
  </p>

  <ul>
    <li *ngFor="let tag of addedTags">
      {{ tag }}
    </li>

    <li *ngIf="!addedTags.length">No added values</li>
  </ul>`,
  };

  scripts = {
    default: `query: any;
value = null;
items = [
  {
    name: 'Afganistan',
    value: 'AF',
  },
  {
    name: 'Aland Islands',
    value: 'AX',
  },
  {
    name: 'Albania',
    value: 'AL',
  },
  ...
];

addedTags = [];

get filteredItems() {
  if (!this.query) return this.items;
  return this.items
    .filter((i) => i.name?.toLowerCase()
    .includes(this.query?.toLowerCase()));
}

changeQuery(event) {
  this.query = event.detail;
}

addTag() {
  if (!!this.value) this.addedTags.push(this.value);

  this.value = null;
  this.query = null;
}

removeTag(index) {
  this.addedTags.splice(index, 1);
}`,
  };
  query: any;
  valueQuery: any;
  value = null;
  valueValue: string = '';
  items: CAutocompleteItem[] = Object.keys(countries)
    .map((key) => ({
      value: key,
      name: countries[key],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  addedTags: CAutocompleteItem[] = [];
  addedValueTags: string[] = [];

  get filteredItems() {
    if (!this.query) return this.items;
    return this.items.filter((i) => i.name?.toLowerCase().includes(this.query?.toLowerCase()));
  }

  get filteredItems2() {
    if (!this.valueQuery) return this.items;
    return this.items.filter((i) => i.name?.toLowerCase().includes(this.valueQuery?.toLowerCase()));
  }

  changeQuery(event) {
    this.query = event.detail;
  }

  changeQuery2(event) {
    this.valueQuery = event.detail;
  }

  addTag() {
    if (!!this.value) this.addedTags.push(this.value);

    this.value = null;
    this.query = null;
  }

  addValueTag() {
    if (!!this.valueValue) this.addedValueTags.push(this.valueValue);

    this.valueValue = null;
    this.valueQuery = null;
  }

  removeTag(index) {
    this.addedTags.splice(index, 1);
  }

  constructor() {}

  ngOnInit(): void {}
}
