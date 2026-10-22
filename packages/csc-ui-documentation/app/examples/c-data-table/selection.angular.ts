// @ts-nocheck — documentation code sample; shown as text, never compiled here
import type { AfterViewInit, ElementRef } from '@angular/core';
import type {
  CDataTableColumn,
  CDataTableElement,
  CDataTableRow,
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
      <!-- With client-side data and pagination, selecting a full page offers a
           two-step "select all N rows" banner. -->
      <c-data-table
        #table
        [columns]="columns"
        [data]="data"
        [getRowId]="getRowId"
        [selected]="selected()"
        page-size="4"
        selection="multiple"
      ></c-data-table>

      <p>Selected ids: {{ selected().length ? selected().join(', ') : '—' }}</p>
    </div>
  `,
})
export class SelectionExampleComponent implements AfterViewInit {
  columns: CDataTableColumn[] = [
    { header: 'Dataset', key: 'name' },
    { align: 'end', header: 'Size (GB)', key: 'size' },
  ];

  data = Array.from({ length: 11 }, (_, i) => ({
    id: `ds-${i + 1}`,
    name: `Dataset ${i + 1}`,
    size: ((i * 37) % 90) + 4,
  }));

  selected = signal<string[]>(['ds-2']);

  table = viewChild.required<ElementRef<CDataTableElement>>('table');

  // A stable row id keeps the selection correct across sorting and paging.
  getRowId = (row: CDataTableRow) => row.id as string;

  // Colon-named events ("change:selected") cannot be bound in an Angular
  // template, so listen on the element directly.
  ngAfterViewInit() {
    this.table().nativeElement.addEventListener('change:selected', (event) => {
      this.selected.set(
        (event as CustomEvent<{ ids: string[]; rows: CDataTableRow[] }>).detail
          .ids,
      );
    });
  }
}
