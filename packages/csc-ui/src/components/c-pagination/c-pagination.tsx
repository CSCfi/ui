import {
  Component,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
  State,
  Watch,
} from '@stencil/core';
import { mdiChevronLeft, mdiChevronRight, mdiDotsHorizontal } from '@mdi/js';
import { CPaginationOptions } from '../../types';

/**
 * @group Content Selectors
 */

@Component({
  tag: 'c-pagination',
  styleUrl: 'c-pagination.scss',
  shadow: true,
})
export class CPagination {
  /**
   * Object containing values that are needed for pagination.
   *
   * Note! startFrom and endTo are assigned automatically to the object based on other values
   */
  @Prop() value: CPaginationOptions;

  /**
   * Hide details (per page dropdown and the 'x - y of n pages' text)
   */
  @Prop() hideDetails = false;

  /**
   * Hide page number buttons
   */
  @Prop() simple = false;

  /**
   * Hide details (per page dropdown and the 'x - y of n pages' text)
   */
  @Prop() size: 'default' | 'small' = 'default';

  @State() private _currentPage;
  @State() private _itemsPerPage;
  @State() private _totalVisible;
  /**
   * Triggered when values are changed
   */
  @Event() changeValue: EventEmitter<CPaginationOptions>;
  /**
   * Hide range indicator
   */
  @Prop() hideRange: boolean = false;
  /**
   * Items per page options
   */
  @Prop() itemsPerPageOptions: number[] = [5, 25, 50, 100];

  @State() tick = '';

  @Watch('value')
  valueHandler(value: CPaginationOptions, oldValue: CPaginationOptions) {
    if (this._isEqual(value, oldValue)) return;

    this._setRange();
  }

  private _isEqual(options1: CPaginationOptions, options2: CPaginationOptions) {
    const keys1 = Object.keys(options1 || {});
    const keys2 = Object.keys(options2 || {});

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (options1[key] !== options2[key]) {
        return false;
      }
    }

    return true;
  }

  componentDidLoad() {
    this._setRange();
  }

  private _setRange() {
    this._currentPage = this.value.currentPage || 1;
    this._itemsPerPage = this.value.itemsPerPage || 25;
    this._totalVisible = this.value.totalVisible || 7;
    this.value.startFrom =
      this._currentPage * this._itemsPerPage - this._itemsPerPage;
    this.value.endTo = this._currentPage * this._itemsPerPage - 1;
    this.changeValue.emit(this.value);
  }

  private _buttons: any = [];

  private _valueChangeHandler() {
    this.value.currentPage = this._currentPage;
    this.value.itemsPerPage = this._itemsPerPage;
    this._setRange();
  }

  private _getItemsPerPage() {
    const itemsPerPageOptions = this.itemsPerPageOptions.map((i) => ({
      name: i.toString(),
      action: () => {
        this._itemsPerPage = i;
        this._currentPage = 1;
        this._valueChangeHandler();
      },
    }));

    return (
      <c-menu items={itemsPerPageOptions} nohover>
        <div>
          <span class="items-per-page">{this._itemsPerPage} per page</span>
        </div>
      </c-menu>
    );
  }

  private _getTotalPages() {
    return Math.ceil(this.value.itemCount / this._itemsPerPage);
  }

  private _increasePageNumber = () => {
    if (this._currentPage < this._getTotalPages()) {
      this._currentPage += 1;
      this._valueChangeHandler();
    }
  };

  private _decreasePageNumber = () => {
    if (this._currentPage > 1) {
      this._currentPage -= 1;
      this._valueChangeHandler();
    }
  };

  private _setPage(number) {
    this._currentPage = number;
    this._valueChangeHandler();
  }

  private _getRange() {
    if (this.hideRange) return;

    const end = this._currentPage * this._itemsPerPage;
    const start = end - this._itemsPerPage + 1;

    return `${start} - ${end} of ${this.value.itemCount} items`;
  }

  private _getArrowLeft(size) {
    return (
      <c-icon-button
        disabled={this.value.currentPage <= 1}
        size={size}
        text
        onClick={this._decreasePageNumber}
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d={mdiChevronLeft} />
        </svg>
      </c-icon-button>
    );
  }

  private _getArrowRight(size) {
    return (
      <c-icon-button
        disabled={this.value.currentPage >= this._getTotalPages()}
        size={size}
        text
        onClick={this._increasePageNumber}
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d={mdiChevronRight} />
        </svg>
      </c-icon-button>
    );
  }

  private _button(number, size) {
    return (
      <c-icon-button
        size={size}
        text={this._currentPage !== number}
        onClick={() => this._setPage(number)}
      >
        <span>{number}</span>
      </c-icon-button>
    );
  }

  private _addButton(number, size) {
    this._buttons.push(this._button(number, size));
  }

  private _addSeparator(size) {
    this._buttons.push(
      <c-icon-button size={size} text disabled>
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d={mdiDotsHorizontal} />
        </svg>
      </c-icon-button>,
    );
  }

  private _addButtons(buttonStart, buttonCount, size) {
    if (buttonStart > 1) {
      this._addButton(1, size);
      this._addSeparator(size);
    }

    for (let index = 1; index < buttonCount; index++) {
      this._addButton(buttonStart + index, size);
    }

    const allPagesVisible = this._getTotalPages() <= this._totalVisible;

    if (
      (this._currentPage < this._totalVisible - 1 ||
        this._currentPage < this._getTotalPages() - this._totalVisible + 4) &&
      !allPagesVisible
    ) {
      this._addSeparator(size);
    }
  }

  private _getPageButtons(size) {
    this._buttons = [];
    let buttonStart = 0;
    let buttonCount = this._getTotalPages() + 1;
    const morePagesThanVisible = this._getTotalPages() > this._totalVisible;

    if (morePagesThanVisible) {
      if (this._currentPage < this._totalVisible - 2) {
        buttonCount = this._totalVisible - 1;
      } else if (
        this._currentPage <
        this._getTotalPages() - this._totalVisible + 4
      ) {
        buttonStart = Math.ceil(this._currentPage - this._totalVisible / 2) + 1;
        buttonCount = this._totalVisible - 3;
      } else {
        buttonStart = this._getTotalPages() - this._totalVisible + 2;
        buttonCount = this._totalVisible - 2;
      }
    }

    this._addButtons(buttonStart, buttonCount, size);

    if (morePagesThanVisible) {
      this._buttons.push(this._button(this._getTotalPages(), size));
    }

    return this._buttons;
  }

  render() {
    const classes = {
      'c-pagination': true,
      'c-pagination--small': this.size === 'small',
    };

    const buttonsize = this.size === 'small' ? 'x-small' : 'small';

    return (
      <Host class={classes}>
        <c-row align="center" no-wrap={this.simple} gap={4}>
          {!this.hideDetails && (
            <c-row
              align="center"
              justify="center"
              style={{ flex: 'auto' }}
              nowrap
            >
              {this._getItemsPerPage()}
              <c-spacer></c-spacer>
              <span class={!this.simple && 'range'}>{this._getRange()}</span>
            </c-row>
          )}
          <c-row
            align="center"
            justify={!this.simple ? 'center' : 'end'}
            gap={this.size === 'small' ? 2 : 4}
            style={{ flex: '1' }}
            class="c-pagination__buttons"
            nowrap
          >
            {this._getArrowLeft(buttonsize)}
            {!this.simple && this._getPageButtons(buttonsize)}
            {this._getArrowRight(buttonsize)}
          </c-row>
        </c-row>
      </Host>
    );
  }
}
