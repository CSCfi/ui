import { Component, Prop, h } from '@stencil/core';
import { mdiPlus, mdiMinus, mdiAccount, mdiPencil, mdiFileCode, mdiServerSecurity, mdiNas, mdiChip } from '@mdi/js';

@Component({
  tag: 'c-tab-button',
  styleUrl: 'tab-button.css',
  shadow: true
})
export class Tab {
  @Prop() disabled: boolean;
  @Prop() color: string;
  @Prop() active: boolean;
  @Prop() noRadius: boolean;
  @Prop() icon: string;
  @Prop() label: string;


  render() {
    let classes, subClasses = '', svg, selectedIcon;
    if (this.disabled) {
      classes = `c-tab-button c-tab-button-disabled ${this.noRadius ? '' : 'border-radius'}`;
    } else {
      classes = `c-tab-button ${this.color} ${this.noRadius ? '' : 'border-radius'}`;
    }

    if (this.icon) {
      const icons = {
        plus: mdiPlus,
        minus: mdiMinus,
        account: mdiAccount,
        edit: mdiPencil,
        code: mdiFileCode,
        server: mdiServerSecurity,
        storage: mdiNas,
        cpu: mdiChip,
      };
      selectedIcon = icons[this.icon];

      svg = (
        <svg width="38" height="38" fill={this.disabled ? '#8C8C8C' : 'rgba(255,255,255,0.4)'} viewBox="0 0 24 24">
          <path d={ selectedIcon } />
        </svg>
      );
    }

    if (!this.disabled) {
      if (this.active) {
        subClasses = 'c-tab-button-active ripple';
      } else {
        subClasses = 'ripple';
      }
    }
    subClasses = `${subClasses} c-tab-button-padding`;

    return (
        <div class="c-tab-button-wrapper" style={{ 'width': '500px;' }}>
          <div class={classes}>
            <div class={subClasses}>
              <c-row>
                { this.label }
                <c-spacer></c-spacer>
                { svg }
              </c-row>
            </div>
          </div>
          <div class={this.active ? `c-tab-button-description c-tab-button-description-active ${this.color}` : `c-tab-button-description ${this.color}`}>
            <slot></slot>
          </div>
        </div>
    );
  }

}
