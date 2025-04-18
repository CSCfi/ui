import { Component, Host, h } from '@stencil/core';

/**
 * @parent c-side-navigation
 */
@Component({
  tag: 'c-side-navigation-title',
  styleUrl: 'c-side-navigation-title.scss',
  shadow: true,
})
export class CSideNavigationTitle {
  render() {
    return (
      <Host>
        <div>
          <slot></slot>
        </div>
      </Host>
    );
  }
}
