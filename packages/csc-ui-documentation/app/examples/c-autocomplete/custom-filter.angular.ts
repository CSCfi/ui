// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import type {
  CAutocompleteElement,
  CAutocompleteFilter,
  CAutocompleteItem,
} from '@cscfi/csc-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

  country = signal<string | null>(null);

  // `filter` is a function, so it must be set as a DOM property.
  ngAfterViewInit() {
    this.autocomplete().nativeElement.filter = this.filter;
  }
}
