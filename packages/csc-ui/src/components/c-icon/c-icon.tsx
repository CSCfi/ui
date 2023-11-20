import { Component, Host, h, Prop, Element } from '@stencil/core';

/**
 * @group Other
 */
@Component({
  tag: 'c-icon',
  styleUrl: 'c-icon.scss',
  shadow: true,
})
export class CIcon {
  @Element() host: HTMLCIconElement;

  /**
   * Svg path d attribute value
   */
  @Prop() path: string;

  /**
   * Icon size in pixels
   */
  @Prop() size = 24;

  /**
   * Fill color
   */
  @Prop() color = 'currentColor';

  render() {
    return (
      <Host
        style={{
          '--_c-icon-size': `${this.size}px`,
          '--_c-icon-default-color': this.color,
        }}
      >
        <svg viewBox="0 0 24 24">
          <path d={this.path} />
        </svg>
      </Host>
    );
  }
}
