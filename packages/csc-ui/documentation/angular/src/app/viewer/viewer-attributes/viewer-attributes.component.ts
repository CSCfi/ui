import { Component, Input, OnInit } from '@angular/core';
import { ComponentData } from 'src/interfaces/documentation';

@Component({
  selector: 'app-viewer-attributes',
  templateUrl: './viewer-attributes.component.html',
  styleUrls: ['./viewer-attributes.component.scss'],
})
export class ViewerAttributesComponent implements OnInit {
  @Input('data') rawData: ComponentData;
  data: ComponentData;

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
}
