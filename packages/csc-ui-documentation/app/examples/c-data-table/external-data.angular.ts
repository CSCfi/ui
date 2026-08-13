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
  CDataTableRow,
  CDataTableSort,
} from '@cscfi/csc-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <!-- With "external", the table renders "data" verbatim and only emits
           state changes; sorting and paging here go through a simulated server
           request. "itemCount" tells the pager the true total. -->
      <c-data-table
        #table
        [columns]="columns"
        [data]="page()"
        [itemCount]="TOTAL"
        [loading]="loading()"
        [page]="query().page"
        [sort]="query().sort"
        external
        page-size="5"
      ></c-data-table>
    </div>
  `,
})
export class ExternalDataExampleComponent implements AfterViewInit {
  table = viewChild.required<ElementRef<CDataTableElement>>('table');

  columns: CDataTableColumn[] = [
    { header: 'Job', key: 'name', sortable: true },
    { align: 'end', header: 'Runtime (h)', key: 'runtime', sortable: true },
    { header: 'State', key: 'state' },
  ];

  // ---- a pretend server ------------------------------------------------
  TOTAL = 57;

  allRows = Array.from({ length: this.TOTAL }, (_, i) => ({
    name: `job-${String(i + 1).padStart(3, '0')}`,
    runtime: ((i * 13) % 96) + 1,
    state: i % 4 ? 'completed' : 'running',
  }));

  fetchPage = (q: {
    page: number;
    pageSize: number;
    sort: CDataTableSort | null;
  }): Promise<CDataTableRow[]> =>
    new Promise((resolve) => {
      const sorted = [...this.allRows].sort((a, b) => {
        if (!q.sort) return 0;

        const { column, direction } = q.sort;

        const va = a[column as keyof typeof a];

        const vb = b[column as keyof typeof b];

        return (
          (va < vb ? -1 : va > vb ? 1 : 0) * (direction === 'asc' ? 1 : -1)
        );
      });

      const start = (q.page - 1) * q.pageSize;

      setTimeout(() => resolve(sorted.slice(start, start + q.pageSize)), 600);
    });
  // -----------------------------------------------------------------------

  query = signal<{
    page: number;
    pageSize: number;
    sort: CDataTableSort | null;
  }>({
    page: 1,
    pageSize: 5,
    sort: { column: 'name', direction: 'asc' },
  });

  page = signal<CDataTableRow[]>([]);

  loading = signal(false);

  async load() {
    this.loading.set(true);
    this.page.set(await this.fetchPage(this.query()));
    this.loading.set(false);
  }

  // Colon-named events ("change:sort") cannot be bound in an Angular
  // template, so listen on the element directly.
  ngAfterViewInit() {
    const table = this.table().nativeElement;

    table.addEventListener('change:sort', (event) => {
      this.query.update((q) => ({
        ...q,
        page: 1,
        sort: (event as CustomEvent<CDataTableSort | null>).detail,
      }));
      this.load();
    });

    table.addEventListener('change:page', (event) => {
      this.query.update((q) => ({
        ...q,
        page: (event as CustomEvent<number>).detail,
      }));
      this.load();
    });

    table.addEventListener('change:page-size', (event) => {
      this.query.update((q) => ({
        ...q,
        pageSize: (event as CustomEvent<number>).detail,
      }));
      this.load();
    });

    this.load();
  }
}
