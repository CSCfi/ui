import {
  Component,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Prop,
} from '@stencil/core';
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

  private _onClick = (event, center = false) => {
    if (this.disabled) return;

    createRipple(event, this._container, center);

    this.tabChange.emit(this.value);
  };

  @Listen('keydown', { passive: true })
  handleKeydown(event: KeyboardEvent) {
    if (['Space', 'Enter'].includes(event.code)) {
      event.preventDefault();

      this._onClick(event, true);
    }
  }

  render() {
    const classes = {
      'c-tab': true,
      'c-tab--active': this.active,
      'c-tab--disabled': this.disabled,
    };

    return (
      <Host
        tabindex={this.disabled ? -1 : 0}
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
