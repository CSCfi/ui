import {
  Component,
  Prop,
  Host,
  h,
  EventEmitter,
  Event,
  State,
  Watch,
  Element,
} from '@stencil/core';
import { mdiEye, mdiEyeOff } from '@mdi/js';

/**
 * @group Form
 */
@Component({
  tag: 'c-text-field',
  styleUrl: 'c-text-field.scss',
  shadow: true,
})
export class CTextField {
  /**
   * Manual validation
   */
  @Prop() validate: boolean = false;

  /**
   * Id of the input
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Numeric input
   */
  @Prop() number = false;

  /**
   * Disable the input
   */
  @Prop() disabled = false;

  /**
   * Mark as readonly
   */
  @Prop() readonly = false;

  /**
   * Shadow variant of the input
   */
  @Prop() shadow = false;

  /**
   * Auto focus the input
   */
  @Prop() autofocus = false;

  /**
   * Set the validíty of the input
   */
  @Prop() valid: boolean = true;

  /**
   * Custom validation message
   */
  @Prop() validation: string = 'Required field';

  /**
   * Set the input as required
   */
  @Prop() required: boolean = null;

  /**
   * Validate the input on blur
   */
  @Prop() validateOnBlur: boolean = false;

  /**
   * Label of the input
   */
  @Prop() label: string;

  /**
   * Name of the input
   */
  @Prop() name: string;

  /**
   * Type of the input
   */
  @Prop() type: string;

  /**
   * Step size on a numeric input
   */
  @Prop() step: number = null;

  /**
   * Minimum value on a numeric input
   */
  @Prop() min: number = null;

  /**
   * Maximum value on a numeric input
   */
  @Prop() max: number = null;

  /**
   * Rows on the input
   */
  @Prop() rows: number = 1;

  /**
   * Placeholder of the input
   */
  @Prop() placeholder: string;

  /**
   * Value of the input
   */
  @Prop({ mutable: true }) value: string;

  /**
   * Render a hidden input outside the shadow dom
   */
  @Prop() form = false;

  /**
   * Emit changes to the parent
   */
  @Event() changeValue: EventEmitter;

  @State() tick = '';

  private _outerWrapperClasses = ['outer-wrapper'];
  private _validationClasses = ['validation-message'];
  private _isBlurred = false;
  private _inputReference?: HTMLInputElement;
  private _textAreaReference?: HTMLTextAreaElement;
  private _originalType = '';

  @Element() hiddenEl!: HTMLCTextFieldElement;

  @Watch('validate')
  validateChange(newValue: boolean) {
    if (newValue) {
      this._runValidate(true, true);
    }
  }

  componentWillLoad() {
    this._originalType = this.type;
  }

  componentDidLoad() {
    if (this.autofocus) {
      setTimeout(() => {
        this._focus();
      }, 500);
    }
  }

  private _setBlur = () => {
    this._isBlurred = true;
    if (this.validateOnBlur) {
      this._runValidate(true);
    }
  };

  private _handleChange = (event) => {
    this.value = event.target.value;
    this.tick = '';
    this.changeValue.emit(event.target.value);
  };

  private _runValidate(forceUpdate = false, extValidate = false) {
    this._outerWrapperClasses = this._outerWrapperClasses.filter(
      (c) => c !== 'required',
    );
    this._validationClasses = this._validationClasses.filter(
      (c) => c !== 'show',
    );
    if (
      (this._isBlurred || !this.validateOnBlur || extValidate) &&
      ((this.required && !this.value) || !this.valid)
    ) {
      this._outerWrapperClasses.push('required');
      this._validationClasses.push('show');
      if (forceUpdate) {
        this.tick = 'force';
      }
    }
  }

  private _focus = () => {
    if (this.rows > 1) {
      this._textAreaReference.focus();
    } else {
      this._inputReference.focus();
    }
  };

  private _togglePasswordVisibility = () => {
    this.type = this.type === 'password' ? 'text' : 'password';
  };

  get passwordIcon() {
    return this.type === 'password' ? mdiEye : mdiEyeOff;
  }

  private _validationIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#E71D32"
      width="18px"
      height="18px"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  );

  render() {
    if (this.tick !== 'force') {
      // already externally validated when forced to render
      this._runValidate();
    }
    if (this.disabled) {
      this._outerWrapperClasses.push('disabled');
    } else {
      this._outerWrapperClasses = this._outerWrapperClasses.filter(
        (c) => c !== 'disabled',
      );
    }
    let borderLabel = 'border-label';
    if (this.value !== '' || this.placeholder) {
      borderLabel += ' value-set';
    }

    const labelBlock = (
      <div class={borderLabel}>
        <label class="top-span" htmlFor={this.name}>
          {this.label}
          {this.required ? '*' : ''}
        </label>
        <label class="hidden">
          {this.label}
          {this.required ? '*' : ''}
        </label>
      </div>
    );

    let type = 'text';

    if (this.number) {
      type = 'number';
    }

    if (this.type) {
      type = this.type;
    }

    if (this.shadow) {
      this._outerWrapperClasses.push('shadow');
    }

    if (this.form) {
      this._renderInputOutsideShadowRoot(this.hiddenEl, this.name, this.value);
    }

    const textInput = (
      <input
        id={this.hostId}
        ref={(el) => (this._inputReference = el as HTMLInputElement)}
        name={this.name}
        onBlur={this._setBlur}
        aria-labelledby="c-text-label"
        disabled={this.disabled}
        readonly={this.readonly}
        type={type}
        min={this.min}
        max={this.max}
        step={this.step}
        placeholder={this.placeholder}
        value={this.value}
        onInput={this._handleChange}
        onChange={this._handleChange}
      />
    );
    const textArea = (
      <textarea
        id={this.hostId}
        ref={(el) => (this._textAreaReference = el as HTMLTextAreaElement)}
        name={this.name}
        onBlur={this._setBlur}
        rows={this.rows}
        aria-labelledby="c-text-label"
        disabled={this.disabled}
        placeholder={this.placeholder}
        readonly={this.readonly}
        onInput={this._handleChange}
        value={this.value}
      ></textarea>
    );
    return (
      <Host onClick={this._focus}>
        <div class={this._outerWrapperClasses.join(' ')}>
          <div class="border-wrapper">
            <div class="border-left"></div>
            {this.label ? labelBlock : null}
            <div class="border-right"></div>
          </div>

          <slot name="pre"></slot>

          {this.rows > 1 ? textArea : textInput}

          <slot name="post"></slot>

          {this._originalType === 'password' && (
            <c-icon-button
              size="small"
              text
              onClick={this._togglePasswordVisibility}
            >
              <svg width="22" height="22" fill="#222" viewBox="0 0 24 24">
                <path d={this.passwordIcon} />
              </svg>
            </c-icon-button>
          )}
        </div>
        <div class={this._validationClasses.join(' ')}>
          {this._validationIcon} {this.validation}
        </div>
      </Host>
    );
  }

  private _renderInputOutsideShadowRoot(
    container: HTMLElement,
    name: string,
    value: string | null,
  ) {
    let input = container.querySelector(
      'input.hidden-input',
    ) as HTMLInputElement | null;

    if (input === null) {
      input = container.ownerDocument.createElement('input');
      input.type = 'hidden';
      input.classList.add('hidden-input');
      container.appendChild(input);
    }
    input.name = name;
    input.value = value || '';
  }
}
