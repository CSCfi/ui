import {
  ChangeDetectorRef,
  AfterViewInit,
  AfterContentChecked,
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { formatScript, formatTemplate } from 'src/app/utils/utils';
import docs from '../../../../../../docs.json';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent implements AfterViewInit, AfterContentChecked {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() cols: string;
  @Input() rows: string;
  @Input() raw: string;
  @Input() script: string;
  @ViewChild('example') example;
  code = '';
  scriptCode = '';
  allowedAttributes = [];
  showCode = false;

  constructor(private cdref: ChangeDetectorRef) {
    const attrs = docs.components?.reduce(
      (items, component) => {
        items.push(...component.props.map((prop) => prop.attr || prop.name));

        return items;
      },
      ['class', 'style', 'slot'],
    );
    this.allowedAttributes = [...new Set(attrs)];
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  ngAfterViewInit(): void {
    this.code = this.raw
      ? formatTemplate(this.raw, false)
      : formatTemplate(this.example.nativeElement.innerHTML);

    this.scriptCode = formatScript(this.script);
  }
}
