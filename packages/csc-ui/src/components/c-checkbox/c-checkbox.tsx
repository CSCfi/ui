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
} from '@stencil/core';
import { mdiCloseCircle } from '@mdi/js';
import { createRipple } from '../../utils/utils';
/**
 * @group Form
 * @slot - Default slot for the label
 */
@Component({
  tag: 'c-checkbox',
  styleUrl: 'c-checkbox.scss',
  shadow: true,
})
export class CCheckbox {
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
   * Element label
   */
  @Prop() label: string = '';

  /**
   * Set the validíty of the input
   */
  @Prop() valid: boolean = true;

  /**
   * Custom validation message
   */
  @Prop() validation: string = 'Required field';

  /**
   * Is the element checked
   */
  @Prop({ mutable: true }) value: boolean = false;

  /**
   * Triggered when element is checked or unchecked
   */
  @Event() changeValue: EventEmitter;

  @State() messageOptions = {
    show: true,
    type: 'hint',
    content: '',
  };

  private _container: HTMLDivElement;

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
    if (['Space', 'Enter'].includes(event.code)) {
      event.preventDefault();
      this.toggleState(event);
    }
  }

  componentDidLoad() {
    this._handleValidation(this.valid, 0);
  }

  private _handleValidation(valid: boolean, timeout = 200) {
    this.messageOptions = {
      ...this.messageOptions,
      show: false,
    };

    setTimeout(() => {
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
    }, timeout);
  }

  private toggleState(event) {
    if (this.disabled) return;

    createRipple(event, this._container, true);

    this.value = !this.value;
    this.changeValue.emit(this.value);
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

    return (
      <Host>
        <label
          id="c-checkbox-label"
          class={wrapperClasses}
          tabindex={this.disabled ? -1 : 0}
        >
          <input
            type="checkbox"
            aria-checked={this.value}
            aria-disabled={this.disabled}
            aria-labelledby="c-checkbox-label"
            checked={this.value}
            disabled={this.disabled}
            tabindex="-1"
            onChange={(event) => this.toggleState(event)}
          />
          <div
            class="ripple"
            ref={(el) => (this._container = el as HTMLDivElement)}
          >
            <span class="checkmark"></span>
          </div>
          <div class="c-checkbox__label">
            {!!this.label ? this.label : <slot></slot>}
          </div>
        </label>

        {this._renderMessages()}
      </Host>
    );
  }
}
