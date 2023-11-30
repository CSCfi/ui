import { Component, Element, Host, Prop, h } from '@stencil/core';

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

  get cells() {
    return Array.from(
      this._tableElement.querySelectorAll('td'),
    ) as HTMLTableCellElement[];
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
    }

    this.cells.forEach((cell, index) => {
      cell.dataset.title = this.headers[+index % this.headers.length];
    });
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
