import { mdiChevronRight } from '@mdi/js';
import { Component, Host, h, Prop, Element } from '@stencil/core';
/**
 * @parent c-sidenavigation
 */
@Component({
  tag: 'c-sidenavigationitem',
  styleUrl: 'c-sidenavigationitem.scss',
  shadow: true,
})
export class CSidenavigationitem {
  @Element() hostElement: HTMLCSidenavigationitemElement;
  /**
   * Indicate active state
   */
  @Prop() active: boolean;
  /**
   * Hyperlink url
   */
  @Prop() href: string;
  private _redirect() {
    if (!this._slotHasContent) {
      const sidenav = document.querySelector('c-sidenavigation');
      sidenav.menuVisible = false;
    }
    if (this.href) {
      window.location.href = this.href;
    }
  }

  private _slotHasContent = false;

  componentWillLoad() {
    this._slotHasContent = !!this.hostElement.querySelector(
      '[slot="subnavitem"]',
    );
  }

  private _getChevron() {
    if (!this._slotHasContent) return;
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" class="svg">
        <path d={mdiChevronRight} />
      </svg>
    );
  }
  render() {
    const classes = this.active && 'active';

    return (
      <Host tabindex="0" onClick={() => this._redirect()}>
        <div class={classes}>
          <div class="styleMain">
            <c-row align="center" gap={4}>
              <div class="middle">{this._getChevron()}</div>
              <slot name="main"></slot>
            </c-row>
          </div>
          <div
            aria-expanded={this.active}
            class={this.active ? 'subnavactive' : 'subnavitem'}
          >
            {this.active ? <slot name="subnavitem"></slot> : ''}
          </div>
        </div>
      </Host>
    );
  }
}
