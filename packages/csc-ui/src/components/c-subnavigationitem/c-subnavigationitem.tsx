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

  /**
   * Loading state
   */
  @Prop() loading = false;

  private _redirect(event: KeyboardEvent | PointerEvent) {
    if (
      (event instanceof KeyboardEvent && event?.key === 'Enter') ||
      event instanceof PointerEvent
    ) {
      event.stopPropagation();
      const sidenav = document.querySelector('c-sidenavigation');
      sidenav.menuVisible = false;

      if (this.href) {
        window.location.href = this.href;
      }
    }
  }
  render() {
    const classes = this.active && 'active';
    const loaderSize = 32;

    return (
      <Host
        tabindex="0"
        onClick={(e) => this._redirect(e)}
        onKeyDown={(e) => this._redirect(e)}
        class={classes}
      >
        <slot></slot>
        <c-loader size={loaderSize} hide={!this.loading}></c-loader>
      </Host>
    );
  }
}
