import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-loader',
  templateUrl: './c-loader.component.html',
  styleUrls: ['./c-loader.component.scss'],
})
export class CLoaderComponent implements OnInit {
  templates = [
    `<c-card>
  <c-loader *ngIf="loading"></c-loader>
  <c-card-title>Loader card</c-card-title>
  <c-card-content>Click start to show a loader for 5 seconds</c-card-content>
  <c-card-actions>
    <c-button (click)="start()">Start</c-button>
  </c-card-actions>
</c-card>`,
    `<c-card>
  <c-loader *ngIf="loading" contentdelay="2">This loader will disappear soon</c-loader>
  <c-card-title>Loader card</c-card-title>
  <c-card-content>Click start to show a loader with a delayed explanation text</c-card-content>
  <c-card-actions>
    <c-button (click)="start()">Start</c-button>
  </c-card-actions>
</c-card>`,
  ];
  script = `start() {
  this.loading = true;
  setTimeout(() => {
    this.loading = false;
  }, 5000);
}`;
  loaders = [false, false];

  start(index) {
    this.loaders[index] = true;

    setTimeout(() => {
      this.loaders[index] = false;
    }, 5000);
  }

  constructor() {}

  ngOnInit(): void {}
}
