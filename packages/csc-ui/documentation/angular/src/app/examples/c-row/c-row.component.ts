import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-row',
  templateUrl: './c-row.component.html',
  styleUrls: ['./c-row.component.scss'],
})
export class CRowComponent implements OnInit {
  justifyItems = [
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' },
    { label: 'Center', value: 'center' },
    { label: 'Space between', value: 'space-between' },
    { label: 'Space around', value: 'space-around' },
  ];

  alignItems = [
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' },
    { label: 'Center', value: 'center' },
  ];

  selectedJustify = this.justifyItems[0];
  selectedAlign = this.alignItems[0];

  justifyRaw = `<c-radio-group cControl [items]="items" [(ngModel)]="selectedJustify"></c-radio-group>

<c-row gap="8" [justify]="selectedJustify.value">
  <c-button>Button</c-button>
  <c-button>Button</c-button>
</c-row>`;

  justifyScript = `items = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Center', value: 'center' },
  { label: 'Space between', value: 'space-between' },
  { label: 'Space around', value: 'space-around' },
];

selectedJustify = this.items[0];`;

  alignRaw = `<c-radio-group cControl [items]="alignItems" [(ngModel)]="selectedAlign"></c-radio-group>

<c-row gap="8" [align]="selectedAlign.value">
  <c-button size="small">Button</c-button>
  <c-button>Button</c-button>
  <c-button size="large">Button</c-button>
</c-row>`;

  alignScript = `items = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Center', value: 'center' },
];

selectedJustify = this.items[0];`;

  constructor() {}

  ngOnInit(): void {}
}
