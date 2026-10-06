// @ts-nocheck — documentation code sample; shown as text, never compiled here
import type { AfterViewInit, ElementRef } from '@angular/core';
import type {
  CAutocompleteElement,
  CAutocompleteFilter,
  CAutocompleteItem,
} from '@cscfi/csc-ui';

import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <!-- The default filter matches the start of the label; this one matches
           anywhere in it. -->
      <c-autocomplete
        #autocomplete
        [items]="items"
        [value]="country()"
        clearable
        hint="Matches anywhere in the label"
        label="Country"
        placeholder="Type to filter"
        (changeValue)="country.set($any($event).detail)"
      ></c-autocomplete>

      <p>Value: {{ country() ?? 'null' }}</p>
    </div>
  `,
})
export class CustomFilterExampleComponent implements AfterViewInit {
  autocomplete =
    viewChild.required<ElementRef<CAutocompleteElement>>('autocomplete');

  country = signal<null | string>(null);

  items: CAutocompleteItem[] = [
    { name: 'Austria', value: 'at' },
    { name: 'Denmark', value: 'dk' },
    { name: 'Estonia', value: 'ee' },
    { name: 'Finland', value: 'fi' },
    { name: 'France', value: 'fr' },
    { name: 'Germany', value: 'de' },
    { name: 'Iceland', value: 'is' },
    { name: 'Netherlands', value: 'nl' },
    { name: 'Norway', value: 'no' },
    { name: 'Sweden', value: 'se' },
  ];

  filter: CAutocompleteFilter = (option, query) =>
    option.label.toLowerCase().includes(query.toLowerCase());

  // `filter` is a function, so it must be set as a DOM property.
  ngAfterViewInit() {
    this.autocomplete().nativeElement.filter = this.filter;
  }
}
