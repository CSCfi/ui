import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-row',
  styleUrl: 'row.css',
  shadow: true
})
export class Row {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
