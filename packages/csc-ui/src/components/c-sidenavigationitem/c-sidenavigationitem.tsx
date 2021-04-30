import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-sidenavigationitem',
  styleUrl: 'c-sidenavigationitem.css',
  shadow: true,
})
export class CSidenavigationitem {
  @Prop() active: boolean;

  render() {
    const classes = this.active && 'active';
    return (
      <Host class={classes}>
        <slot></slot>
      </Host>
    );
  }

}
