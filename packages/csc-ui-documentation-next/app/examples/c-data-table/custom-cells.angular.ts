// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { type CDataTableColumn, h } from '@cscfi/csc-ui-next';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-data-table [columns]="columns" [data]="data"></c-data-table>

      <p>{{ message() }}</p>
    </div>
  `,
})
export class CustomCellsExampleComponent {
  message = signal('Open a project with the button in the last column');

  data = [
    { name: 'Aurora', status: 'active', usage: 0.72 },
    { name: 'Borealis', status: 'closed', usage: 0.13 },
    { name: 'Cirrus', status: 'pending', usage: 0.44 },
  ];

  // Cell renderers are plain functions returning VNodes built with the `h`
  // re-exported from @cscfi/csc-ui-next — no direct vue dependency needed.
  columns: CDataTableColumn[] = [
    { header: 'Project', key: 'name' },
    {
      cell: ({ value }) =>
        h('c-tag', { active: value === 'active' }, String(value)),
      header: 'Status',
      key: 'status',
    },
    {
      cell: ({ value }) =>
        h('c-progress-bar', {
          style: 'width: 160px',
          value: Math.round((value as number) * 100),
        }),
      header: 'Usage',
      key: 'usage',
    },
    {
      align: 'end',
      cell: ({ row }) =>
        h(
          'c-button',
          {
            onClick: () => {
              this.message.set(`Opening project ${row.name}…`);
            },
            size: 'small',
            text: true,
          },
          'Open',
        ),
      header: '',
      key: 'actions',
    },
  ];
}
