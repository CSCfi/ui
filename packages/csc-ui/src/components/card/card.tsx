import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-card',
  styleUrl: 'card.css',
  shadow: true
})
export class Card {
  @Prop() shadow: boolean = undefined;
  render() {
    return (
      <Host class={ this.shadow ? 'shadow' : ''}>
        <slot></slot>
      </Host>
    );
  }

}
