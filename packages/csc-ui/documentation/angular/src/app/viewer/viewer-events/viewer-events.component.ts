import { Component, Input, OnInit } from '@angular/core';
import { ComponentData } from 'src/interfaces/documentation';

@Component({
  selector: 'app-viewer-events',
  templateUrl: './viewer-events.component.html',
  styleUrls: ['./viewer-events.component.scss'],
})
export class ViewerEventsComponent implements OnInit {
  @Input() data: ComponentData;

  constructor() {}

  ngOnInit(): void {}
}
