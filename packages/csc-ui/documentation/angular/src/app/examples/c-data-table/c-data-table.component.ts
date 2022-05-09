import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { mdiDelete, mdiHeartPlus } from '@mdi/js';
import mockUsers from './mock-users';
import {
  CPaginationOptions,
  CDataTableFooterOptions,
  CDataTableHeader,
  CDataTableData,
} from '../../../../../../dist/types/types';

@Component({
  selector: 'app-c-data-table',
  templateUrl: './c-data-table.component.html',
  styleUrls: ['./c-data-table.component.scss'],
})
export class CDataTableComponent implements OnInit {
  loading = false;

  headers: CDataTableHeader[] = [
    {
      key: 'id',
      value: 'Id',
      component: {
        tag: 'c-tag',
        params: {
          outlined: true,
          onClick: ({ data }) =>
            console.log(`Row with an id of ${data?.['id']?.value} was clicked`),
        },
      },
    },
    { key: 'firstName', value: 'First name' },
    { key: 'lastName', value: 'Last name' },
    {
      key: 'progress',
      value: 'Progress',
      width: '128px',
      component: {
        tag: 'c-progress-bar',
        injectValue: true,
        params: {
          style: {
            width: '100%',
          },
          hideDetails: true,
        },
      },
    },
    { key: 'email', value: 'Email' },
    { key: 'city', value: 'City' },
    {
      key: 'actions',
      value: null,
      sortable: false,
      children: [
        {
          value: null,
          component: {
            tag: 'c-icon-button',
            params: {
              ghost: true,
              path: mdiDelete,
              size: 'small',
              title: 'Remove user',
              onClick: ({ data }) => this.onDelete(data['id'].value),
            },
          },
        },
        {
          value: null,
          component: {
            tag: 'c-icon-button',
            params: {
              ghost: true,
              path: mdiHeartPlus,
              title: 'Add to favourites',
              size: 'small',
              onClick: ({ data }) =>
                console.log(
                  `${data['firstName'].value} ${data['lastName'].value} added to favourites`,
                ),
            },
          },
        },
      ],
    },
  ];

  data: CDataTableData[] = [];

  externalHeaders: CDataTableHeader[] = [
    { key: 'name', value: 'Author' },
    { key: 'work_count', value: 'Works' },
    { key: 'top_work', value: 'Top work' },
    { key: 'top_subjects', value: 'Subjects', sortable: false },
  ];

  externalData = [];

  pagedData = [];

  selections: number[] = [];

  options: CPaginationOptions = {
    itemCount: mockUsers.length,
    itemsPerPage: 10,
    currentPage: 1,
    startFrom: 0,
    endTo: 9,
  };

  externalOptions: CPaginationOptions = {
    itemCount: this.externalData.length,
    itemsPerPage: 10,
    currentPage: 1,
    startFrom: 0,
    endTo: 9,
  };

  footerOptions: CDataTableFooterOptions = {
    itemsPerPageOptions: [5, 10, 15, 20],
  };

  sortBy = 'id';

  direction = 'asc';

  externalSortBy = 'name';

  externalDirection = 'asc';

  constructor(private _ngZone: NgZone, private _http: HttpClient) {}

  ngOnInit(): void {
    this.data = [...mockUsers];
    this.getData();
  }

  onSelection(event) {
    this.selections = event.detail;
  }

  onDelete(id) {
    this._ngZone.run(() => {
      this.data = this.data.filter((row) => row['id'].value !== id);
    });
  }

  sortData() {
    this.pagedData = this.externalData.sort((a, b) => {
      const valueA = a[this.externalSortBy].value;
      const valueB = b[this.externalSortBy].value;

      if (typeof valueA === 'string') {
        if (this.externalDirection === 'asc') {
          return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
        }

        return valueB.toLowerCase().localeCompare(valueA.toLowerCase());
      }

      if (typeof valueA === 'number') {
        if (this.externalDirection === 'asc') {
          return valueA - valueB;
        }

        return valueB - valueA;
      }
    });

    this.loading = false;
  }

  onPagination(event) {
    this.externalOptions = {
      ...this.externalOptions,
      ...event.detail,
    };

    this.getData();
  }

  onSort(event) {
    const { sortBy, direction } = event.detail;

    this.externalSortBy = sortBy;
    this.externalDirection = direction;

    this.getData();
  }

