import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-option',
  styleUrl: 'option.css',
  shadow: true
})
export class Option {
  @Prop() label: string;
  @Prop() value: string;
  @Prop() dense: boolean;

  render() {
    return (
      <Host class={this.dense ? 'dense' : ''}>
        <slot></slot>
      </Host>
    );
  }

}
