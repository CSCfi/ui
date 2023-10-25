import { Component, Element, h, Host, Prop } from '@stencil/core';

export type CRowAlign = 'start' | 'center' | 'end';

export type CRowJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around';

/**
 * Generic flex row component
 *
 * @group Layout
 * @slot Default slot - Should contain items to be displayed in the row
 */
@Component({
  tag: 'c-row',
  styleUrl: 'c-row.scss',
  shadow: true,
})
export class CRow {
  @Element() el: HTMLCRowElement;

  /**
   * Gap between items in px
   */
  @Prop() gap = 0;

  /**
   * Disable flex wrap
   */
  @Prop() nowrap = false;

  /**
   * Align items vertically
   */
  @Prop() align: CRowAlign;

  /**
   * Justify content horizontally
   */
  @Prop() justify: CRowJustify;

  componentDidLoad() {
    this.el.style.setProperty('--_c-row-gap', this.el.dataset.gap);
  }

  render() {
    const classes = {
      'c-row': true,
      'c-row--nowrap': this.nowrap,
      [`c-row--align-${this.align}`]: !!this.align,
      [`c-row--justify-${this.justify}`]: !!this.justify,
    };

    return (
      <Host data-gap={`${this.gap}px`} class={classes}>
        <slot></slot>
      </Host>
    );
  }
}
