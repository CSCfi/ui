import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';

/**
 * @group Other
 */
@Component({
  tag: 'c-list',
  styleUrl: 'c-list.scss',
})
export class CList {
  @Element() el!: HTMLCListElement;

  /**
   * Disable the list
   */
  @Prop() disabled = false;

  /**
   * Show border arount the list items
   */
  @Prop() bordered = false;

  @Watch('disabled')
  onDisabledChange(disabled) {
    this._items.forEach((item) => {
      const isDisabled =
        item.hasAttribute('disabled') && !('disabled' in item.dataset);

      // ignore especially disabled items
      if (!isDisabled) {
        item.disabled = !!disabled;
        item.disabledByParent = !!disabled;
      }
    });
  }

  private get _items() {
    return Array.from(this.el.querySelectorAll('c-list-item'));
  }

  componentDidLoad() {
    this.onDisabledChange(this.disabled);
  }

  render() {
    const classes = {
      'c-list': true,
      'c-list--disabled': this.disabled,
      'c-list--bordered': this.bordered,
    };

    return <Host role="list" class={classes}></Host>;
  }
}
