import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-title',
  styleUrl: 'title.css',
  shadow: true
})
export class Title {

  render() {
    return (
      <Host>
        <slot></slot>
        <div class="title-underline"></div>
      </Host>
    );
  }

}
