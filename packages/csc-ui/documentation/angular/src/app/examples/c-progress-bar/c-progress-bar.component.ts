import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-progress-bar',
  templateUrl: './c-progress-bar.component.html',
  styleUrls: ['./c-progress-bar.component.scss'],
})
export class CProgressBarComponent implements OnInit, OnDestroy {
  progress = 0;
  interval = null;
  examples = [
    `
<c-progress-bar value="50"></c-progress-bar>
<c-progress-bar [value]="progress"></c-progress-bar>
  `,
  ];

  scripts = [
    `
progress = 0;
interval = null;

ngOnInit() {
  this.interval = setInterval(() => {
    this.progress = Math.ceil(Math.random() * 100);
  }, 2000);
}

ngOnDestroy() {
  clearInterval(this.interval);
}
  `,
  ];

  ngOnInit() {
    this.interval = setInterval(() => {
      this.progress = Math.ceil(Math.random() * 100);
    }, 2000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
}
