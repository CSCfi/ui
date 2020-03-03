import { Component, Prop, h } from '@stencil/core';
import { mdiPlus, mdiMinus, mdiAccount, mdiPencil } from '@mdi/js';

@Component({
  tag: 'c-button',
  styleUrl: 'button.css',
  shadow: true
})
export class Button {
  @Prop() color: string;
  @Prop() fixed: boolean;
  @Prop() noRadius: boolean;
  @Prop() disabled: boolean;
  @Prop() icon: string;
  
  render() {
    let selectedIcon = null;
    let svg = '';
    let radius = 'border-radius';
    if (this.noRadius) {
      radius = '';
    }
    if (this.icon) {
      const icons = {
        plus: mdiPlus,
        minus: mdiMinus,
        account: mdiAccount,
        edit: mdiPencil,
      };
      selectedIcon = icons[this.icon];
      svg = (
        <svg width="16" height="16" fill={this.disabled ? '#8C8C8C' : '#ffffff'} viewBox="0 0 22 22">
          <path d={ selectedIcon } />
        </svg>
      );
    }
    let classes;
    if (this.disabled) {
      classes = `csc-button csc-button-disabled ${this.fixed ? 'fixed' : ''} ${radius}`;
    } else {
      classes = `csc-button ${this.color} ${this.fixed ? 'fixed' : ''} ${radius}`;
    }

    return (
      <div class={classes}>
        <div class={this.disabled ? 'csc-button-padding' : 'ripple csc-button-padding'}>
          { svg }
          <slot></slot>
        </div>
      </div>
    );
  }

}
