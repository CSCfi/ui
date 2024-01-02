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

  private _pathElement: SVGElement;

  componentDidLoad() {
    // workaround to make the icon work as a c-option child
    this._pathElement.setAttribute('d', this.host.dataset.path);
  }

  render() {
    return (
      <Host
        style={{
          '--_c-icon-size': `${this.size}px`,
          '--_c-icon-default-color': this.color,
        }}
        data-path={this.path}
      >
        <svg viewBox="0 0 24 24">
          <path ref={(el) => (this._pathElement = el)} />
        </svg>
      </Host>
    );
  }
}
