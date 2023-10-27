import { Component, Input, OnInit } from '@angular/core';
import { ComponentData } from 'src/interfaces/documentation';

@Component({
  selector: 'app-viewer-slots',
  templateUrl: './viewer-slots.component.html',
})
export class ViewerSlotsComponent implements OnInit {
  @Input() data: ComponentData;

  constructor() {}

  ngOnInit(): void {}
}
