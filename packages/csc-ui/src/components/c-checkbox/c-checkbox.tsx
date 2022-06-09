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
  @Prop() label = '';

  /**
   * Set the validíty of the input
   */
  @Prop() valid = true;

  /**
   * Custom validation message
   */
  @Prop() validation = 'Required field';

  /**
   * Is the element checked
   */
  @Prop({ mutable: true }) value = false;

  /**
   * Triggered when element is checked or unchecked
   */
  @Event({ bubbles: false }) changeValue: EventEmitter;

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
    if (['Space'].includes(event.code)) {
      event.preventDefault();
      this.toggleState(event);
    }
  }

  componentWillLoad() {
    if (typeof this.value !== 'boolean') {
      console.warn(`[C-CHECKBOX] Property 'value' should be a boolean.`);
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
        <div class={wrapperClasses}>
          <input
            class="visuallyhidden"
            id="checkbox"
            type="checkbox"
            aria-checked={(!!this.value).toString()}
            aria-disabled={this.disabled.toString()}
            checked={this.value}
            disabled={this.disabled}
            onChange={(event) => this.toggleState(event)}
          />

          <label class="c-checkbox__label" htmlFor="checkbox">
            <div
              class="ripple"
              ref={(el) => (this._container = el as HTMLDivElement)}
            >
              <svg viewBox="0 0 100 100">
                <path class="path" d="M12.1 52.1l24.4 24.4 53-53" />
              </svg>
            </div>

            <div class="c-checkbox__label-content">
              {!!this.label ? this.label : <slot></slot>}
            </div>
          </label>
        </div>

        {this._renderMessages()}
      </Host>
    );
  }
}
