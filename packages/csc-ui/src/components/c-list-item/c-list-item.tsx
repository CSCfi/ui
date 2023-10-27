import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';

@Component({
  tag: 'c-list-item',
  styleUrl: 'c-list-item.scss',
  shadow: true,
})
export class CListItem {
  @Element() el!: HTMLCListItemElement;

  /**
   * Set the item active
   */
  @Prop() active = false;

  /**
   * Disable the item
   */
  @Prop() disabled = false;

  /**
   * Disabled by the parent list
   * @private
   */
  @Prop() disabledByParent = false;

  /**
   * Display background color on hover
   */
  @Prop() hoverable = false;

  /**
   * Add ripple effect to the item
   */
  @Prop() ripple = false;

  /**
   * Hyperlink url
   */
  @Prop() href?: string;

  /**
   * Hyperlink target
   */
  @Prop() target = '_blank';

  @Watch('active')
  onActiveChange(active) {
    const title = this.el.querySelector('c-list-item-title');

    if (!title) return;

    title.active = active;
  }

  private get _slots() {
    const hasPreSlot = !!this.el.querySelector('[slot="pre"]');

    const hasPostSlot = !!this.el.querySelector('[slot="post"]');

    return {
      pre: hasPreSlot,
      post: hasPostSlot,
    };
  }

  private get _tabindex() {
    if (this.disabled) return -1;

    if (this.ripple && !this.href) return 0;

    return null;
  }

  private _onClick = (event: MouseEvent | KeyboardEvent, center = false) => {
    if (this.disabled) {
      event.preventDefault();

      return;
    }

    if (!this.ripple) return;

    this.el.shadowRoot
      .querySelector('c-ripple')
      .createRipple(event as MouseEvent, this.el, center);
  };

  private _onKeyup = (event: KeyboardEvent) => {
    if ([' ', 'Enter'].includes(event.key)) {
      this._onClick(event, true);
    }
  };

  render() {
    const Tag = !!this.href ? 'a' : 'div';

    const classes = {
      'c-list-item': true,
      'c-list-item--active': this.active,
      'c-list-item--disabled': this.disabled,
      'c-list-item--hoverable': this.ripple || !!this.href || this.hoverable,
      'c-list-item--ripple': this.ripple,
    };

    let linkAttributes = {};

    if (!!this.href) {
      linkAttributes = { href: this.href, target: this.target };
    }

    return (
      <Host
        role="listitem"
        aria-disabled={(!!this.disabled).toString()}
        onClick={this._onClick}
        onKeyup={this._onKeyup}
        class={classes}
        {...(!!this.disabled ? { disabled: 'true' } : {})}
        {...(!!this.disabledByParent ? { 'data-disabled': 'true' } : {})}
        {...([0, -1].includes(this._tabindex)
          ? { tabindex: this._tabindex }
          : {})}
      >
        <Tag {...linkAttributes} class="c-list-item__content">
          {this._slots.pre && <slot name="pre"></slot>}
          <slot></slot>
          {this._slots.post && <slot name="post"></slot>}
          {this.ripple && <c-ripple></c-ripple>}
        </Tag>
      </Host>
    );
  }
}
