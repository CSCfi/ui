import { Component, Host, h, Prop } from '@stencil/core';
/**
 * @parent c-sidenavigation
 */
@Component({
  tag: 'c-subnavigationitem',
  styleUrl: 'c-subnavigationitem.scss',
  shadow: true,
})
export class CSubnavigationitem {
  /**
   * Active state
   */
  @Prop() active: boolean;

  /**
   * Link url
   */
  @Prop() href: string;
  private _redirect(event) {
    event.stopPropagation();
    const sidenav = document.querySelector('c-sidenavigation');
    sidenav.menuVisible = false;
    if (this.href) {
      window.location.href = this.href;
    }
  }
  render() {
    const classes = this.active && 'active';
    return (
      <Host tabindex="0" onClick={(e) => this._redirect(e)} class={classes}>
        <slot></slot>
      </Host>
    );
  }
}
