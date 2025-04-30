import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Element,
  AttachInternals,
} from '@stencil/core';
import { CRadioGroupItem } from '../../types';

/**
 * @group Form
 * @slot Default slot - Default slot for the label
 */
@Component({
  tag: 'c-radio-group',
  styleUrl: 'c-radio-group.scss',
  shadow: true,
  formAssociated: true,
})
export class CRadioGroup {
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  @AttachInternals() internals: ElementInternals;

  /**
   * Value of the radio group
   */
  @Prop({ mutable: true }) value: string | number | CRadioGroupItem;

  /**
   * Hide the hint and error messages
   */
  @Prop() hideDetails = false;

  /**
   * Hint text for the input
   */
  @Prop() hint = '';

  /**
   * Display radio buttons inline
   */
  @Prop() inline = false;

  /**
   * Label of the radio group
   */
  @Prop() label: string;

  /**
   * Color of the radio group
   */
  @Prop() color = '';

  /**
   * Id of the element
   * @name id
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Radio group items
   */
  @Prop() items: CRadioGroupItem[] = [];

  /**
   * Disable the radio group
   */
  @Prop() disabled = false;

  /**
   * Return the whole item object
   */
  @Prop() returnObject = false;

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
   * Emit value change to the parent
   */
  @Event({ bubbles: false })
  changeValue: EventEmitter;

  @Element() el: HTMLCRadioGroupElement;

  private _containers?: HTMLDivElement[] = [];

  private _rippleElements: HTMLCRippleElement[] = [];

  private static _uniqueId = 0;

  private get _id() {
    return this.hostId || `radio-group_${CRadioGroup._uniqueId}`;
  }

  private _handleKeyDown(event: KeyboardEvent, item, index) {
    if (['Space', 'Enter'].includes(event.code)) {
      event.preventDefault();

      this._select(event, item, index);
    }
  }

  private _select(event, item, index) {
    if (!!item.disabled || this.disabled) return;

    this._rippleElements[index].createRipple(
      event,
      this._containers[index],
      true,
    );
    this.value = !this.returnObject ? item?.value : item;
    this.changeValue.emit(this.value);

    const value = !this.returnObject
      ? this.value
      : (this.value as CRadioGroupItem).value;

    this.internals.setFormValue(value as string);
  }

  private _handleSlotChange = () => {
    this._getRadioButtons();
  };

  private _getRadioButtons = () => {
    const radios = this.el.querySelectorAll('c-radio');

    if (radios.length) {
      this.returnObject = false;

      this.items = [
        ...Array.from(radios).map((radio) => {
          if (!!radio.checked) {
            this.value = radio.value;
            this.changeValue.emit(this.value);
          }

          radio.style.display = 'none';

          return {
            name: radio.textContent,
            value: radio.value,
            disabled: !!radio.disabled,
          };
        }),
      ];
    }
  };

  private _getRadioButton = (item, index) => {
    const itemId = item.value.toString().replace(/[^a-zA-Z0-9-_]/g, '');

    const isChecked = !this.returnObject
      ? this.items?.find((i) => i.value === item.value)?.value === this.value
      : (this.value as CRadioGroupItem)?.value === item.value;

    const classes = {
      'c-radio': true,
      'c-radio--disabled': !!item.disabled || this.disabled,
      'c-radio--error': !this.valid,
    };

    return (
      <label
        class={classes}
        id={itemId}
        onKeyDown={(event) => this._handleKeyDown(event, item, index)}
      >
        <input
          type="radio"
          aria-checked={(this.value === item).toString()}
          aria-disabled={(!!item.disabled || this.disabled).toString()}
          aria-labelledby={itemId}
          disabled={!!item.disabled || this.disabled}
          checked={isChecked}
          name={CRadioGroup._uniqueId.toString()}
          onChange={(event) => this._select(event, item, index)}
        />

        <span
          class="ripple"
          ref={(el) => (this._containers[index] = el as HTMLDivElement)}
        >
          <span class="selection"></span>

          <c-ripple ref={(el) => (this._rippleElements[index] = el)}></c-ripple>
        </span>

        <div class="c-radio__label">{item.name}</div>
      </label>
    );
  };

  componentWillLoad() {
    CRadioGroup._uniqueId += 1;

    const radios = this.el.querySelectorAll('c-radio');

    const checkedRadio = Array.from(radios).find((item) => item.checked);

    if (checkedRadio) {
      const value = checkedRadio.value;

      this.internals.setFormValue(value as string);
    } else if (this.value) {
      const value = !this.returnObject
        ? this.value
        : (this.value as CRadioGroupItem).value;

      this.internals.setFormValue(value as string);
    }
  }

  render() {
    const slotHasContent = !!this.el.childNodes.length;

    const wrapperClasses = {
      'c-radio-group': true,
      'c-radio-group--disabled': this.disabled,
      'c-radio-group--inline': this.inline,
      'c-radio-group--error': !this.valid,
    };

    return (
      <div
        class={wrapperClasses}
        role="radiogroup"
        aria-labelledby="c-radio-group__label"
      >
        {(!!this.label || slotHasContent) && (
          <label class="c-radio-group__label">
            {!!this.label && this.label}

            <slot onSlotchange={this._handleSlotChange}></slot>

            {this.required && <span class="required">&nbsp;*</span>}
          </label>
        )}

        <div class="c-radio-group__items">
          {this.items.map((item, index) => this._getRadioButton(item, index))}
        </div>

        {!this.hideDetails && (
          <c-message
            hint={this.hint}
            inputId={this._id}
            valid={this.valid}
            validation={this.validation}
          />
        )}
      </div>
    );
  }
}
