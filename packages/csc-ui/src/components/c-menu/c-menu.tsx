import {
  Component,
  Host,
  h,
  State,
  Prop,
  Listen,
  Element,
  Watch,
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

  @State() menuVisible = false;

  /**
   * Simple variant without chevron and background, E.g. when a button is the activator
   */
  @Prop() simple = false;

  /**
   * Small variant
   */
  @Prop() small = false;

  /**
   * No hover background
   */
  @Prop() nohover = false;

  /**
   * Menu items
   */
  @Prop() items: { name: string; action: () => void }[] = [];

  @Watch('currentIndex')
  onIndexChange(index: number) {
    this.listItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);

      if (i === index) {
        item.focus();
      }
    });
  }

  @Watch('menuVisible')
  onVisibilityChange(visible: boolean) {
    if (!visible) {
      this.listItems?.[this.currentIndex]?.blur();
      this.currentIndex = null;
    }
  }

  @Listen('keydown', { capture: true })
  handleKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();

      this.menuVisible = true;

      if (this.currentIndex === null) {
        this.currentIndex = 0;
      } else if (this.currentIndex + 1 < this.items.length) {
        this.currentIndex += 1;
      }
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();

      this.menuVisible = true;

      if (this.currentIndex === null) {
        this.currentIndex = this.items.length - 1;
      } else if (this.currentIndex > 0) {
        this.currentIndex -= 1;
      }
    }

    if (ev.key === 'Escape') {
      if (this.menuVisible) {
        this.menuVisible = false;
        this.currentIndex = null;
      }
    }

    if (ev.key === 'Enter') {
      if (this.currentIndex !== null) {
        const selectedItem = this.items[this.currentIndex];
        selectedItem.action();
        this.menuVisible = false;

        return;
      }

      this.menuVisible = true;
      this.currentIndex = 0;
    }

    if (ev.key === ' ' && this.currentIndex === null) {
      this.menuVisible = true;
      this.currentIndex = 0;
    }
  }

  @Listen('blur', { capture: true })
  handleBlur(event) {
    if ((event.relatedTarget as HTMLElement) !== this.el) {
      this._hideMenu();
    }
  }

  get listItems(): HTMLLIElement[] {
    return Array.from(this.el.shadowRoot.querySelectorAll('li'));
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
    const classes = {
      small: this.small,
    };

    return (
      <li class={classes} tabindex="-1" role="menuitem" onClick={item.action}>
        {item.name}
      </li>
    );
  };

  render() {
    const hostClasses = {
      'c-menu': true,
      'simple-host': this.simple,
      active: this.menuVisible,
      nohover: this.nohover,
      small: this.small,
    };

    const menuClasses = {
      'c-menu-list': true,
      active: this.menuVisible,
    };

    return (
      <Host class={hostClasses}>
        <button
          aria-expanded={this.menuVisible.toString()}
          aria-haspopup="true"
          aria-controls="c-menu-items"
          class={{
            'c-menu-wrapper': !this.simple,
            simple: this.simple,
          }}
          type="button"
          onClick={() => this._showMenu()}
        >
          {this.simple ? (
            <slot></slot>
          ) : (
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
          )}
        </button>

        <ul
          id="c-menu-items"
          class={menuClasses}
          role="menu"
          onClick={() => this._hideMenu()}
        >
          {this.items.map((item) => this._getListItem(item))}
        </ul>
      </Host>
    );
  }
}
