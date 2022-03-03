import { Component, OnInit } from '@angular/core';
import countries from '../countries.json';

@Component({
  selector: 'app-c-autocomplete',
  templateUrl: './c-autocomplete.component.html',
  styleUrls: ['./c-autocomplete.component.scss'],
})
export class CAutocompleteComponent implements OnInit {
  examples = [
    `<c-autocomplete
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
  ];

  scripts = [
    `query: any;
value = null;
items = [
  {
    value: 'Afganistan',
    name: 'Afganistan',
  },
  {
    value: 'Aland Islands',
    name: 'Aland Islands',
  },
  {
    value: 'Albania',
    name: 'Albania',
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
  ];
  query: any;
  value = null;
  items = Object.keys(countries)
    .map((key) => countries[key].english)
    .sort()
    .map((item) => ({
      value: item,
      name: item,
    }));

  addedTags = [];

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

  removeTag(index) {
    this.addedTags.splice(index, 1);
  }

  constructor() {}

  ngOnInit(): void {}
}
