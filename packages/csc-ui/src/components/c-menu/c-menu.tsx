import { Component, Host, h, State, Prop, Listen } from '@stencil/core';
import { mdiChevronDown } from '@mdi/js';

@Component({
  tag: 'c-menu',
  styleUrl: 'c-menu.css',
  shadow: true,
})
export class CMenu {

  current = null;
  @State() currentIndex: number = null;
  @State() menuVisible: boolean = false;
  @Prop() simple: boolean = false;
  @Prop() items: any[] = [
    // { name: 'Default 1', action: () => alert('action') },
  ];

  @Listen('keydown', { capture: true })
  handleKeyDown(ev: any){
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (this.menuVisible === false) {
        this.menuVisible = true;
      } else {
        if (this.currentIndex === null) {
          this.currentIndex = 0;
        } else if (this.currentIndex + 1 < this.items.length){
          this.currentIndex = this.currentIndex + 1;
        }
      }
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.menuVisible = true;
      if (this.currentIndex !== null && this.currentIndex > 0){
        this.currentIndex = this.currentIndex - 1;
      } else if (this.currentIndex === 0){
        this.currentIndex = null;
      }
    }

    if (ev.key === 'Escape') {
      if (this.menuVisible === true) {
        this.menuVisible = false;
        this.currentIndex = null;
      }
    }

    if (ev.key === 'Enter') {
      if (this.currentIndex !== null) {
        const selectedItem = this.items[this.currentIndex];
        selectedItem.action();
        this.menuVisible = false;
      }
    }
  }

  showMenu() {
    if (this.menuVisible) {
      this.currentIndex = null;
    }
    this.menuVisible = !this.menuVisible;
  }

  hideMenu() {
    this.menuVisible = false;
  }

  getListItem = (item) => {
    return (
      <c-menu-item onClick={item.action} active={this.items[this.currentIndex] === item}>
        {item.name}
      </c-menu-item>
    );
  };

  
  
  render() {
    const hostClasses = [];
    if (this.menuVisible) {
      hostClasses.push('active');
    }
    if (this.simple) {
      hostClasses.push('simple-host');
    }
    return (
      <Host
        tabindex="0"
        role="button"
        class={ hostClasses.join(' ') }
        onBlur={() => this.hideMenu()}
      >
        { this.simple ? <div class="simple" onClick={() => this.showMenu()}>
          <slot name="activator"></slot>
        </div> : (
          <div
            onClick={() => this.showMenu()}
            ref={el => this.current = el as HTMLElement}
            class="full-width"
          >
            <div class="c-select-row">
              <slot name="activator"></slot>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                class={ this.menuVisible ? 'c-select-icon rotated' : 'c-select-icon'}
              >
                <path d={ mdiChevronDown } />
              </svg>
            </div>
          </div>
        )}
        { this.menuVisible ? <div class="c-menu-list" onClick={() => this.hideMenu()}>
          {this.items.map(item => this.getListItem(item))}
        </div> : '' }
      </Host>
    );
  }

}
