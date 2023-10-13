import { Component, h } from '@stencil/core';
/**
 * @parent c-card
 * @slot Default slot - Card title text
 */
@Component({
  tag: 'c-card-title',
  styleUrl: 'c-card-title.scss',
  shadow: true,
})
export class CCardTitle {
  render() {
    return (
      <header class="c-card-title">
        <slot></slot>
        <div class="c-card-title__underline"></div>
      </header>
    );
  }
}
