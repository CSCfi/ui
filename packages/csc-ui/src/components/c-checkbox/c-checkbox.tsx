import {
  Component,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
  Watch,
  Element,
  AttachInternals,
} from '@stencil/core';

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
   * Id of the element
   * @name id
   */
  @Prop({ attribute: 'id' }) hostId: string;

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
   * @name name
   */
  @Prop({ attribute: 'name' }) hostName: string;

  /**
   * Triggered when element is checked or unchecked
   */
  @Event({ bubbles: false })
  changeValue: EventEmitter;

  private _container: HTMLDivElement;

  private _rippleElement: HTMLCRippleElement;

  private static _uniqueId = 0;

  private get _id() {
    return this.hostId || `checkbox_${CCheckbox._uniqueId}`;
  }

  @Watch('value')
  onValueChange(value: string | boolean) {
    this.checked = this.trueValue === value;

    this.internals.setFormValue(
      this.checked ? this.trueValue.toString() : this.falseValue.toString(),
    );
  }

  componentWillLoad() {
    CCheckbox._uniqueId += 1;

    this.checked = this.checked || this.value === this.trueValue;

    this.internals.setFormValue(
      this.checked ? this.trueValue.toString() : this.falseValue.toString(),
    );
  }

  private _toggleState(event) {
    if (this.disabled) return;

    this._rippleElement.createRipple(event, this._container, true);

    this.checked = !this.checked;

    this.changeValue.emit(this.checked ? this.trueValue : this.falseValue);

    this.internals.setFormValue(
      this.checked ? this.trueValue.toString() : this.falseValue.toString(),
    );
  }

  render() {
    const wrapperClasses = {
      'c-checkbox': true,
      'c-checkbox--disabled': this.disabled,
      'c-checkbox--error': !this.valid,
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

        {!this.hideDetails && (
          <c-message
            hint={this.hint}
            inputId={this._id}
            valid={this.valid}
            validation={this.validation}
          />
        )}
      </Host>
    );
  }
}
