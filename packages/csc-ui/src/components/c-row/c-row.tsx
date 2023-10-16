import { Component, h, Host, Prop } from '@stencil/core';

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
  @Prop() align: 'start' | 'center' | 'end';

  /**
   * Justify content horizontally
   */
  @Prop() justify:
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-around';

  render() {
    const classes = {
      'c-row': true,
      'c-row--nowrap': this.nowrap,
      [`c-row--align-${this.align}`]: !!this.align,
      [`c-row--justify-${this.justify}`]: !!this.justify,
    };

    return (
      <Host class={classes} style={{ '--_c-row-gap': `${this.gap}px` }}>
        <slot></slot>
      </Host>
    );
  }
}
