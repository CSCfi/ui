import { Component, h, Prop } from '@stencil/core';

/**
 * Generic flex row component
 *
 * @group Layout
 * @slot - Should contain items to be displayed in the row
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
  @Prop() gap: number = 0;
  /**
   * Flex wrap
   */
  @Prop() wrap: boolean = true;
  /**
   * Align items vertically
   */
  @Prop() align: 'start' | 'center' | 'end' = 'start';
  /**
   * Justify content horizontally
   */
  @Prop() justify: 'start' | 'center' | 'end' | 'space-between' = 'start';

  render() {
    const classes = {
      'c-row': true,
      wrap: this.wrap,
      'no-wrap': !this.wrap,
      [`align-${this.align}`]: true,
      [`justify-${this.justify}`]: true,
    };
    return (
      <div class={classes} style={{ '--row-gap': `${this.gap}px` }}>
        <slot></slot>
      </div>
    );
  }
}
