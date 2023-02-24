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

  @State() safeYPosition = 0;

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
    const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' '];

    if (!this.menuVisible && openKeys.includes(ev.key)) {
      ev.preventDefault();

      this.currentIndex = null;

      if (ev.key === 'ArrowDown') {
        this.currentIndex = 0;
      }

      if (ev.key === 'ArrowUp') {
        this.currentIndex = this.items.length - 1;
      }

      this._showMenu();
    }

    if (ev.key === 'Escape') {
      this._hideMenu();
    }
  }

  get listItems(): HTMLLIElement[] {
    return Array.from(
      this.menuItemsComponent?.shadowRoot?.querySelectorAll('li') || [],
    );
  }

  private async _getScrollParent(element): Promise<HTMLElement> {
    return new Promise((resolve) => {
      if (!element) {
        resolve(undefined);
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
            resolve(parent);
          }

          parent = parent.parentNode;
        }
      }

      resolve(document.documentElement);
    });
  }

  private _setSafeYPosition() {
    const { top, bottom } =
      this.scrollingParentComponent.getBoundingClientRect();
    const initialScrollPosition = this.scrollingParentComponent.scrollTop;
    window.requestAnimationFrame(() => {
      let overflow = 0;

      const {
        bottom: menuItemsBottom,
        height: menuItemsHeight,
        top: menuItemsTop,
      } = this.menuItemsComponent.getBoundingClientRect();

      if (this.scrollingParentComponent.tagName === 'HTML') {
        overflow = Math.max(menuItemsTop + menuItemsHeight - bottom, 0);
      } else {
        const scrollElementTop = top - initialScrollPosition;
        const scrollChildHeight =
          this.scrollingParentComponent.children[0].getBoundingClientRect()
            .height;
        const scrollElementBottom = scrollElementTop + scrollChildHeight;

        overflow = Math.max(menuItemsBottom - scrollElementBottom, 0);
      }

      if (!this.menuItemsComponent.classList.contains('safe') && !!overflow) {
        this.safeYPosition = menuItemsTop - overflow - 8;

        this.menuItemsComponent.style.top = `${this.safeYPosition}px`;

        this.menuItemsComponent.classList.add('safe');
      }
    });
  }

  private _setSafeXPosition() {
    const options = {
      root: this.scrollingParentComponent,
      rootMargin: '0px',
      threshold: 1.0,
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        const { right: menuRight } = (
          entry.target as HTMLCMenuItemsElement
        ).getBoundingClientRect();

        const { right: containerRight } =
          this.scrollingParentComponent.getBoundingClientRect();

        const overflowX = Math.max(menuRight - containerRight, 0);

        if (!!overflowX) {
          const left = parseFloat(this.menuItemsComponent.style.left);

          this.menuItemsComponent.style.left = `${left - overflowX - 8}px`;
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);

    observer.observe(this.menuItemsComponent);
  }

  private _renderMenuItems() {
    requestAnimationFrame(async () => {
      this.scrollingParentComponent = await this._getScrollParent(this.el);

      const { bottom, left, width } =
        this.el.shadowRoot.children[0].getBoundingClientRect();

      this.menuItemsComponent = document.createElement('c-menu-items');

      this.menuItemsComponent.items = this.items;
      this.menuItemsComponent.small = this.small;

      this.menuItemsComponent.style.minWidth = `${width}px`;
      this.menuItemsComponent.style.width = '160px';
      this.menuItemsComponent.style.left = `${left}px`;
      this.menuItemsComponent.style.top = `${bottom}px`;

      const initialScrollPosition = this.scrollingParentComponent.scrollTop;

      this.scrollingParentComponent.onscroll = (event) => {
        const hasBeenAdjusted =
          this.menuItemsComponent.classList.contains('safe');

        const position =
          (event.target as HTMLElement).scrollTop - initialScrollPosition;

        this.menuItemsComponent.style.top = `${
          (hasBeenAdjusted ? this.safeYPosition : bottom) - position
        }px`;
      };

      this.menuItemsComponent.addEventListener('close', () => this._hideMenu());

      document.body.appendChild(this.menuItemsComponent);

      this.menuItemsComponent.active = true;
      this.menuItemsComponent.parent = this.el;
      this.menuItemsComponent.index = this.currentIndex;

      this.menuItemsComponent.setAttribute('tabindex', '0');

      this._setSafeYPosition();

      window.requestAnimationFrame(() => {
        this.menuItemsComponent.shadowRoot.querySelector('ul').focus();

        this._setSafeXPosition();
      });
    });
  }

  private _showMenu() {
    if (this.menuVisible) {
      this.currentIndex = null;

      return;
    }

    this.menuVisible = !this.menuVisible;

    this._renderMenuItems();
  }

  private _hideMenu() {
    if (!this.menuVisible) return;

    if (this.menuItemsComponent) {
      this.menuItemsComponent.removeEventListener('close', () =>
        this._hideMenu(),
      );

      this.scrollingParentComponent.onscroll = null;

      document.body.removeChild(this.menuItemsComponent);

      this.menuItemsComponent = null;
    }

    this.menuVisible = false;
    this.currentIndex = null;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.el.shadowRoot.children[0].focus();
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
        <Host class={hostClasses}>
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
