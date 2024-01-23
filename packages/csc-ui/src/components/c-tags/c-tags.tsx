import { Component, Element, Host, Prop, h } from '@stencil/core';

/**
 * @group buttons
 * @slot Default slot - Default slot
 */
@Component({
  tag: 'c-tags',
  styleUrl: 'c-tags.scss',
  shadow: true,
})
export class CTags {
  @Element() el: HTMLCTagsElement;

  /**
   * Size of the tags
   */
  @Prop() size: 'default' | 'small' = 'default';

  componentDidLoad() {
    if (this.size === 'small') {
      const tags = this.el.querySelectorAll('c-tag');

      [...tags].forEach((tag) => {
        tag.size = 'small';
      });
    }
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
