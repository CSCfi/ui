import { Component, Input, OnInit } from '@angular/core';
import { ComponentData } from 'src/interfaces/documentation';
import typeDefinitions from '../../examples/example-data/types.js';

@Component({
  selector: 'app-viewer-methods',
  templateUrl: './viewer-methods.component.html',
  styleUrls: ['./viewer-methods.component.scss'],
})
export class ViewerMethodsComponent implements OnInit {
  @Input() data: ComponentData;

  constructor() {}

  ngOnInit(): void {}

  hasType(signature) {
    return Object.keys(typeDefinitions).some((t) => signature.includes(t));
  }

  formatName(type) {
    return type.split('.')[0].replace('[]', '');
  }

  getParts(signature) {
    return signature.split(/(C[A-Z][a-zA-Z]*)/).map((part) => ({
      value: part,
      fragment: this.formatName(part),
      type: !!part.match(/^C([A-Z][a-zA-Z]*)/g),
    }));
  }
}
