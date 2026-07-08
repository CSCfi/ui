// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import {
  type CDataTableColumn,
  type CDataTableElement,
  type CDataTableExpandedContext,
  type CDataTableRow,
  h,
} from '@cscfi/csc-ui-next';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <!-- The description column has expansion: 'always' — it never renders as
           a table column, its cells live in the expansion row. The custom
           expandedContent renders after them. -->
      <c-data-table
        #table
        [columns]="columns"
        [data]="data"
        [expandedContent]="expandedContent"
        [getRowId]="getRowId"
        single-expansion
      ></c-data-table>

      <p>Expanded: {{ expanded().length ? expanded().join(', ') : '—' }}</p>
    </div>
  `,
})
export class ExpansionExampleComponent implements AfterViewInit {
  table = viewChild.required<ElementRef<CDataTableElement>>('table');

  columns: CDataTableColumn[] = [
    { header: 'Service', key: 'name' },
    { header: 'Category', key: 'category' },
    { expansion: 'always', header: 'Description', key: 'description' },
  ];

  data = [
    {
      category: 'Computing',
      description:
        'Supercomputer for medium-scale simulations and data analysis.',
      id: 'puhti',
      name: 'Puhti',
    },
    {
      category: 'Computing',
      description: 'Supercomputer for massively parallel workloads.',
      id: 'mahti',
      name: 'Mahti',
    },
    {
      category: 'Storage',
      description: 'Object storage for research data, accessible everywhere.',
      id: 'allas',
      name: 'Allas',
    },
  ];

  getRowId = (row: CDataTableRow) => row.id as string;

  expandedContent = ({ row }: CDataTableExpandedContext) =>
    h(
      'c-link',
      { href: `https://docs.csc.fi/computing/systems-${row.id}/`, underline: true, style: 'padding-inline: 6px' },
      `Read more about ${row.name}`,
    );

  expanded = signal<string[]>([]);

  // Colon-named events ("change:expanded") cannot be bound in an Angular
  // template, so listen on the element directly.
  ngAfterViewInit() {
    this.table().nativeElement.addEventListener('change:expanded', (event) => {
      this.expanded.set((event as CustomEvent<string[]>).detail);
    });
  }
}
