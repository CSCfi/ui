import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-spacer',
  styleUrl: 'spacer.css',
  shadow: true
})
export class Spacer {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
