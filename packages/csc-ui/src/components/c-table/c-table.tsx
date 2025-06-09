import { Component, Element, Host, Method, Prop, h } from '@stencil/core';

/**
 * @group tables
 */
@Component({
  tag: 'c-table',
  styleUrl: 'c-table.scss',
  shadow: false,
})
export class CTable {
  @Element() el: HTMLCTableElement;

  /**
   * Mobile breakpoint in pixels
   */
  @Prop() mobileBreakpoint = 600;

  /**
   * Should the table be responsive
   */
  @Prop() responsive = false;

  private _tableElement: HTMLTableElement;

  private _observer: ResizeObserver;

  /**
   * Update mobile labels after content change when using responsive table
   */
  @Method()
  async updateMobileLabels() {
    this._createMobileLabels();
  }

  get cells() {
    return Array.from(
      this._tableElement.querySelectorAll('td'),
    ) as HTMLTableCellElement[];
  }

  get rows() {
    return (
      Array.from(
        this._tableElement.querySelectorAll('tr'),
      ) as HTMLTableRowElement[]
    ).filter((row) => !row.hasAttribute('no-mobile-labels'));
  }

  get headers() {
    return (
      Array.from(
        this._tableElement.querySelectorAll('th'),
      ) as HTMLTableCellElement[]
    ).map((th) => th.innerHTML);
  }

  private _handleResize(width: number) {
    const isMobile = width <= this.mobileBreakpoint;

    this._tableElement.classList.toggle('c-table--mobile', isMobile);
  }

  private _createMobileLabels = () => {
    this.rows.forEach((row) => {
      const cells = Array.from(
        row.querySelectorAll('td'),
      ) as HTMLTableCellElement[];

      let cellIndex = 0;

      cells.forEach((cell) => {
        const mobileLabel = cell.querySelector('.c-table__mobile-label');

        if (mobileLabel) return;

        const span = document.createElement('span');
        span.classList.add('c-table__mobile-label');

        const heading = this.headers[+cellIndex % this.headers.length];

        if (!heading) return;

        // Take into account colspan
        cellIndex += cell.colSpan ?? 1;

        span.innerHTML = heading;

        cell.prepend(span);
      });
    });
  };

  componentWillLoad() {
    this._tableElement = this.el.querySelector('table');
    this._tableElement.classList.add('c-table');

    this._observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;

      this._handleResize(width);
    });
  }

  componentDidLoad() {
    if (this.responsive) {
      this._observer.observe(this._tableElement);

      this._createMobileLabels();
    }
  }

  disconnectedCallback() {
    this._observer.disconnect();
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
