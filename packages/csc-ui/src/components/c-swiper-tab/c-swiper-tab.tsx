import {
  Component,
  Prop,
  h,
  Event,
  Element,
  EventEmitter,
  Listen,
} from '@stencil/core';
import { createRipple } from '../../utils/utils';

/**
 * @parent c-swiper
 */
@Component({
  tag: 'c-swiper-tab',
  styleUrl: 'c-swiper-tab.scss',
  shadow: true,
})
export class CSwiperTab {
  /**
   * Disable button
   */
  @Prop() disabled = false;

  /**
   * Mark as active
   */
  @Prop() active = false;

  /**
   * Label of the button
   */
  @Prop() label: string;

  /**
   * Id of the button
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Value of the button
   */
  @Prop() value: number | string;

  /**
   * Emit tab change to parent
   * @private
   */
  @Event() tabChange: EventEmitter;

  /**
   * Emit value change to the parent
   */
  @Event({
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  changeValue: EventEmitter<number | string>;

  /**
   * Emit tab focus to the parent
   * @private
   */
  @Event() focusTab: EventEmitter;

  @Element() el: HTMLCSwiperTabElement;

  private _container?: HTMLDivElement;

  @Listen('click', { passive: true })
  onTabClick(event) {
    if (this.active) return;

    createRipple(event, this._container);

    this.changeValue.emit(this.value);
  }

  @Listen('keydown', { capture: true })
  handleKeyDown(ev: KeyboardEvent) {
    if (this.active) return;

    if (['Space', 'Enter'].includes(ev.code)) {
      ev.preventDefault();
    }
  }

  @Listen('keyup', { capture: true })
  handleKeyUp(ev: KeyboardEvent) {
    if (this.active) return;

    if (['Space', 'Enter'].includes(ev.code)) {
      ev.preventDefault();
      this.changeValue.emit(this.value);
    }
  }

  private _onFocus = () => {
    this.focusTab.emit(this.value);
  };

  render() {
    const classes = {
      'c-swiper-tab': true,
      'c-swiper-tab--active': !this.disabled && this.active,
      'c-swiper-tab--disabled': this.disabled,
    };

    return (
      <div
        id={this.hostId}
        class={classes}
        tabindex="0"
        role="button"
        onFocus={this._onFocus}
      >
        <div
          class="c-swiper-tab__content"
          ref={(el) => (this._container = el as HTMLDivElement)}
        >
          <div class="c-swiper-tab__header">
            {this.label}
            <slot name="icon"></slot>
          </div>
          <div class="c-swiper-tab__description">
            <slot></slot>
          </div>
        </div>
      </div>
    );
  }
}
