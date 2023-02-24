import {
  Component,
  Host,
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  Listen,
  State,
  Watch,
} from '@stencil/core';
import { CMenuOption } from '../../types';

/**
 * @parent none
 */
@Component({
  tag: 'c-menu-items',
  styleUrl: 'c-menu-items.scss',
  shadow: true,
})
export class CMenuItems {
  @Element() host: HTMLCMenuItemsElement;

  /**
   * Menu items
   */
  @Prop() items: CMenuOption[] = [];

  /**
   * Menu parent
   */
  @Prop() parent: HTMLCMenuElement;

  /**
   * Small variant
   */
  @Prop() small = false;

  /**
   * is active
   * @private
   */
  @Prop() index: number | null = null;

  /**
   * is active
   * @private
   */
  @Prop() active = false;

  /**
   * Triggered when menu is closed
   */
  @Event() close: EventEmitter;

  @State() currentIndex: number = null;

  @Watch('currentIndex')
  onIndexChange(index: number) {
    this.listItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);

      if (i === index) {
        item.focus();
      }
    });
  }

  @Listen('keydown', { capture: true })
  handleKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();

      if (this.currentIndex === null) {
        this.currentIndex = 0;
      } else if (this.currentIndex + 1 < this.items.length) {
        this.currentIndex += 1;
      }
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();

      if (this.currentIndex === null) {
        this.currentIndex = this.items.length - 1;
      } else if (this.currentIndex > 0) {
        this.currentIndex -= 1;
      }
    }

    if (ev.key === 'Escape') {
      this.close.emit();
      this.currentIndex = null;
    }

    if (ev.key === 'Enter') {
      if (this.currentIndex !== null) {
        const selectedItem = this.items[this.currentIndex];

        if (!selectedItem.disabled) {
          selectedItem.action();
          this.close.emit();
        }

        return;
      }

      this.currentIndex = 0;
    }

    if (ev.key === ' ' && this.currentIndex === null) {
      this.currentIndex = 0;
    }

    if (ev.key === 'Tab') {
      this.close.emit();
    }
  }

  get listItems(): HTMLLIElement[] {
    return Array.from(this.host?.shadowRoot?.querySelectorAll('li') || []);
  }

  private _renderItem = (item) => {
    const classes = {
      small: this.small,
      disabled: item.disabled,
      'icon-start': item.iconPosition === 'start',
      'icon-end': item.iconPosition === 'end',
    };

    const onItemClick = (event, item) => {
      event.stopPropagation();

      if (!item.disabled) {
        item.action();

        this.close.emit();
      }
    };

    return (
      <li
        aria-disabled={(!!item.disabled).toString()}
        class={classes}
        tabindex="-1"
        role="menuitem"
        onClick={(event) => onItemClick(event, item)}
      >
        {item.name}

        {item.icon && (
          <svg class="icon" width="20" height="20" viewBox="0 0 24 24">
            <path d={item.icon} />
          </svg>
        )}
      </li>
    );
  };

  private _handleOtsideClick() {
    this.close.emit();
  }

  componentDidLoad() {
    window.addEventListener('click', this._handleOtsideClick.bind(this), {
      once: true,
    });

    // z-index
    const styles = window.getComputedStyle(
      (this.parent.assignedSlot || this.parent).parentElement,
    );

    const zIndex = styles.getPropertyValue('z-index');

    this.host.style.zIndex = zIndex === 'auto' ? '1' : zIndex;

    this.host.shadowRoot.querySelector('li').focus();
    this.currentIndex = this.index;
  }

  render() {
    const menuClasses = {
      'c-menu-items': true,
      'c-menu-items--active': true,
    };

    return (
      <Host>
        <ul id="c-menu-items" class={menuClasses} role="menu">
          {this.items.map((item) => this._renderItem(item))}
        </ul>
      </Host>
    );
  }
}
