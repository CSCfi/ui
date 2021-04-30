import { Component, Host, h, State } from '@stencil/core';

@Component({
  tag: 'c-sidenavigation',
  styleUrl: 'c-sidenavigation.css',
  shadow: true,
})
export class CSidenavigation {
  @State() menuVisible: boolean = false;
  componentDidLoad() {
    const _this = this;

    window.addEventListener("click", function(event: any) {
      if (event.target.matches('c-navigationbutton')) {
        _this.menuVisible = !_this.menuVisible;
      }
    });
  
  }
  render() {
    return (
      <Host class={this.menuVisible ? 'showMenu' : 'hideMenu'}>
        <div>
          <slot></slot>
        </div>
      </Host>
    );
  }

}
