import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Element,
} from '@stencil/core';
import { v4 as uuid } from 'uuid';
import { CRadioGroupItem } from '../../types';
import { createRipple } from '../../utils/utils';

/**
 * @group Form
 * @slot - Default slot for the label
 */
@Component({
  tag: 'c-radio-group',
  styleUrl: 'c-radio-group.scss',
  shadow: true,
})
export class CRadioGroup {
  /**
   * Value of the radio group
   */
  @Prop({ mutable: true }) value: CRadioGroupItem;

  /**
   * Label of the radio group
   */
  @Prop() label: string;

  /**
   * Color of the radio group
   */
  @Prop() color: string = '';

  /**
   * Radio group items
   */
  @Prop() items: CRadioGroupItem[] = [];

  /**
   * Disable the radio group
   */
  @Prop() disabled = false;

  /**
   * Emit value change to the parent
   */
  @Event() changeValue: EventEmitter;

  @Element() el: HTMLCRadioGroupElement;

  private _containers?: HTMLDivElement[] = [];

  private _uniqueId = uuid();

  private _handleKeyDown(event: KeyboardEvent, item, index) {
    if (['Space', 'Enter'].includes(event.code)) {
      event.preventDefault();

      this._select(event, item, index);
    }
  }

  private _select(event, item, index) {
    if (this.disabled) return;

    createRipple(event, this._containers[index], true);
    this.value = item;
    this.changeValue.emit(item);
  }

  private _getRadioButton = (item, index) => {
    const itemId = item.value.toString().replace(/[^a-zA-Z0-9-_]/g, '');

    const classes = {
      'c-radio': true,
      'c-radio--disabled': this.disabled,
    };

    return (
      <label
        class={classes}
        id={itemId}
        tabindex={this.disabled ? -1 : 0}
        onKeyDown={(event) => this._handleKeyDown(event, item, index)}
      >
        <input
          type="radio"
          aria-checked={this.value === item}
          aria-disabled={this.disabled}
          aria-labelledby={itemId}
          disabled={this.disabled}
          checked={this.value === item}
          name={this._uniqueId}
          tabindex="-1"
          onChange={(event) => this._select(event, item, index)}
        />
        <span
          class="ripple"
          ref={(el) => (this._containers[index] = el as HTMLDivElement)}
        >
          <span class="selection"></span>
        </span>
        <div class="c-radio__label">{item.label}</div>
      </label>
    );
  };

  render() {
    const slotHasContent = !!this.el.childNodes.length;

    return (
      <div class="c-radio-group">
        {(!!this.label || slotHasContent) && (
          <label id="c-radio-group__label">
            {!!this.label ? this.label : <slot></slot>}
          </label>
        )}
        <div
          class="c-radio-group__items"
          role="radiogroup"
          aria-labelledby="c-radio-group__label"
        >
          {this.items.map((item, index) => this._getRadioButton(item, index))}
        </div>
      </div>
    );
  }
}
