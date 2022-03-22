import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  State,
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
   * Auto focus the input
   */
  @Prop() autofocus = false;

  /**
   * Disable the input
   */
  @Prop() disabled = false;

  /**
   * Render a hidden input outside the shadow dom
   */
  @Prop() form = false;

  /**
   * Hide the hint and error messages
   */
  @Prop() hideDetails = false;

  /**
   * Hint text for the input
   */
  @Prop() hint = '';

  /**
   * Id of the input
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Label of the input
   */
  @Prop() label: string;

  /**
   * Maximum value on a numeric input
   */
  @Prop() max: number = null;

  /**
   * Minimum value on a numeric input
   */
  @Prop() min: number = null;

  /**
   * Name of the input
   */
  @Prop() name: string;

  /**
   * Numeric input
   *
   * @deprecated Use type="number" instead
   */
  @Prop() number = false;

  /**
   * Placeholder of the input
   */
  @Prop() placeholder: string;

  /**
   * Mark as readonly
   */
  @Prop() readonly = false;

  /**
   * Set the input as required
   */
  @Prop() required: boolean = null;

  /**
   * Rows on the input
   */
  @Prop() rows: number = 1;

  /**
   * Shadow variant of the input
   */
  @Prop() shadow = false;

  /**
   * Step size on a numeric input
   */
  @Prop() step: number = null;

  /**
   * Type of the input
   */
  @Prop() type: string;

  /**
   * Set the validíty of the input
   */
  @Prop() valid: boolean = true;

  /**
   * Manual validation
   */
  @Prop() validate: boolean = false;

  /**
   * Validate the input on blur
   */
  @Prop() validateOnBlur: boolean = false;

  /**
   * Custom validation message
   */
  @Prop() validation: string = 'Required field';

  /**
   * Value of the input
   */
  @Prop({ mutable: true }) value: string;

  /**
   * Emit changes to the parent
   */
  @Event() changeValue: EventEmitter;

  @State() isFocused = false;

  @State() labelWidth = 0;

  @State() preSlotWidth = 0;

  @State() messageOptions = {
    show: true,
    type: 'hint',
    content: '',
  };

  @Element() hiddenEl!: HTMLCTextFieldElement;

  private _originalType = '';

  componentWillLoad() {
    this._originalType = this.type;
  }

  get isActive() {
    return !!this.value || this.isFocused;
  }

  get passwordIcon() {
    return this.type === 'password' ? mdiEye : mdiEyeOff;
  }

  private _handleChange = (event) => {
    this.value = event.target.value;

    this.changeValue.emit(event.target.value);
  };

  private _renderInputElement() {
    const props = {
      shared: {
        id: this.hostId,
        name: this.name,
        disabled: this.disabled,
        readonly: this.readonly,
        'aria-labelledby': 'c-text-label',
        value: this.value,
        onInput: this._handleChange,
        onChange: this._handleChange,
      },
      input: {
        type: this.number ? 'number' : this.type || 'text',
        min: this.min,
        max: this.max,
        step: this.step,
      },
      textArea: {
        rows: this.rows,
      },
    };

    const textInput = <input {...props.shared} {...props.input} />;

    const textArea = (
      <textarea {...props.shared} {...props.textArea}></textarea>
    );

    return this.rows > 1 ? textArea : textInput;
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

  private _renderPasswordToggle() {
    if (this._originalType !== 'password') return;

    return (
      <svg
        class="c-input__password-toggle"
        viewBox="0 0 24 24"
        onClick={this._togglePasswordVisibility}
      >
        <path d={this.passwordIcon} />
      </svg>
    );
  }

  private _togglePasswordVisibility = () => {
    this.type = this.type === 'password' ? 'text' : 'password';
  };

  render() {
    if (this.form) {
      this._renderInputOutsideShadowRoot(this.hiddenEl, this.name, this.value);
    }

    return (
      <Host>
        <c-input
          autofocus={this.autofocus}
          disabled={this.disabled}
          hide-details={this.hideDetails}
          hint={this.hint}
          id={this.hostId}
          label={this.label}
          name={this.name}
          placeholder={this.placeholder}
          readonly={this.readonly}
          shadow={this.shadow}
          type={this.type}
          valid={this.valid}
          validate={this.validate}
          validate-on-blur={this.validateOnBlur}
          validation={this.validation}
          value={this.value}
        >
          <slot name="pre" slot="pre"></slot>

          {this._renderInputElement()}

          {this._renderPasswordToggle()}

          <slot name="post" slot="post"></slot>
        </c-input>
      </Host>
    );
  }
}
