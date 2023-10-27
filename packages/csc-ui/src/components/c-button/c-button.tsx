import {
  Component,
  Prop,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
} from '@stencil/core';

/**
 * @group Buttons
 * @slot Default slot - Button text
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
   * Inverted button style for dark backgrounds
   */
  @Prop() inverted = false;

  /**
   * Outlined button style
   */
  @Prop() outlined = false;

  /**
   * Light button background
   */
  @Prop() ghost = false;

  /**
   * Danger variant style
   */
  @Prop() danger = false;

  /**
   * True when used as a tab button
   * @private
   */
  @Prop() grouped = false;

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
   * Value for the button
   * - for use in the c-tab-buttons
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

  /**
   * Hyperlink url
   */
  @Prop() href: string;

  /**
   * Hyperlink target
   */
  @Prop() target = '_blank';

  /**
   * Used a s atab button
   * @private
   */
  @Prop() tabs = false;

  /**
   * Emit changes to the parent
   * @private
   */
  @Event() tabChange: EventEmitter<{
    value: number | string;
    element: HTMLCButtonElement;
  }>;

  /**
   * Emit focus to the parent
   *
   * @private
   */
  @Event() tabFocus: EventEmitter<number | string>;

  @Element() hostElement: HTMLCButtonElement;

  @Listen('focus', { passive: true })
  onTabFocus() {
    this.tabFocus.emit(this.value ?? this.hostElement.dataset.index);
  }

  private _container?: HTMLDivElement;

  private _rippleElement: HTMLCRippleElement;

  private _onClick = (event, center = false) => {
    if (this.disabled) {
      event.preventDefault();

      return;
    }

    this._rippleElement.createRipple(event, this._container, center);

    if (this.tabs) {
      this.tabChange.emit({
        value: this.value ?? this.hostElement.dataset.index,
        element: this.hostElement,
      });
    }

    if (this.type === 'submit') {
      const submitButton = this._createHiddenSubmitButton();

      submitButton.click();

      submitButton.remove();
    }
  };

  private _createHiddenSubmitButton = () => {
    const form = this._closestElementComposed('form', this._container);

    const submitButton = document.createElement('button');
    submitButton.type = this.type;
    submitButton.style.display = 'none';
    submitButton.disabled = this.disabled;

    form.appendChild(submitButton);

    return submitButton;
  };

  private _onKeyDown = (event: KeyboardEvent) => {
    if (['Space', 'Enter'].includes(event.code)) {
      if (!!this.href) {
        window.open(this.href, this.target);
      }

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
    const contentClasses = {
      'c-button__content': true,
      'c-button__content--description': this._containerhasDescriptionSlot,
      'c-button__content--fitted': !!this.fit,
      'c-button__content--large': this.size === 'large',
      'c-button__content--no-radius': !!this.noRadius,
      'c-button__content--small': this.size === 'small',
    };

    const innerClasses = {
      'c-button__content__inner': true,
      'hide-text': this.loading,
    };

    const buttonClasses = {
      fit: !!this.fit,
      grouped: this.grouped,
      outlined: this.outlined,
    };

    const hostClasses = {
      'c-button': true,
      'c-button--ghost': this.ghost,
      'c-button--outlined': this.outlined,
      'c-button--danger': this.danger,
      'c-button--disabled': this.disabled,
      'c-button--inverted': this.inverted,
      'c-button--text': this.text,
      'c-button--fitted': !!this.fit,
      'c-button--description': !!this._containerhasDescriptionSlot,
      'c-button--active': this.grouped && !this.outlined,
      'c-button--no-radius': !!this.noRadius,
      [`c-button--${this.size}`]: true,
    };

    const descriptionSlotClasses = {
      'c-button__content__description': this._containerhasDescriptionSlot,
      'c-button__content__description--loading': this.loading,
    };

    const Tag = !!this.href ? 'a' : 'button';

    const hostAttributes = {
      onKeyDown: this._onKeyDown,
    };

    const attributes = {
      id: this.hostId,
      class: buttonClasses,
      disabled: this.disabled,
      onClick: this._onClick,
      type: this.type,
    };

    let linkAttributes = {};

    if (!!this.href) {
      linkAttributes = { href: this.href, target: this.target };
    }

    const spinnerSizes = {
      small: 20,
      default: 24,
      large: 28,
    };

    return (
      <Host class={hostClasses} {...hostAttributes}>
        <Tag {...attributes} {...linkAttributes}>
          <div
            class={contentClasses}
            ref={(el) => (this._container = el as HTMLDivElement)}
          >
            <div class={innerClasses}>
              {this.loading && (
                <div class="c-button__loader">
                  <c-spinner
                    color="var(--_c-button-loader-color)"
                    size={spinnerSizes[this.size]}
                  />
                </div>
              )}

              <slot></slot>
            </div>

            {this._containerhasDescriptionSlot && (
              <div class={descriptionSlotClasses}>
                <slot name="description"></slot>
              </div>
            )}
          </div>

          <c-ripple ref={(el) => (this._rippleElement = el)}></c-ripple>
        </Tag>
      </Host>
    );
  }
}
