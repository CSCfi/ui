import { Component, Prop, h } from '@stencil/core';
import { mdiPlus, mdiMinus, mdiAccount, mdiPencil } from '@mdi/js';

@Component({
  tag: 'c-button',
  styleUrl: 'button.css',
  shadow: true
})
export class Button {
  @Prop() color: string = '';
  @Prop() colorCode: string = '';
  @Prop() fixed: boolean;
  @Prop() dense: boolean;
  @Prop() fit: boolean;
  @Prop() noRadius: boolean;
  @Prop() outlined: boolean;
  @Prop() fullWidthMobile: boolean;
  @Prop({ reflectToAttr: true })
    disabled: boolean;
  @Prop() icon: string;
  @Prop() loading: boolean;
  
  render() {
    const SPINNER_SMALL = (<svg class="spinner" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle class="spinner__circle" cx="50" cy="50" r="45"/>
  </svg>);

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
        <svg class="button-icon" width="16" height="16" viewBox="0 0 22 22">
          <path d={ selectedIcon } />
        </svg>
      );
    }
    let classes;
    if (this.disabled) {
      classes = `csc-button csc-button-disabled ${this.fit ? 'fit' : ''} ${this.fixed ? 'fixed' : ''} ${radius} ${this.fullWidthMobile ? 'full-width-mobile' : ''}`;
    } else {
      classes = `csc-button csc-bg-color ${this.color} ${this.fit ? 'fit' : ''} ${this.fixed ? 'fixed' : ''} ${radius} ${this.fullWidthMobile ? 'full-width-mobile' : ''}`;
    }
    if (this.outlined) {
      classes = `${classes} outlined`;
    }

    let padding = 'csc-button-padding';
    if (this.dense) {
      padding = 'dense';
    }
    if (!this.disabled) {
      padding = `${padding} ripple`;
    }

    if (this.loading) {
      padding = `${padding} hide-text`;
    }

    let hostClasses = this.fullWidthMobile ? 'full-width' : '';
    if (this.fit) {
      hostClasses = 'fit';
    }

    let style = {};
    if (this.colorCode) {
      style = { 'background-color': this.colorCode, 'box-shadow': `${this.colorCode} 0px 0px 0px 2px inset` };
    }

    return (
      <button class={hostClasses} tabindex="0" role="button" disabled={this.disabled}>
        <div class={classes} style={style}>
          { this.loading ? (<div class={ this.dense ? 'spinner_wrapper dense_spinner' : 'spinner_wrapper'}>
            { SPINNER_SMALL }
          </div>) : '' }
          <div class={padding}>
            { svg }
            <slot></slot>
          </div>
        </div>
      </button>
    );
  }

}
