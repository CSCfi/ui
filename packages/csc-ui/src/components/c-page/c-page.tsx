import { Component, Element, Host, h } from '@stencil/core';

/**
 * @group Layout
 * @slot default - Default slot
 */
@Component({
  tag: 'c-page',
  styleUrl: 'c-page.scss',
  shadow: true,
})
export class CPage {
  @Element() el: HTMLCPageElement;

  private _scrollIndicator: HTMLDivElement;

  private _onScroll() {
    const scrollTop = this.el.scrollTop;
    const height = this.el.scrollHeight - this.el.clientHeight;
    const scrolled = (scrollTop / height) * 100;

    this._scrollIndicator.style.width = scrolled + '%';
  }

  componentDidLoad() {
    this.el.onscroll = this._onScroll.bind(this);
  }

  render() {
    return (
      <Host>
        <div
          ref={(el) => (this._scrollIndicator = el)}
          class="scroll-indicator"
        />

        <slot></slot>
      </Host>
    );
  }
}
