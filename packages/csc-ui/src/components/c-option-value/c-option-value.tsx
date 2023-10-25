import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-option-value',
  styleUrl: 'c-option-value.scss',
  shadow: true,
})
export class COptionValue {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
