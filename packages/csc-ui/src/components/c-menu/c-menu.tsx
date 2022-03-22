import {
  Component,
  Host,
  h,
  State,
  Prop,
  Listen,
  Element,
} from '@stencil/core';
import { mdiChevronDown } from '@mdi/js';
/**
 * @group Navigation
 * @slot - Menu title / activator element (simple variant)
 */
@Component({
  tag: 'c-menu',
  styleUrl: 'c-menu.scss',
  shadow: true,
})
export class CMenu {
  @Element() el: HTMLCMenuElement;

  @State() currentIndex: number = null;
  @State() menuVisible: boolean = false;
  /**
   * Simple variant without chevron and background, E.g. when a button is the activator
   */
  @Prop() simple: boolean = false;
  /**
   * Small variant
   */
  @Prop() small: boolean = false;
  /**
   * No hover background
   */
  @Prop() nohover: boolean = false;
  /**
   * Menu items
   */
  @Prop() items: { name: string; action: Function }[] = [];

  @Listen('keydown', { capture: true })
  handleKeyDown(ev: any) {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (this.menuVisible === false) {
        this.menuVisible = true;
      } else {
        if (this.currentIndex === null) {
          this.currentIndex = 0;
        } else if (this.currentIndex + 1 < this.items.length) {
          this.currentIndex = this.currentIndex + 1;
        }
      }
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.menuVisible = true;
      if (this.currentIndex !== null && this.currentIndex > 0) {
        this.currentIndex = this.currentIndex - 1;
      } else if (this.currentIndex === 0) {
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

  @Listen('blur', { capture: true })
  handleBlur(event) {
    if ((event.relatedTarget as HTMLElement) !== this.el) {
      this._hideMenu();
    }
  }

  private _showMenu() {
    if (this.menuVisible) {
      this.currentIndex = null;
    }
    this.menuVisible = !this.menuVisible;
  }

  private _hideMenu() {
    this.menuVisible = false;
  }

  private _getListItem = (item) => {
    return (
      <c-menu-item
        onClick={item.action}
        active={this.items[this.currentIndex] === item}
        small={this.small}
      >
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
    if (this.small) {
      hostClasses.push('small');
    }
    if (this.nohover) {
      hostClasses.push('nohover');
    }
    return (
      <Host tabindex="0" role="button" class={hostClasses.join(' ')}>
        {this.simple ? (
          <div class="simple" onClick={() => this._showMenu()}>
            <slot></slot>
          </div>
        ) : (
          <div onClick={() => this._showMenu()} class="c-menu-wrapper">
            <div class={this.small ? 'c-select-row small' : 'c-select-row'}>
              <slot></slot>
              <svg
                width={this.small ? '16' : '22'}
                height={this.small ? '16' : '22'}
                viewBox="0 0 24 24"
                class={
                  this.menuVisible ? 'c-select-icon rotated' : 'c-select-icon'
                }
              >
                <path d={mdiChevronDown} />
              </svg>
            </div>
          </div>
        )}
        {this.menuVisible ? (
          <div class="c-menu-list" onClick={() => this._hideMenu()}>
            {this.items.map((item) => this._getListItem(item))}
          </div>
        ) : (
          ''
        )}
      </Host>
    );
  }
}
