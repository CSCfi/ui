import { ChangeDetectorRef, Component } from '@angular/core';
import { CPaginationOptions } from '../../../../../../src/types';
import countries from '../countries.json';

@Component({
  selector: 'app-c-pagination',
  templateUrl: './c-pagination.component.html',
  styleUrls: ['./c-pagination.component.scss'],
})
export class CPaginationComponent {
  /*
  // @example-start|basic|simple|programmatical
  import { CPaginationOptions } from 'csc-ui';
  // @example-end
  */

  // @example-start|basic|simple|programmatical
  countries = Object.values(countries).sort();
  // @example-end

  // @example-start|basic
  options: CPaginationOptions = {
    itemCount: this.countries.length,
    itemsPerPage: 25,
    currentPage: 1,
    startFrom: 0,
    endTo: 24,
  };
  // @example-end

  // @example-start|simple
  optionsSimple: CPaginationOptions = {
    itemCount: this.countries.length,
    itemsPerPage: 25,
    currentPage: 1,
    startFrom: 0,
    endTo: 24,
  };
  // @example-end

  // @example-start|programmatical
  options2: CPaginationOptions = {
    itemCount: this.countries.length,
    itemsPerPage: 25,
    currentPage: 1,
    startFrom: 0,
    endTo: 24,
  };
  // @example-end

  // @example-start|programmatical
  constructor(private _changeDetectorRef: ChangeDetectorRef) {}

  /**
   * Slice pipe requires manual update after pagination change
   */
  updateView() {
    this._changeDetectorRef.detectChanges();
  }

  setPageToTwo() {
    // Options object needs to be fully replaced in order to trigger pagination change programmatically
    this.options2 = { ...this.options2, currentPage: 2 };
  }

  showFiftyItemsPerPage() {
    // Options object needs to be fully replaced in order to trigger pagination change programmatically
    this.options2 = {
      ...this.options2,
      itemsPerPage: 50,
    };
  }
  // @example-end
}
