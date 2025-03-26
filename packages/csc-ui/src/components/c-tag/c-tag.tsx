import { mdiClose } from '@mdi/js';
import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';

/**
 * @parent c-tags
 * @slot Default slot - Default slot
 */
@Component({
  tag: 'c-tag',
  styleUrl: 'c-tag.scss',
  shadow: true,
})
export class CTag {
  /**
   * Mark tag as active
   */
  @Prop() active = false;

  /**
   * Stretch to fill the container row
   */
  @Prop() block = false;

  /**
   * Stretch to fill the container
   */
  @Prop() fit = false;

  /**
   * Remove the hover effect
   */
  @Prop() flat = false;

  /**
   * Mark tag as closeable
   */
  @Prop() closeable = false;

  /**
   * Display an optional badge at the start of the tag
   */
  @Prop() badge: string | number = null;

  /**
   * Size of the tag
   */
  @Prop() size: 'default' | 'small' = 'default';

  /**
   * Emit close event on close icon click
   */
  @Event() close: EventEmitter;

  private _onClose() {
    this.close.emit();
  }

  render() {
    const hasBadge = !!this.badge || this.badge === 0;

    const hostClasses = {
      'c-tag': true,
      'c-tag--closeable': this.closeable,
      'c-tag--badge': hasBadge,
      'c-tag--active': this.active,
      'c-tag--block': this.block,
      'c-tag--fit': this.fit,
      'c-tag--flat': this.flat,
      'c-tag--small': this.size === 'small',
    };

    const hostParams = {
      tabindex: this.flat ? -1 : 0,
      ...(!this.flat && {
        role: 'button',
      }),
    };

    return (
      <Host {...hostParams} class={hostClasses}>
        <div {...(hasBadge ? { 'data-badge': this.badge } : {})}>
          <slot></slot>

          {this.closeable && (
            <c-icon-button onClick={() => this._onClose()}>
              <c-icon size={16} path={mdiClose}></c-icon>
            </c-icon-button>
          )}
        </div>
      </Host>
    );
  }
}
