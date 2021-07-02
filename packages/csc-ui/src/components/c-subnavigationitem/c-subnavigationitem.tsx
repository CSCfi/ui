import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-subnavigationitem',
  styleUrl: 'c-subnavigationitem.css',
  shadow: true,
})
export class CSubnavigationitem {
  @Prop() active: boolean;
  @Prop() href: string;
  redirect() {
    const sidenav = document.querySelector('c-sidenavigation');
    sidenav.menuVisible = false;
    if (this.href) {
      window.location.href = this.href;
    }
  }
  render() {
    const classes = this.active && 'active';
    return (
      <Host onClick={() => this.redirect()} class={classes} >
        <slot></slot>
      </Host>
    );
  }

}
