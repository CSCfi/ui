import { Component, h, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import { createRipple } from '../../utils/utils';

/**
 * @group Form
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
  @Prop({ mutable: true }) value: { label: string; value: number | string };

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
  @Prop() items: { label: string; value: number | string }[] = [];

  /**
   * Disable the radio group
   */
  @Prop() disabled = false;

  /**
   * Emit value change to the parent
   */
  @Event() changeValue: EventEmitter;

  @Listen('keydown', { passive: true })
  handleKeyDown(ev: any) {
    if (ev.key === ' ') {
      ev.preventDefault();
    }
  }

  private _containers?: HTMLDivElement[] = [];

  private _select(event, item, index) {
    if (this.disabled) return;

    createRipple(event, this._containers[index], true);
    this.value = item;
    this.changeValue.emit(item);
  }

  private _selectWithSpace(ev, item) {
    if (this.disabled) return;

    if (ev.key === ' ') {
      this.value = item;
      this.changeValue.emit(item);
    }
  }

  private _getRadioButton = (item, index) => {
    const itemId = item.value.toString().replace(/[^a-zA-Z0-9-_]/g, '');

    const classes = {
      'c-radio': true,
      'c-radio--disabled': this.disabled,
      'csc-bg-color': true,
      active: this.value === item,
    };

    const wrapperClasses = {
      'c-radio-wrapper': true,
      'c-radio-wrapper--disabled': this.disabled,
    };

    const itemClasses = {
      'c-radio-group__item': true,
      'c-radio-group__item--disabled': this.disabled,
    };

    return (
      <div
        class={itemClasses}
        onClick={(event) => this._select(event, item, index)}
      >
        <div
          class={wrapperClasses}
          role="radio"
          tabindex="0"
          aria-labelledby={itemId}
          aria-checked={this.value === item}
          aria-disabled={this.disabled}
          ref={(el) => (this._containers[index] = el as HTMLDivElement)}
          onKeyDown={(event) => this._selectWithSpace(event, item)}
        >
          <div class={classes}>
            <div class="c-radio-outer-circle"></div>
            <div class="c-radio-inner-circle"></div>
          </div>
        </div>
        <label class="c-radio__label" id={itemId}>
          {item.label}
        </label>
      </div>
    );
  };

  render() {
    return (
      <div class="c-radio-group">
        {this.label && <label id="c-radio-group__label">{this.label}</label>}
        <div role="radiogroup" aria-labelledby="c-radio-group__label">
          {this.items.map((item, index) => this._getRadioButton(item, index))}
        </div>
      </div>
    );
  }
}
