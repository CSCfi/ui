import { Component, OnInit } from '@angular/core';
import { mdiHome, mdiChartBar } from '@mdi/js';

@Component({
  selector: 'app-c-icon',
  templateUrl: './c-icon.component.html',
  styleUrls: ['./c-icon.component.scss'],
})
export class CIconComponent implements OnInit {
  /*
  // @example-start|basic
import { mdiHome, mdiChartBar } from '@mdi/js';
  // @example-end
  */

  // @example-start|basic
  public icons = {
    mdiHome,
    mdiChartBar,
  };
  // @example-end

  constructor() {}

  ngOnInit(): void {}
}
