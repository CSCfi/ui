import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-card',
  styleUrl: 'card.css',
  shadow: true
})
export class Card {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
