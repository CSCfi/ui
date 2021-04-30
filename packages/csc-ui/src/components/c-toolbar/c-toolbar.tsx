import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-toolbar',
  styleUrl: 'c-toolbar.css',
  shadow: true,
})
export class CToolbar {

  render() {
    return (
      <Host>
        <div class="c-toolbar">
          <slot></slot>
        </div>
        <div class="spacer"></div>
      </Host>
    );
  }

}
