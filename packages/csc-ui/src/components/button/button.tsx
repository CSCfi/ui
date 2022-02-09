import { Component, Prop, h } from '@stencil/core';
import { mdiPlus, mdiMinus, mdiAccount, mdiPencil } from '@mdi/js';

@Component({
  tag: 'c-button',
  styleUrl: 'button.scss',
  shadow: true,
})
export class Button {
  @Prop() fixed: boolean;
  @Prop() dense: boolean;
  @Prop() fit: boolean;
  @Prop() ghost: boolean;
  @Prop() text: boolean;
  @Prop() noRadius: boolean;
  @Prop() outlined: boolean;
  @Prop() secondary: boolean;
  @Prop({ reflect: true })
  disabled: boolean;
  @Prop() icon: string;
  @Prop({ attribute: 'id' }) hostId: string;
  @Prop() loading: boolean;

  render() {
    const SPINNER_SMALL = (
      <svg
        class="spinner"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle class="spinner__circle" cx="50" cy="50" r="45" />
      </svg>
    );

    let selectedIcon = null;
    let svg = '';

    if (this.icon) {
      const icons = {
        plus: mdiPlus,
        minus: mdiMinus,
        account: mdiAccount,
        edit: mdiPencil,
      };
      selectedIcon = icons[this.icon];
      svg = (
        <svg class="button-icon" width="16" height="16" viewBox="0 0 22 22">
          <path d={selectedIcon} />
        </svg>
      );
    }

    const buttonClasses = {
      'border-radius': !this.noRadius,
      'csc-bg-color': !this.disabled,
      'csc-button-disabled': !!this.disabled,
      'csc-button-ghost': !!this.ghost,
      'csc-button': true,
      'csc-button-text': !!this.text,
      fit: !!this.fit,
      fixed: !!this.fixed,
      outlined: !!this.outlined,
      secondary: !!this.secondary,
    };

    const innerClasses = {
      'csc-button-padding': !this.dense,
      'hide-text': this.loading,
      dense: !!this.dense,
      ripple: !this.disabled,
    };

    const hostClasses = {
      fit: !!this.fit,
    };

    return (
      <button
        id={this.hostId}
        class={hostClasses}
        tabindex="0"
        role="button"
        disabled={this.disabled}
      >
        <div class={buttonClasses}>
          {this.loading ? (
            <div
              class={
                this.dense ? 'spinner_wrapper dense_spinner' : 'spinner_wrapper'
              }
            >
              {SPINNER_SMALL}
            </div>
          ) : (
            ''
          )}
          <div class={innerClasses}>
            {svg}
            <slot></slot>
          </div>
        </div>
      </button>
    );
  }
}
