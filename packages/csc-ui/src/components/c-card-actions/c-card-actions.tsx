import { Component, h } from '@stencil/core';

@Component({
  tag: 'c-card-actions',
  styleUrl: 'c-card-actions.scss',
  shadow: true,
})
export class CCardActions {
  render() {
    return (
      <div class="c-card-actions">
        <slot></slot>
      </div>
    );
  }
}
