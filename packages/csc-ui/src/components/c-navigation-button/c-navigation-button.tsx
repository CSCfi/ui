import { mdiMenu } from '@mdi/js';
import { Component, Host, h } from '@stencil/core';
/**
 * @parent c-toolbar
 */
@Component({
  tag: 'c-navigation-button',
  styleUrl: 'c-navigation-button.scss',
  shadow: true,
})
export class CNavigationButton {
  render() {
    return (
      <Host tabindex={0}>
        <c-icon-button text>
          <c-icon path={mdiMenu}></c-icon>
        </c-icon-button>
      </Host>
    );
  }
}
