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
import { registerClickOutside } from 'stencil-click-outside';
import { CMenuOption, CMenuCustomTrigger } from '../../types';

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

  @State() isInitialized = false;

  @State() menuItemsComponent: HTMLCMenuItemsElement | null = null;

  @State() scrollingParentComponent: HTMLElement | null = null;

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
   * Programmatic trigger component
   */
  @Prop() customTrigger: CMenuCustomTrigger;

  /**
   * Menu items
   */
  @Prop() items: CMenuOption[] = [];

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

        if (!selectedItem.disabled) {
          selectedItem.action();
          this.menuVisible = false;
        }

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

  get listItems(): HTMLLIElement[] {
    return Array.from(this.el.shadowRoot.querySelectorAll('li'));
  }

  private _getScrollParent(element) {
    if (!element) {
      return undefined;
    }

    let parent = element.parentNode;

    while (parent) {
      if (parent.shadowRoot === undefined) {
        parent = parent.host;
      } else {
        const { overflow, overflowX } = window.getComputedStyle(parent);

        if (
          overflowX !== 'scroll' &&
          overflow.split(' ').every((o) => o === 'auto' || o === 'scroll')
        ) {
          return parent;
        }

        parent = parent.parentNode;
      }
    }

    return document.documentElement;
  }

  private _showMenu() {
    if (this.menuVisible) {
      this.currentIndex = null;

      return;
    }

    this.menuVisible = !this.menuVisible;
    requestAnimationFrame(() => {
      const { top, left, width, height } = this.el.getBoundingClientRect();

      const initialPosition = top + height;

      this.menuItemsComponent = document.createElement('c-menu-items');

      this.menuItemsComponent.items = this.items;
      this.menuItemsComponent.small = this.small;

      this.menuItemsComponent.style.minWidth = `${width}px`;
      this.menuItemsComponent.style.left = `${left}px`;
      this.menuItemsComponent.style.top = `${initialPosition}px`;

      this.scrollingParentComponent = this._getScrollParent(this.el);

      const initialScrollPosition = this.scrollingParentComponent.scrollTop;

      this.scrollingParentComponent.onscroll = (event) => {
        const position =
          (event.target as HTMLElement).scrollTop - initialScrollPosition;
        this.menuItemsComponent.style.top = `${initialPosition - position}px`;
      };

      this.menuItemsComponent.addEventListener('close', () => this._hideMenu());

      document.body.appendChild(this.menuItemsComponent);

      this.menuItemsComponent.active = true;
    });
  }

  private _hideMenu() {
    if (!this.menuVisible) return;

    this.menuVisible = false;

    if (this.menuItemsComponent) {
      this.menuItemsComponent.removeEventListener('close', () =>
        this._hideMenu(),
      );

      this.scrollingParentComponent.onscroll = null;

      document.body.removeChild(this.menuItemsComponent);

      this.menuItemsComponent = null;
    }
  }

  private _renderCustomTrigger() {
    const props = this.customTrigger;

    const Tag = props.component.tag;
    const params = props.component.params;

    return (
      <Tag
        {...params}
        class="custom-menu-trigger"
        aria-expanded={this.menuVisible.toString()}
        aria-haspopup="true"
        aria-controls="c-menu-items"
        onClick={() => this._showMenu()}
      >
        {props.value}
      </Tag>
    );
  }

  /**
   * Prevent unstyled elements from showing in Firefox
   */
  componentDidLoad() {
    setTimeout(() => {
      this.isInitialized = true;
    }, 50);
  }

  render() {
    const hostClasses = {
      'c-menu': true,
      'simple-host': this.simple,
      active: this.menuVisible,
      nohover: this.nohover,
      small: this.small,
    };

    return (
      this.isInitialized && (
        <Host
          class={hostClasses}
          ref={(el) => registerClickOutside(this, el, () => this._hideMenu())}
        >
          {this.customTrigger ? (
            this._renderCustomTrigger()
          ) : (
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
                      this.menuVisible
                        ? 'c-select-icon rotated'
                        : 'c-select-icon'
                    }
                  >
                    <path d={mdiChevronDown} />
                  </svg>
                </div>
              )}
            </button>
          )}
        </Host>
      )
    );
  }
}
