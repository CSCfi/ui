import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-container',
  styleUrl: 'container.css',
  shadow: true
})
export class Container {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
