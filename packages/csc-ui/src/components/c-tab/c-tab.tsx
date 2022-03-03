import { Component, Event, EventEmitter, h, Host, Prop } from '@stencil/core';
import { createRipple } from '../../utils/utils';
/**
 * @group Tabs
 * @parent c-tabs
 * @slot - Default slot
 */
@Component({
  tag: 'c-tab',
  styleUrl: 'c-tab.scss',
  shadow: true,
})
export class CTab {
  /**
   * Mark tab as active
   */
  @Prop() active = false;

  /**
   * Mark tab as disabled
   */
  @Prop() disabled = false;

  /**
   * Id of the tab
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Value for the tab
   * - for use in c-tabs
   */
  @Prop() value?: number | string;

  /**
   * Emit changes to the parent
   *
   * @private
   */
  @Event() tabChange: EventEmitter;

  private _container?: HTMLDivElement;

  private _onClick = (event) => {
    if (this.disabled) return;

    createRipple(event, this._container);

    this.tabChange.emit(this.value);
  };

  render() {
    const classes = {
      'c-tab': true,
      'c-tab--active': this.active,
      'c-tab--disabled': this.disabled,
    };

    return (
      <Host
        tabindex="0"
        role="button"
        aria-disabled={this.disabled ? 'true' : 'false'}
      >
        <div
          id={this.hostId}
          class={classes}
          onClick={this._onClick}
          ref={(el) => (this._container = el as HTMLDivElement)}
        >
          <slot></slot>
        </div>
      </Host>
    );
  }
}
