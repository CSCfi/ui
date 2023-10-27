import { Component, Input, OnInit } from '@angular/core';
import { ComponentData } from 'src/interfaces/documentation';
import typeDefinitions from '../../examples/example-data/types.js';

@Component({
  selector: 'app-viewer-attributes',
  templateUrl: './viewer-attributes.component.html',
  styleUrls: ['./viewer-attributes.component.scss'],
})
export class ViewerAttributesComponent implements OnInit {
  @Input('data') rawData: ComponentData;

  data: ComponentData;

  types = Object.keys(typeDefinitions).map((key) => ({
    type: key,
    value: typeDefinitions[key].trim(),
  }));

  constructor() {}

  ngOnInit(): void {
    const props = this.rawData.props.reduce((props, prop) => {
      const docsTagDefault = prop.docsTags.find((tag) => tag.name === 'default')?.text;
      prop.default = prop.default ?? docsTagDefault ?? '';
      props.push(prop);

      return props;
    }, []);

    this.data = {
      ...this.rawData,
      props,
    };
  }

  hasType(type) {
    return Object.keys(typeDefinitions).some((t) => type.includes(t));
  }

  formatName(type) {
    return type.split('.')[0].replace('[]', '');
  }

  sanitizedTypeNames(type) {
    const allTypes = type.split(' | ').map((p) => ({
      value: p,
      fragment: this.formatName(p),
      type: !!p.match(/^C([A-Z][a-zA-Z]*)/g),
    }));

    return allTypes;
  }
}
