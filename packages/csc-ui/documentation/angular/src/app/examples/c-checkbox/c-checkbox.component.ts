import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-checkbox',
  templateUrl: './c-checkbox.component.html',
  styleUrls: ['./c-checkbox.component.scss'],
})
export class CCheckboxComponent implements OnInit {
  template = `<c-checkbox cControl [(ngModel)]="value" label="Example checkbox"></c-checkbox>

  <p>Checkbox is {{ value ? 'checked' : 'not checked' }}</p>`;
  value = false;

  constructor() {}

  ngOnInit(): void {}
}