  getData() {
    if (this.loading) return;

    this.loading = true;

    const offset =
      this.externalOptions.currentPage * this.externalOptions.itemsPerPage -
      this.externalOptions.itemsPerPage;
    const limit = this.externalOptions.itemsPerPage;

    this._http
      .get(`https://openlibrary.org/search/authors.json?q=alvar&limit=${limit}&offset=${offset}`)
      .subscribe((data: any) => {
        this.externalData = (data.docs as any[]).reduce((items, item) => {
          items.push({
            name: {
              value: item.name,
            },
            work_count: {
              value: item.work_count,
            },
            top_work: {
              value: item.top_work,
            },
            top_subjects: {
              value: null,
              children: [
                ...(item.top_subjects || []).slice(0, 5).map((subject, index) => ({
                  key: `top_subject_${index}`,
                  value: subject,
                  component: {
                    tag: 'c-tag',
                    params: {
                      flat: true,
                    },
                  },
                })),
                ...(!item.top_subjects?.length ? [{ key: 'no_subjects', value: '-' }] : []),
              ],
            },
          });

          return items;
        }, []);

        // Update the item count
        this.externalOptions = {
          ...this.externalOptions,
          itemCount: data.numFound,
        };

        this.sortData();
      });
  }

  basicData = [
    {
      country: { value: 'Denmark' },
      population: { value: 5831404 },
      unemployment: { value: 4.8 },
    },
    {
      country: { value: 'Finland' },
      population: { value: 5529543 },
      unemployment: { value: 7.5 },
    },
    {
      country: { value: 'Iceland' },
      population: { value: 366463 },
      unemployment: { value: 5.4 },
    },
    {
      country: { value: 'Norway' },
      population: { value: 5379475 },
      unemployment: { value: 5.0 },
    },
    {
      country: { value: 'Sweden' },
      population: { value: 10353442 },
      unemployment: { value: 8.7 },
    },
  ];

  basicHeaders = [
    {
      key: 'country',
      value: 'Country',
    },
    {
      key: 'population',
      value: 'Population (2020)',
    },
    {
      key: 'unemployment',
      value: 'Unemployment (%)',
    },
  ];

  templates = {
    basic: `<c-data-table [data]="data" [headers]="headers"></c-data-table>`,
    complex: `<c-data-table
  id="complex"
  [data]="data"
  [headers]="headers"
  [footerOptions]="footerOptions"
  [pagination]="paginationOptions"
  [sortBy]="sortBy"
  [sortDirection]="direction"
  selection-property="id"
  selectable
  (selection)="onSelection($event)"
></c-data-table>

<div class="mt-4">Currently selected ids:
  <span class="text-primary">Currently selected ids:</span>
  {{ selections.join(', ') || 'none' }}
</div>`,
    external: `<c-data-table
  [data]="data"
  [headers]="headers"
  [loading]="loading"
  [pagination]="options"
  [sortBy]="sortBy"
  [sortDirection]="direction"
  external-data
  hoverable
  (paginate)="onPagination($event)"
  (sort)="onSort($event)"
></c-data-table>`,
  };

