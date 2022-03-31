import { Component, OnInit } from '@angular/core';
import { CAutocompleteItem } from '../../../../../../dist/types/types';
import countries from '../countries.json';

const camelize = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/([-.])/g, '');
};

@Component({
  selector: 'app-c-autocomplete',
  templateUrl: './c-autocomplete.component.html',
  styleUrls: ['./c-autocomplete.component.scss'],
})
export class CAutocompleteComponent implements OnInit {
  examples = {
    default: `<c-autocomplete
  label="Countries"
  cControl
  [items]="filteredItems"
  [query]="query"
  (changeQuery)="changeQuery($event)"
  [itemsPerPage]="10"
  [(ngModel)]="value"
></c-autocomplete>

<c-button [disabled]="!value" (click)="addTag()">Add</c-button>

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
      [(ngModel)]="valueValue"
      [items]="filteredItems"
      [query]="query"
      (changeQuery)="changeQuery($event)"
      [itemsPerPage]="10"
      label="Countries"
      return-value
      hide-details
      cControl
    ></c-autocomplete>

    <c-button [disabled]="!valueValue" (click)="addValueTag()">Add</c-button>
  </c-row>

  <p style="margin: 16px 0 0">
    Added values:
    <c-tag>{{ addedValueTags.length }}</c-tag>
  </p>

  <ul>
    <li *ngFor="let tag of addedValueTags">
      {{ tag }}
    </li>

    <li *ngIf="!addedValueTags.length">No added values</li>
  </ul>`,
  };

  scripts = {
    default: `query: any;
value = null;
items = [
  {
    value: 'Afganistan',
    name: 'afganistan',
  },
  {
    value: 'Aland Islands',
    name: 'alandIslands',
  },
  {
    value: 'Albania',
    name: 'albania',
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
}

removeTag(index) {
  this.addedTags.splice(index, 1);
}`,
    returnValue: `query: string | number;

value: string = '';

items: CAutocompleteItem[] = [
  {
    value: 'Afganistan',
    name: 'afganistan',
  },
  {
    value: 'Aland Islands',
    name: 'alandIslands',
  },
  {
    value: 'Albania',
    name: 'albania',
  },
  ...
];

addedTags: string[] = [];

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
}
    `,
  };
  query: any;
  value = null;
  valueValue: string = '';
  items: CAutocompleteItem[] = Object.keys(countries)
    .map((key) => countries[key].english)
    .sort()
    .map((item) => ({
      value: camelize(item),
      name: item,
    }));

  addedTags: CAutocompleteItem[] = [];
  addedValueTags: string[] = [];

  get filteredItems() {
    if (!this.query) return this.items;
    return this.items.filter((i) => i.name?.toLowerCase().includes(this.query?.toLowerCase()));
  }

  changeQuery(event) {
    this.query = event.detail;
  }

  addTag() {
    if (!!this.value) this.addedTags.push(this.value);
  }

  addValueTag() {
    if (!!this.valueValue) this.addedValueTags.push(this.valueValue);

    this.valueValue = null;

    // TODO:  Triggers change in the component only once!!!!!
    // TODO:  should we use value and forget the query?
    this.query = null;
  }

  removeTag(index) {
    this.addedTags.splice(index, 1);
  }

  constructor() {}

  ngOnInit(): void {}
}
