import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-menu-item',
  styleUrl: 'c-menu-item.css',
  shadow: true,
})
export class CMenuItem {
  @Prop() active: boolean = false;

  render() {
    return (
      <Host class={ this.active ? 'active' : '' }>
        <slot></slot>
      </Host>
    );
  }

}
