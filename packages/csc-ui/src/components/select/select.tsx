import { Component, Element, Host, Prop, State, h } from '@stencil/core';
import { mdiChevronDown } from '@mdi/js';

@Component({
  tag: 'c-select',
  styleUrl: 'select.css',
  shadow: true
})
export class Select {
  @Prop() label: string;
  @Prop() name: string;
  @Prop({ mutable: true }) value: any = null;
  @Element() host: HTMLElement;
  @State() currentValue: any = {};
  @State() menuVisible: boolean = false;
  options: Array<any> = [];

  selectOption(option) {
    this.currentValue = option;
    this.value = option.value;
    this.showMenu();
  }
  showMenu() {
    this.menuVisible = !this.menuVisible;
  }

  componentDidLoad() {
    const _this = this;
    let slotted = this.host.children;
    for (let i = 0; i < slotted.length; i++) {
      const option = {
        value: slotted[i].getAttribute('value'),
        name: slotted[i].innerHTML,
      }
      this.options.push(option);
    }

    if (this.value) {
      this.currentValue = this.options.find(o => o.value === this.value);
    } else {
      this.currentValue = this.options[0];
    }

    window.onclick = function(event) {
      if (!event.target.matches('c-select')) {
        _this.menuVisible = false;
      }
    }
  
  }

  render() {
    return (
      <Host>
        { this.label }
        <div class="c-selections">
          <div class={ this.menuVisible ? 'c-select-wrapper c-select-wrapper-active' : 'c-select-wrapper'} onClick={() => this.showMenu()}>
            <c-row>
              <div class="c-select-current">
                { this.currentValue.name }
              </div>
              <svg width="22" height="22" fill="#222" viewBox="0 0 24 24" class={ this.menuVisible ? 'c-select-icon rotated' : 'c-select-icon'}>
                <path d={ mdiChevronDown } />
              </svg>
            </c-row>
          </div>
          <input type="hidden" value={ this.currentValue.value } name={ this.name } />
          <div class="c-menu-parent">
            { this.menuVisible ? <div class="c-menu">
              { this.options.map(option => 
                <div onClick={() => this.selectOption(option)}>{option.name}</div>
              ) }
            </div> : ''}
          </div>
        </div>
      </Host>
    );
  }

}
