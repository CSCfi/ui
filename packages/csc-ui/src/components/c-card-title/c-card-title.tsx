import { Component, h } from '@stencil/core';

@Component({
  tag: 'c-card-title',
  styleUrl: 'c-card-title.scss',
  shadow: true,
})
export class CCardTitle {
  render() {
    return (
      <div class="c-card-title">
        <c-title>
          <slot></slot>
        </c-title>
      </div>
    );
  }
}
