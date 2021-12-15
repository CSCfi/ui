import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-main',
  styleUrl: 'c-main.css',
  shadow: true,
})
export class CMain {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
