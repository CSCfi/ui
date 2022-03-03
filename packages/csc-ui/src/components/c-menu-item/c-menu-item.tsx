import { Component, Host, h, Prop } from '@stencil/core';
/**
 * @parent none
 */

@Component({
  tag: 'c-menu-item',
  styleUrl: 'c-menu-item.scss',
  shadow: true,
})
export class CMenuItem {
  /**
   * Is the item the active selection
   */
  @Prop() active: boolean = false;
  /**
   * Small variant
   */
  @Prop() small: boolean = false;

  render() {
    let classes = this.active ? 'active' : '';
    if (this.small) {
      classes = `${classes} small`;
    }
    return (
      <Host class={classes}>
        <slot></slot>
      </Host>
    );
  }
}
