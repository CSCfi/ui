import { Component, Element, Host, Prop, State, h } from '@stencil/core';
import { mdiChevronDown } from '@mdi/js';

@Component({
  tag: 'c-select',
  styleUrl: 'select.css',
  shadow: true
})
export class Select {
  @Prop() label: string;
  @Prop() dense: boolean;
  @Prop() name: string;
  @Prop({ mutable: true }) value: any = null;
  @Element() host: HTMLElement;
  @State() menuVisible: boolean = false;

  showMenu() {
    this.menuVisible = !this.menuVisible;
  }

  componentDidLoad() {
    const _this = this;
    window.addEventListener("click", function(event: any) {
      if (!event.target.matches('c-select')) {
        _this.menuVisible = false;
      }
    });
  }

  render() {
    let classes = 'c-select-wrapper';
    if (this.menuVisible) classes = `${classes} c-select-wrapper-active`;
    if (this.dense) classes = `${classes} c-select-dense`;
    return (
      <Host>
        <span>{ this.label }</span>
        <div class="c-selections">
          <div class={ classes } onClick={() => this.showMenu()}>
            <c-row>
              <div class="c-select-current">
                { this.value.name }
              </div>
              <svg width="22" height="22" fill="#222" viewBox="0 0 24 24" class={ this.menuVisible ? 'c-select-icon rotated' : 'c-select-icon'}>
                <path d={ mdiChevronDown } />
              </svg>
            </c-row>
          </div>
          <input type="hidden" value={ this.value.value } name={ this.name } />
          <div class="c-menu-parent">
            { this.menuVisible ? <div class="c-menu">
              <slot></slot>
            </div> : ''}
          </div>
        </div>
      </Host>
    );
  }

}
