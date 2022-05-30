import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-loader',
  templateUrl: './c-loader.component.html',
  styleUrls: ['./c-loader.component.scss'],
})
export class CLoaderComponent implements OnInit {
  // @example-start|basic|delayed
  loader = false;

  startLoader() {
    this.loader = true;

    setTimeout(() => {
      this.loader = false;
    }, 5000);
  }
  // @example-end

  constructor() {}

  ngOnInit(): void {}
}
