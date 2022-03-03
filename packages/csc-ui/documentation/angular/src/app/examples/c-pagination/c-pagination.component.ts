import { Component } from '@angular/core';
import countries from '../countries.json';

interface PaginationObject {
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
  template = `<div>
  <c-tag *ngFor="let country of countries | slice: options.startFrom:options.endTo">
    {{ country }}
  </c-tag>
</div>
<c-pagination cControl [(ngModel)]="options"></c-pagination>`;
  script = `interface PaginationObject {
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
};
`;
  countries = Object.keys(countries)
    .map((key) => countries[key].english)
    .sort();
  options: PaginationObject = {
    itemCount: this.countries.length,
    itemsPerPage: 25,
    currentPage: 1,
  };

  constructor() {}
}
