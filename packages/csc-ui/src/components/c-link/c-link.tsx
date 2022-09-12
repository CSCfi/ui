import { Component, h, Prop } from '@stencil/core';
import { CSCColor } from '../../types';
/**
 * Basic hyperlink component
 *
 * @group Buttons
 */
@Component({
  tag: 'c-link',
  styleUrl: 'c-link.scss',
  shadow: true,
})
export class CLink {
  /**
   * Url of link
   */
  @Prop() href: string = null;

  /**
   * Display line under the link
   */
  @Prop() underline = false;

  /**
   * regular target attribute of a hyperlink
   */
  @Prop() target: string = null;

  /**
   * Use another CSC color
   */
  @Prop() color: CSCColor = 'link';

  /**
   * Customisable font weight
   */
  @Prop() weight = '600';

  /**
   * Path for the svg icon
   */
  @Prop() path: string = null;

  /**
   * Fill color for the svg icon
   */
  @Prop() iconFill: CSCColor = 'link';

  /**
   * Icon position
   */
  @Prop() iconAfter: false;

  /**
   * Icon style overrides
   */
  @Prop() iconStyle = {};

  render() {
    const CSCColor = (color: CSCColor) => `var(--csc-${color})`;

    const classList = {
      underline: this.underline,
      icon: !!this.path,
      'icon-after': this.iconAfter,
    };

    const iconStyle = {
      ...this.iconStyle,
      fill: this.iconFill ? CSCColor(this.iconFill) : 'inherit',
    };

    const style = {
      color: CSCColor(this.color),
      fontWeight: this.weight.toString(),
    };

    return (
      <a class={classList} href={this.href} target={this.target} style={style}>
        <slot name="icon">
          {this.path && (
            <svg
              style={iconStyle}
              class="icon-by-path"
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path d={this.path} />
            </svg>
          )}
        </slot>
        <slot></slot>
      </a>
    );
  }
}
