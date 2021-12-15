import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-flex',
  styleUrl: 'c-flex.css',
  shadow: true,
})
export class CFlex {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
