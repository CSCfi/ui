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
  CDataTableColumn,
  CDataTableElement,
  CDataTableSort,
} from '@cscfi/csc-ui-next';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-data-table
        #table
        [columns]="columns"
        [data]="data"
        [sort]="sort()"
        page-size="5"
      ></c-data-table>

      <p>Sorted by: {{ sort().column }} ({{ sort().direction }})</p>
    </div>
  `,
})
export class BasicExampleComponent implements AfterViewInit {
  table = viewChild.required<ElementRef<CDataTableElement>>('table');

  columns: CDataTableColumn[] = [
    { header: 'Project', key: 'name', sortable: true },
    { align: 'end', header: 'Members', key: 'members', sortable: true },
    { header: 'Facility', key: 'facility' },
    { header: 'Created', key: 'created', sortable: true },
  ];

  data = [
    { created: '2026-01-14', facility: 'Puhti', members: 12, name: 'Aurora' },
    { created: '2026-02-02', facility: 'Mahti', members: 3, name: 'Borealis' },
    { created: '2026-02-19', facility: 'LUMI', members: 41, name: 'Cirrus' },
    { created: '2026-03-05', facility: 'Allas', members: 7, name: 'Drift' },
    { created: '2026-03-28', facility: 'Puhti', members: 18, name: 'Ember' },
    { created: '2026-04-11', facility: 'LUMI', members: 2, name: 'Fjord' },
    { created: '2026-05-01', facility: 'Mahti', members: 25, name: 'Glacier' },
    { created: '2026-05-23', facility: 'Allas', members: 9, name: 'Halo' },
  ];

  sort = signal<CDataTableSort>({ column: 'name', direction: 'asc' });

  // Colon-named events ("change:sort") cannot be bound in an Angular
  // template, so listen on the element directly.
  ngAfterViewInit() {
    this.table().nativeElement.addEventListener('change:sort', (event) => {
      this.sort.set((event as CustomEvent<CDataTableSort>).detail);
    });
  }
}
