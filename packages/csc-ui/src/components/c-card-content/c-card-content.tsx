import { Component, h } from '@stencil/core';

@Component({
  tag: 'c-card-content',
  styleUrl: 'c-card-content.scss',
  shadow: true,
})
export class CCardContent {
  render() {
    return (
      <div class="c-card-content">
        <slot></slot>
      </div>
    );
  }
}
