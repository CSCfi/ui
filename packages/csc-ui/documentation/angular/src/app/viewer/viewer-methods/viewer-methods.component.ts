import { Component, Input, OnInit } from '@angular/core';
import { ComponentData } from 'src/interfaces/documentation';

@Component({
  selector: 'app-viewer-methods',
  templateUrl: './viewer-methods.component.html',
  styleUrls: ['./viewer-methods.component.scss'],
})
export class ViewerMethodsComponent implements OnInit {
  @Input() data: ComponentData;

  constructor() {}

  ngOnInit(): void {}
}
