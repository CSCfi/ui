import { Component, h } from '@stencil/core';

@Component({
  tag: 'c-h1',
  styleUrl: 'c-h1.css',
  shadow: true,
})
export class CH1 {

  render() {
    return (
      <h1>
        <slot></slot>
      </h1>
    );
  }

}
