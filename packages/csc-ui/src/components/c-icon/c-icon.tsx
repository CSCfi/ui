import { Component, Host, h, Prop } from '@stencil/core';

/**
 * @group Other
 */
@Component({
  tag: 'c-icon',
  styleUrl: 'c-icon.scss',
  shadow: true,
})
export class CIcon {
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
  @Prop() color = 'var(--csc-primary)';

  render() {
    return (
      <Host style={{ height: `${this.size}px` }}>
        <svg width={this.size} height={this.size} viewBox="0 0 24 24">
          <path d={this.path} style={{ fill: this.color }} />
        </svg>
      </Host>
    );
  }
}
