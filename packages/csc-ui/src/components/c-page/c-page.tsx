import { Component, Element, Host, Prop, h } from '@stencil/core';

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

  /**
   * Display scroll indicator
   */
  @Prop() scrollIndicator = false;

  private _scrollIndicator: HTMLDivElement;

  private _onScroll() {
    if (!this.scrollIndicator) return;

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
        {this.scrollIndicator && (
          <div
            ref={(el) => (this._scrollIndicator = el)}
            class="scroll-indicator"
          />
        )}

        <div class="c-page__container">
          <slot></slot>
        </div>
      </Host>
    );
  }
}
