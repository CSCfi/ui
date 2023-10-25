import {
  Component,
  h,
  Element,
  Prop,
  State,
  Event,
  EventEmitter,
  AttachInternals,
} from '@stencil/core';

/**
 * @group Form
 * @slot label - Label text for the switch
 */
@Component({
  tag: 'c-switch',
  styleUrl: 'c-switch.scss',
  shadow: true,
  formAssociated: true,
})
export class CSwitch {
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  @AttachInternals() internals: ElementInternals;

  /**
   * If `true`, the checkbox is selected.
   */
  @Prop({ mutable: true }) checked = false;

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
   * Disable the switch
   */
  @Prop({ attribute: 'disabled' }) hostDisabled = false;

  /**
   * Id for the element
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Set as required
   */
  @Prop() required = false;

  @Element() host: HTMLCSwitchElement;

  @State() hasLabel = false;

  /**
   * Emit inner value change to parent
   */
  @Event({ bubbles: false }) changeValue: EventEmitter;

  componentWillLoad() {
    if (this.value === this.trueValue) {
      this.checked = true;
    }

    if (this.checked) {
      this.internals.setFormValue(this.value as string);
    }
  }

  componentDidLoad() {
    const slotted = this.host.childNodes;

    this.hasLabel = slotted && slotted.length > 0;
  }

  private _toggleState = () => {
    if (this.hostDisabled) return;

    this.checked = !this.checked;

    if (typeof this.value === 'string' && typeof this.trueValue === 'boolean') {
      this.changeValue.emit(this.value);

      console.log('🪓', this.checked, this.value);

      this.internals.setFormValue(this.checked ? (this.value as string) : null);

      return;
    }

    this.changeValue.emit(this.checked ? this.trueValue : this.falseValue);
  };

  render() {
    const classes = {
      'c-switch': true,
      'c-switch--disabled': !!this.hostDisabled,
      'c-switch--label': this.hasLabel,
    };

    const sliderClasses = {
      'c-switch__slider': true,
      'c-switch__slider--disabled': !!this.hostDisabled,
    };

    return (
      <label class={classes} htmlFor={this.hostId}>
        <div class="c-switch__input">
          <input
            id={this.hostId}
            aria-checked={this.checked.toString()}
            type="checkbox"
            role="switch"
            disabled={this.hostDisabled}
            checked={this.checked ? true : undefined}
            onChange={() => this._toggleState()}
          />
          <span class={sliderClasses}></span>
        </div>
        {this.hasLabel ? (
          <div class="c-switch__label">
            <slot></slot>

            {this.required && <span class="required">&nbsp;*</span>}
          </div>
        ) : null}
      </label>
    );
  }
}
