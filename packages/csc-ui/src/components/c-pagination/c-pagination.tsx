import {
  Component,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
  State,
} from '@stencil/core';
import { mdiChevronLeft, mdiChevronRight, mdiDotsHorizontal } from '@mdi/js';

export interface PaginationObject {
  itemCount: number;
  currentPage?: number;
  totalVisible?: number;
  itemsPerPage?: number;
  startFrom?: number;
  endTo?: number;
}
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
  @Prop() value: {
    itemCount: number;
    currentPage?: number;
    totalVisible?: number;
    itemsPerPage?: number;
    startFrom?: number;
    endTo?: number;
  };
  @State() private _currentPage;
  @State() private _itemsPerPage;
  @State() private _totalVisible;
  /**
   * Triggered when values are changed
   */
  @Event() changeValue: EventEmitter<{
    itemCount: number;
    currentPage?: number;
    totalVisible?: number;
    itemsPerPage?: number;
    startFrom?: number;
    endTo?: number;
  }>;
  /**
   * Hide range indicator
   */
  @Prop() hideRange: boolean = false;
  /**
   * Items per page options
   */
  @Prop() itemsPerPageOptions: number[] = [5, 25, 50, 100];
  @State() tick = '';

  componentDidLoad() {
    this._currentPage = this.value.currentPage || 1;
    this._itemsPerPage = this.value.itemsPerPage || 25;
    this._totalVisible = this.value.totalVisible || 7;
    this._setRange();
    this.changeValue.emit(this.value);
  }

  private _setRange() {
    this.value.startFrom =
      this._currentPage * this._itemsPerPage - this._itemsPerPage + 1;
    this.value.endTo = this._currentPage * this._itemsPerPage;
  }

  private _buttons: any = [];

  private _valueChangeHandler() {
    this.value.currentPage = this._currentPage;
    this.value.itemsPerPage = this._itemsPerPage;
    this._setRange();
    this.changeValue.emit(this.value);
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
    const start =
      this._currentPage * this._itemsPerPage - this._itemsPerPage + 1;
    return [
      start,
      '-',
      this._currentPage * this._itemsPerPage,
      'of',
      this.value.itemCount,
      'items',
    ].join(' ');
  }
  private _getArrowLeft() {
    return (
      <c-icon-button size="small" text onClick={this._decreasePageNumber}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d={mdiChevronLeft} />
        </svg>
      </c-icon-button>
    );
  }

  private _getArrowRight() {
    return (
      <c-icon-button size="small" text onClick={this._increasePageNumber}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d={mdiChevronRight} />
        </svg>
      </c-icon-button>
    );
  }

  private _button(number) {
    return (
      <c-icon-button
        size="small"
        text={this._currentPage !== number}
        onClick={() => this._setPage(number)}
      >
        <span>{number}</span>
      </c-icon-button>
    );
  }

  private _addButton(number) {
    this._buttons.push(this._button(number));
  }

  private _addSeparator() {
    this._buttons.push(
      <c-icon-button size="small" text disabled>
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d={mdiDotsHorizontal} />
        </svg>
      </c-icon-button>,
    );
  }

  private _addButtons(buttonStart, buttonCount) {
    if (buttonStart > 1) {
      this._addButton(1);
      this._addSeparator();
    }

    for (let index = 1; index < buttonCount; index++) {
      this._addButton(buttonStart + index);
    }

    const allPagesVisible = this._getTotalPages() <= this._totalVisible;

    if (
      (this._currentPage < this._totalVisible - 1 ||
        this._currentPage < this._getTotalPages() - this._totalVisible + 4) &&
      !allPagesVisible
    ) {
      this._addSeparator();
    }
  }

  private _getPageButtons() {
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

    this._addButtons(buttonStart, buttonCount);

    if (morePagesThanVisible) {
      this._buttons.push(this._button(this._getTotalPages()));
    }

    return this._buttons;
  }

  render() {
    return (
      <Host>
        <c-row align="center" justify="space-between" wrap gap={16}>
          <c-row
            align="center"
            justify="center"
            wrap={false}
            style={{ flex: 'auto' }}
          >
            {this._getItemsPerPage()}
            <c-spacer></c-spacer>
            <span class="range">{this._getRange()}</span>
          </c-row>
          {/* <c-spacer></c-spacer> */}
          <c-row
            align="center"
            justify="center"
            wrap={false}
            style={{ flex: '1' }}
          >
            {this._getArrowLeft()}
            {this._getPageButtons()}
            {this._getArrowRight()}
          </c-row>
        </c-row>
      </Host>
    );
  }
}
