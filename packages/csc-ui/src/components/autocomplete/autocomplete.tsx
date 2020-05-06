import { Component, Element, Host, Prop, State, h } from '@stencil/core';
import { mdiChevronDown } from '@mdi/js';

@Component({
  tag: 'c-autocomplete',
  styleUrl: 'autocomplete.css',
  shadow: true
})
export class Autocomplete {
  @Prop() label: string;
  @Prop() name: string;
  @Prop({ mutable: true }) query: any = null;
  @Prop({ mutable: true }) value: any = null;
  @Prop() dense: boolean;
  @Element() host: HTMLElement;
  @State() menuVisible: boolean = false;

  showMenu() {
    this.menuVisible = !this.menuVisible;
  }
  
  handleChange(event) {
    this.menuVisible = true;
    this.query = event.target.value;
  }

  componentDidLoad() {
    const _this = this;

    window.addEventListener("click", function(event: any) {
      if (!event.target.matches('c-autocomplete')) {
        _this.menuVisible = false;
      }
    });
  
  }

  render() {
    let classes = 'c-autocomplete-wrapper'
    if (this.menuVisible) classes = `${classes} c-autocomplete-wrapper-active`;
    if (this.dense) classes = `${classes} c-autocomplete-dense`;
    return (
      <Host>
        <span>{ this.label }</span>
        <div class="c-autocomplete">
          <div class={ classes } onClick={() => this.showMenu()}>
            <c-row class="no-wrap">
              <div class="c-autocomplete-current">
                <input value={this.query} onInput={(event) => this.handleChange(event)}/>
              </div>
              <svg width="22" height="22" fill="#222" viewBox="0 0 24 24" class={ this.menuVisible ? 'c-autocomplete-icon rotated' : 'c-autocomplete-icon'}>
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
