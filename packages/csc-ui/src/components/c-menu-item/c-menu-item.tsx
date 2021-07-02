import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-menu-item',
  styleUrl: 'c-menu-item.css',
  shadow: true,
})
export class CMenuItem {
  @Prop() active: boolean = false;
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
