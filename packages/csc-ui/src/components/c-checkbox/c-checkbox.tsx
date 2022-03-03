import {
  Component,
  Host,
  h,
  Listen,
  Prop,
  Event,
  EventEmitter,
} from '@stencil/core';
import { createRipple } from '../../utils/utils';
/**
 * @group Form
 */
@Component({
  tag: 'c-checkbox',
  styleUrl: 'c-checkbox.scss',
  shadow: true,
})
export class CCheckbox {
  /**
   * Element label
   */
  @Prop() label: string = '';

  /**
   * Is the element checked
   */
  @Prop({ mutable: true }) value: boolean = false;

  /**
   * Disable the checkbox
   */
  @Prop() disabled = false;

  /**
   * Triggered when element is checked or unchecked
   */
  @Event() changeValue: EventEmitter;

  private _container: HTMLDivElement;

  @Listen('keydown', { passive: true })
  handleKeyDown(event: any) {
    if (event.key === ' ') {
      event.preventDefault();
      this.toggleState(event);
    }
  }

  private toggleState(event) {
    if (this.disabled) return;

    createRipple(event, this._container, true);
    this.value = !this.value;
    this.changeValue.emit(this.value);
  }

  render() {
    const classes = `c-checkbox__background csc-bg-color`;
    const wrapperClasses = {
      'c-checkbox': true,
      'c-checkbox--disabled': this.disabled,
      active: this.value,
    };
    const baseClasses = {
      'c-checkbox-row': true,
      'c-checkbox-row--disabled': this.disabled,
    };

    return (
      <Host>
        <div class={baseClasses} onClick={(event) => this.toggleState(event)}>
          <div
            role="checkbox"
            aria-checked={this.value}
            tabindex="0"
            aria-labelledby="c-checkbox-label"
            class={wrapperClasses}
            ref={(el) => (this._container = el as HTMLDivElement)}
          >
            <div class={classes}>
              <svg class="c-checkbox__checkmark" viewBox="0 0 24 24">
                <path fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"></path>
              </svg>
            </div>
          </div>
          <label id="c-checkbox-label">{this.label}</label>
        </div>
      </Host>
    );
  }
}
