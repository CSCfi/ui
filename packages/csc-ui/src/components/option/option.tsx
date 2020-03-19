import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-option',
  styleUrl: 'option.css',
  shadow: true
})
export class Option {
  @Prop() label: string;
  @Prop() value: string;

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
