import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-loader',
  styleUrl: 'c-loader.css',
  shadow: true,
})
export class CLoader {
  @Prop() contentdelay: number;

  render() {
    const SPINNER_SMALL = (
      <svg
        class="c-loader-spinner"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle class="c-loader-spinner__circle" cx="50" cy="50" r="45" />
      </svg>
    );
    return (
      <Host>
        <div class="c-spinner-wrapper">
          <div>
            <div class="c-spinner-inner">{SPINNER_SMALL}</div>
            <div
              class="slot-wrapper"
              style={{ 'animation-delay': `${this.contentdelay}s` }}
            >
              <slot></slot>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}