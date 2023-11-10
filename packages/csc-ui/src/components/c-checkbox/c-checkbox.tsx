import {
  Component,
  Host,
  h,
  Listen,
  Prop,
  Event,
  EventEmitter,
  State,
  Watch,
  Element,
  AttachInternals,
} from '@stencil/core';
import { mdiCloseCircle } from '@mdi/js';

/**
 * @group Form
 * @slot Default slot - Default slot for the label
 */
@Component({
  tag: 'c-checkbox',
  styleUrl: 'c-checkbox.scss',
  shadow: true,
  formAssociated: true,
})
export class CCheckbox {
  @Element() el: HTMLCCheckboxElement;

  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  @AttachInternals() internals: ElementInternals;

  /**
   * If `true`, the checkbox is selected.
   */
  @Prop({ mutable: true }) checked = false;

  /**
   * Disable the checkbox
   */
  @Prop() disabled = false;

  /**
   * Hide the hint and error messages
   */
  @Prop() hideDetails = false;

  /**
   * Hint text for the input
   */
  @Prop() hint = '';

  /**
   * Indeterminate state
   */
  @Prop() indeterminate = false;

  /**
   * Element label
   */
  @Prop() label = '';

  /**
   * Set as required
   */
  @Prop() required = false;

  /**
   * Set the validity of the input
   */
  @Prop() valid = true;

  /**
   * Custom validation message
   */
  @Prop() validation = 'Required field';

  /**
   * The input value
   * - Only used when the checkbox participates in a native `<form>`
   */
  @Prop() value: string | boolean = false;

  /**
   * The value when the checkbox is checked
   */
  @Prop() trueValue: boolean | string = true;

  /**
   * The value when the checkbox is unchecked
   */
  @Prop() falseValue: boolean | string = false;

  /**
   * Name of the input
   * - Only used when the checkbox participates in a native `<form>`
   */
  @Prop({ attribute: 'name' }) hostName: string;

  /**
   * Triggered when element is checked or unchecked
   */
  @Event({ bubbles: false }) changeValue: EventEmitter;

  @State() messageOptions = {
    show: false,
    type: 'hint',
    content: '',
  };

  private _container: HTMLDivElement;

  private _rippleElement: HTMLCRippleElement;

  private _validationIcon = (
    <svg height="16px" width="16px" viewBox="0 0 24 24">
      <path d={mdiCloseCircle} />
    </svg>
  );

  @Watch('validation')
  onValidationMessageChange(message: string) {
    this.onValidChange(message.length === 0);
  }

  @Watch('valid')
  onValidChange(valid: boolean) {
    this._handleValidation(valid || this.valid);
  }

  @Listen('keydown', { passive: true })
  handleKeyDown(event: KeyboardEvent) {
    if (['Space'].includes(event.code)) {
      event.preventDefault();
      this._toggleState(event);
    }
  }

  componentWillLoad() {
    if (this.value === this.trueValue) {
      this.checked = true;
    }

    if (this.checked) {
      this.internals.setFormValue(this.value as string);
    }
  }

  componentDidLoad() {
    this._handleMessageOptions(this.valid);
  }

  private _handleMessageOptions(valid: boolean) {
    requestAnimationFrame(() => {
      this.messageOptions = {
        ...this.messageOptions,
        type: valid ? 'hint' : 'error',
        show: true,
        content: valid ? (
          <span>{this.hint}</span>
        ) : (
          <span>
            {this._validationIcon} {this.validation}
          </span>
        ),
      };
    });
  }

  private _handleValidation(valid: boolean, timeout = 200) {
    setTimeout(() => {
      this._handleMessageOptions(valid);
    }, timeout);
  }

  private _toggleState(event) {
    if (this.disabled) return;

    this._rippleElement.createRipple(event, this._container, true);

    this.checked = !this.checked;

    if (typeof this.value === 'string' && typeof this.trueValue === 'boolean') {
      this.changeValue.emit(this.value);

      this.internals.setFormValue(this.checked ? (this.value as string) : null);

      return;
    }

    this.changeValue.emit(this.checked ? this.trueValue : this.falseValue);
  }

  private _renderMessages() {
    if (this.hideDetails) return;

    const classes = {
      'c-checkbox__details': true,
      active: this.messageOptions.show,
    };

    const messageClasses = {
      'c-checkbox__message': true,
      [`c-checkbox__message--${this.messageOptions.type}`]: true,
    };

    return (
      <div class={classes}>
        <div class={messageClasses}>{this.messageOptions.content}</div>
      </div>
    );
  }

  render() {
    const wrapperClasses = {
      'c-checkbox': true,
      'c-checkbox--disabled': this.disabled,
      'c-checkbox--error': this.messageOptions.type === 'error',
    };

    const labelClasses = {
      'c-checkbox__label': true,
      'c-checkbox__label--indeterminate': this.indeterminate,
    };

    const slotHasContent = !!this.el.childNodes.length;

    return (
      <Host>
        <div class={wrapperClasses}>
          <input
            class="visuallyhidden"
            id="checkbox"
            {...(!!this.hostName ? { name: this.hostName } : {})}
            type="checkbox"
            aria-checked={this.checked.toString()}
            aria-disabled={this.disabled.toString()}
            checked={this.checked ? true : undefined}
            disabled={this.disabled}
            onChange={(event) => this._toggleState(event)}
          />

          <label class={labelClasses} htmlFor="checkbox">
            <div
              class="ripple"
              ref={(el) => (this._container = el as HTMLDivElement)}
            >
              <svg viewBox="0 0 100 100">
                {!this.indeterminate && this.checked && (
                  <path
                    class="path"
                    d="M 12 52 l 24 24 l 47 -47 l -3 -3 l -44 44 l -21 -21 l -3 3"
                  />
                )}
                {this.indeterminate && (
                  <path class="path" d="M20 56 h60 v-8 h-60 z" />
                )}
              </svg>

              <c-ripple ref={(el) => (this._rippleElement = el)}></c-ripple>
            </div>

            {(!!this.label || slotHasContent) && (
              <div class="c-checkbox__label-content">
                {!!this.label ? this.label : <slot></slot>}
                {this.required && <span class="required">&nbsp;*</span>}
              </div>
            )}
          </label>
        </div>

        {this._renderMessages()}
      </Host>
    );
  }
}
