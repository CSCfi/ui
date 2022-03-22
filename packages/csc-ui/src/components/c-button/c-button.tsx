import { Component, Prop, h, Element, Host } from '@stencil/core';
import { mdiPlus, mdiMinus, mdiAccount, mdiPencil } from '@mdi/js';
import { createRipple } from '../../utils/utils';

/**
 * @group Buttons
 * @slot - Button text
 * @slot icon - Icon
 * @slot description - Additional description to be shown below the button text
 */
@Component({
  tag: 'c-button',
  styleUrl: 'c-button.scss',
  shadow: true,
})
export class CButton {
  /**
   * Outlined button style
   */
  @Prop() outlined = false;

  /**
   * Light button background
   */
  @Prop() ghost = false;

  /**
   * Transparent button background
   */
  @Prop() text = false;

  /**
   * Display loader on the button
   */
  @Prop() loading = false;

  /**
   * Fit width to containing element
   */
  @Prop() fit = false;

  /**
   * Remove the default border radius
   */
  @Prop() noRadius = false;

  /**
   * Button type
   */
  @Prop() type: 'button' | 'submit' = 'button';

  /**
   * Disable the button
   */
  @Prop({ reflect: true }) disabled = false;

  /**
   * Name of the icon to be displayed in the button
   *
   * @deprecated Please use the icon slot instead
   */
  @Prop() icon: 'plus' | 'minus' | 'account' | 'edit';

  /**
   * Value for the button
   * - for use in the c-content-switcher
   */
  @Prop() value?: number | string;

  /**
   * Id of the button
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Size of the button
   */
  @Prop() size: 'default' | 'small' | 'large' = 'default';

  @Element() hostElement: HTMLCButtonElement;

  private _container?: HTMLDivElement;

  private _onClick = (event, center = false) => {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    createRipple(event, this._container, center);

    if (this.type === 'submit') {
      this._closestElementComposed('form', this._container).submit();
    }
  };

  private _onKeyDown = (event: KeyboardEvent) => {
    if (['Space', 'Enter'].includes(event.code)) {
      event.preventDefault();

      this._onClick(event, true);
    }
  };

  private _closestElementComposed(selector, base) {
    function __closestFrom(el) {
      const found = el.closest(selector);

      return found ? found : __closestFrom(el.getRootNode().host);
    }

    return __closestFrom(base);
  }

  private _containerhasDescriptionSlot: boolean;

  componentWillLoad() {
    this._containerhasDescriptionSlot = !!this.hostElement.querySelector(
      '[slot="description"]',
    );
  }

  render() {
    const SPINNER_SMALL: SVGImageElement = (
      <svg
        class="spinner"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle class="spinner__circle" cx="50" cy="50" r="45" />
      </svg>
    );

    let selectedIcon = null;
    let svg: SVGImageElement;

    if (this.icon) {
      const icons = {
        plus: mdiPlus,
        minus: mdiMinus,
        account: mdiAccount,
        edit: mdiPencil,
      };
      selectedIcon = icons[this.icon];
      svg = (
        <svg class="button-icon" width="16" height="16" viewBox="0 0 22 22">
          <path d={selectedIcon} />
        </svg>
      );
    }

    const buttonClasses = {
      'c-button': true,
      'c-button--description': this._containerhasDescriptionSlot,
      'c-button--disabled': !!this.disabled,
      'c-button--fitted': !!this.fit,
      'c-button--ghost': !!this.ghost,
      'c-button--large': this.size === 'large',
      'c-button--no-radius': !!this.noRadius,
      'c-button--outlined': !!this.outlined,
      'c-button--small': this.size === 'small',
      'c-button--text': !!this.text,
    };

    const innerClasses = {
      'c-button__content': true,
      'hide-text': this.loading,
    };

    const hostClasses = {
      fit: !!this.fit,
      'no-radius': !!this.noRadius,
    };

    const descriptionSlotClasses = {
      'c-button__description': this._containerhasDescriptionSlot,
    };

    return (
      <Host>
        <button
          id={this.hostId}
          class={hostClasses}
          tabindex={this.disabled ? -1 : 0}
          role="button"
          disabled={this.disabled}
          onKeyDown={this._onKeyDown}
          onClick={this._onClick}
        >
          <div
            class={buttonClasses}
            ref={(el) => (this._container = el as HTMLDivElement)}
          >
            {this.loading && <div class="spinner_wrapper">{SPINNER_SMALL}</div>}
            <div class={innerClasses}>
              <slot name="icon"></slot>
              {svg}
              <slot></slot>
            </div>
            {this._containerhasDescriptionSlot && !this.loading && (
              <div class={descriptionSlotClasses}>
                <slot name="description"></slot>
              </div>
            )}
          </div>
        </button>
      </Host>
    );
  }
}
