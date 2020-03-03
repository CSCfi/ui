import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-col',
  styleUrl: 'col.css',
  shadow: true
})
export class Col {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
