// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import type { CAutocompleteElement, CAutocompleteItem } from '@cscfi/csc-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <!-- With "external", the autocomplete renders "items" verbatim and only
           emits "change:query"; filtering happens in a simulated server
           request. The event also fires with an empty string when the panel
           opens, which is what loads the initial unfiltered list. -->
      <c-autocomplete
        #autocomplete
        [items]="items()"
        [loading]="loading()"
        [value]="country()"
        external
        clearable
        hint="Options are fetched as you type"
        label="Country"
        placeholder="Type to search"
        (changeValue)="country.set($any($event).detail)"
      ></c-autocomplete>

      <p>Value: {{ country() ?? 'null' }}</p>
    </div>
  `,
})
export class ExternalExampleComponent implements AfterViewInit, OnDestroy {
  autocomplete =
    viewChild.required<ElementRef<CAutocompleteElement>>('autocomplete');

  // ---- a pretend server ------------------------------------------------
  ALL: CAutocompleteItem[] = [
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

  search = (query: string): Promise<CAutocompleteItem[]> =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve(
            this.ALL.filter((item) =>
              item.name.toLowerCase().includes(query.toLowerCase()),
            ),
          ),
        600,
      ),
    );
  // -----------------------------------------------------------------------

  country = signal<string | null>(null);

  items = signal<CAutocompleteItem[]>([]);

  loading = signal(false);

  debounce?: ReturnType<typeof setTimeout>;

  // Drop responses a newer query has superseded.
  requestId = 0;

  async load(query: string) {
    const id = ++this.requestId;
    this.loading.set(true);

    const result = await this.search(query);

    if (id !== this.requestId) return;
    this.items.set(result);
    this.loading.set(false);
  }

  // Colon-named events ("change:query") cannot be bound in an Angular
  // template, so listen on the element directly. The component ships no
  // debounce — do it in the handler, as here.
  ngAfterViewInit() {
    this.autocomplete().nativeElement.addEventListener(
      'change:query',
      (event) => {
        clearTimeout(this.debounce);

        const query = (event as CustomEvent<string>).detail;
        this.debounce = setTimeout(() => this.load(query), 300);
      },
    );
  }

  ngOnDestroy() {
    clearTimeout(this.debounce);
  }
}
