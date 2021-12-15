import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-modal',
  styleUrl: 'c-modal.css',
  shadow: true,
})
export class CModal {
  @Prop() value: boolean = false;

  render() {
    return this.value ? (
      <Host>
        <div class="c-modal">
          <slot></slot>
        </div>
        <div class="c-overlay c-fadeIn"></div>
      </Host>
    ) : '';
  }

}