  scripts = {
    basic: `headers = [
  {
    key: 'country',
    value: 'Country',
  },
  {
    key: 'population',
    value: 'Population (2020)',
  },
  {
    key: 'unemployment',
    value: 'Unemployment (%)',
  },
];

data = [
  {
    country: { value: 'Denmark' },
    population: { value: 5831404 },
    unemployment: { value: 4.8 },
  },
  {
    country: { value: 'Finland' },
    population: { value: 5529543 },
    unemployment: { value: 7.5 },
  },
  {
    country: { value: 'Iceland' },
    population: { value: 366463 },
    unemployment: { value: 5.4 },
  },
  {
    country: { value: 'Norway' },
    population: { value: 5379475 },
    unemployment: { value: 5.0 },
  },
  {
    country: { value: 'Sweden' },
    population: { value: 10353442 },
    unemployment: { value: 8.7 },
  },
];`,
    complex: `import { NgZone } from '@angular/core';
import { mdiDelete, mdiHeartPlus } from '@mdi/js';
import {
  CPaginationOptions,
  CDataTableFooterOptions,
  CDataTableHeader,
  CDataTableData,
} from 'csc-ui';

data: CDataTableData[] = [
  {
    city: {
      value: 'Petaling Jaya',
    },
    email: {
      value: 'ywhitehorn0@google.ca',
      children: [
        {
          value: 'Send email',
          component: {
            tag: 'c-button',
            params: {
              ghost: true,
              size: 'small',
              onClick: (options: CDataTableFunctionParams) =>
                console.log('Sending email to', options.value),
            },
          },
        },
      ],
    },
    firstName: {
      value: 'Yovonnda',
    },
    id: {
      value: 1,
    },
    lastName: {
      value: 'Whitehorn',
    },
    progress: {
      value: 68,
    }
  },
  {
    city: {
      value: 'Sitovo',
    },
    email: {
      value: 'gmccrillis1@state.gov',
    },
    firstName: {
      value: 'Gerry',
    },
    id: {
      value: 2,
    },
    lastName: {
      value: 'McCrillis',
    },
    progress: {
      value: 98,
    }
  },
  ...
};

headers: CDataTableHeader[] = [
    {
      key: 'id',
      value: 'Id',
      component: {
        tag: 'c-tag',
        params: {
          outlined: true,
          onClick: ({ data }) =>
            console.log(\`Row with an id of \${data?.['id']?.value} was clicked\`),
        },
      },
    },
    { key: 'firstName', value: 'First name' },
    { key: 'lastName', value: 'Last name' },
    {
      key: 'progress',
      value: 'Progress',
      width: '128px',
      component: {
        tag: 'c-progress-bar',
        injectValue: true,
        params: {
          style: {
            width: '100%',
          },
          hideDetails: true,
        },
      },
    },
    { key: 'email', value: 'Email' },
    { key: 'city', value: 'City' },
    {
      key: 'actions',
      value: null,
      sortable: false,
      children: [
        {
          value: null,
          component: {
            tag: 'c-icon-button',
            params: {
              ghost: true,
              path: mdiDelete,
              size: 'small',
              title: 'Remove user',
              onClick: ({ data }) => this.onDelete(data['id'].value),
            },
          },
        },
        {
          value: null,
          component: {
            tag: 'c-icon-button',
            params: {
              ghost: true,
              path: mdiHeartPlus,
              title: 'Add to favourites',
              size: 'small',
              onClick: ({ data }) =>
                console.log(
                  \`\${data['firstName'].value} \${data['lastName'].value} added to favourites\`,
                ),
            },
          },
        },
      ],
    },
  ];

  footerOptions: CDataTableFooterOptions = {
    itemsPerPageOptions: [5, 10, 15, 20],
  };

  paginationOptions: CPaginationOptions = {
    itemCount: this.data.length,
    itemsPerPage: 10,
    currentPage: 1,
    startFrom: 0,
    endTo: 9,
  };

  sortBy = 'id';

  direction = 'asc';

  selections: number[] = [];

  constructor(private _ngZone: NgZone) {}

  onDelete(id) {
    // NgZone needed for reactivity in Angular
    this._ngZone.run(() => {
      this.data = this.data.filter((row) => row['id'].value !== id);
    });
  }

  onSelection(event) {
    this.selections = event.detail;
  }
`,
    external: `import {
  CPaginationOptions,
  CDataTableHeader,
  CDataTableData,
} from 'csc-ui';

headers: CDataTableHeader[] = [
  { key: 'name', value: 'Author' },
  { key: 'work_count', value: 'Works' },
  { key: 'top_work', value: 'Top work' },
  { key: 'top_subjects', value: 'Subjects', sortable: false },
];

data: CDataTableData[] = [];

options: CPaginationOptions = {
  itemCount: this.data.length,
  itemsPerPage: 10,
  currentPage: 1,
  startFrom: 0,
  endTo: 9,
};

sortBy = 'name';

direction = 'asc';

gOnInit(): void {
  this.getData();
}

getData() {
  if (this.loading) return;

  this.loading = true;

  const offset =
    this.options.currentPage * this.options.itemsPerPage -
    this.options.itemsPerPage;
  const limit = this.options.itemsPerPage;

  this._http
    .get(\`https://openlibrary.org/search/authors.json?q=alvar&limit=\${limit}&offset=\${offset}\`)
    .subscribe((data: any) => {
      this.data = (data.docs as any[]).reduce((items, item) => {
        items.push({
          name: {
            value: item.name,
          },
          work_count: {
            value: item.work_count,
          },
          top_work: {
            value: item.top_work,
          },
          top_subjects: {
            value: null,
            children: [
              ...(item.top_subjects || []).slice(0, 5).map((subject, index) => ({
                key: \`top_subject_\${index}\`,
                value: subject,
                component: {
                  tag: 'c-tag',
                  params: {
                    flat: true,
                  },
                },
              })),
              ...(!item.top_subjects?.length ? [{ key: 'no_subjects', value: '-' }] : []),
            ],
          },
        });

        return items;
      }, []);

      // Update the item count
      this.options = {
        ...this.options,
        itemCount: data.numFound,
      };

      this.sortData();
    });
}



onPagination(event) {
  this.options = {
    ...this.options,
    ...event.detail,
  };

  this.getData();
}

onSort(event) {
  const { sortBy, direction } = event.detail;

  this.sortBy = sortBy;
  this.direction = direction;

  this.getData();
}

sortData() {
  this.pagedData = this.data.sort((a, b) => {
    const valueA = a[this.sortBy].value;
    const valueB = b[this.sortBy].value;

    if (typeof valueA === 'string') {
      if (this.direction === 'asc') {
        return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
      }

      return valueB.toLowerCase().localeCompare(valueA.toLowerCase());
    }

    if (typeof valueA === 'number') {
      if (this.direction === 'asc') {
        return valueA - valueB;
      }

      return valueB - valueA;
    }
  });

  this.loading = false;
}
  `,
  };
}
