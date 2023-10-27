import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-row',
  templateUrl: './c-row.component.html',
  styleUrls: ['./c-row.component.scss'],
})
export class CRowComponent implements OnInit {
  // @example-start|justify
  justifyItems = [
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' },
    { label: 'Center', value: 'center' },
    { label: 'Space between', value: 'space-between' },
    { label: 'Space around', value: 'space-around' },
  ];

  selectedJustify = this.justifyItems[0];
  // @example-end

  // @example-start|align
  alignItems = [
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' },
    { label: 'Center', value: 'center' },
  ];

  selectedAlign = this.alignItems[0];
  // @example-end

  constructor() {}

  ngOnInit(): void {}
}
