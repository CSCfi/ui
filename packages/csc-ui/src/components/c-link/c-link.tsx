import { Component, h, Prop } from '@stencil/core';
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

  render() {
    return (
      <a
        class={this.underline && 'underline'}
        href={this.href}
        target={this.target}
      >
        <slot></slot>
      </a>
    );
  }
}
