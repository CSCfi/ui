import {
  Component,
  Host,
  h,
  Element,
  Event,
  EventEmitter,
  Prop,
  State,
  Listen,
  Watch,
} from '@stencil/core';
import { CMenuOption } from '../../types';
import { getScrollParent } from '../../utils';

/**
 * @parent c-menu
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
   * @private
   */
  @Prop() items: CMenuOption[] = [];

  /**
   * Small variant
   * @private
   */
  @Prop() small = false;

  /**
   * Menu is opened and positioned
   * @private
   */
  @Prop() active = false;

  /**
   * Type of parent
   * @private
   */
  @Prop() parentType = 'menu';

  /**
   * Menu parent
   * @private
   */
  @Prop() parent: HTMLCMenuElement;

  /**
   * Initial top position
   * @private
   */
  @Prop() top = 0;

  /**
   * is active
   * @private
   */
  @Prop() index: number | null = null;

  /**
   * Items per page before adding scroll
   * @private
   */
  @Prop() itemsPerPage = 6;

  /**
   * Triggered when the menu is closed
   * @private
   */
  @Event() close: EventEmitter;

  /**
   * Triggered when the menu is opened
   * @private
   */
  @Event() open: EventEmitter<{
    height: number;
    width: number;
    isInView: {
      x: boolean;
      y: boolean;
    };
  }>;

  @State() scrollingParent: Element;

  @State() isInView = true;

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
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (this.currentIndex === null) {
        this.currentIndex = 0;
      } else if (this.currentIndex + 1 < this.items.length) {
        this.currentIndex += 1;
      }
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (this.currentIndex === null) {
        this.currentIndex = this.items.length - 1;
      } else if (this.currentIndex > 0) {
        this.currentIndex -= 1;
      }
    }

    if (event.key === 'Escape') {
      this.close.emit();
      this.currentIndex = null;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (this.currentIndex !== null) {
        const item = this.items[this.currentIndex];

        if (!item.disabled) {
          item.action();
          this.close.emit();
        }

        return;
      }

      this.currentIndex = 0;
    }

    if (event.key === ' ') {
      event.preventDefault();

      if (this.currentIndex !== null) {
        const item = this.items[this.currentIndex];

        if (item?.disabled) return;

        item?.action();
      }

      this.close.emit();
    }

    if (event.key === 'Tab') {
      if (this.parentType !== 'menu' && this.currentIndex !== null) {
        const item = this.items[this.currentIndex];

        if (!item?.disabled) {
          item?.action();
        }
      }

      this.close.emit();
    }

    if (event.key === 'PageUp') {
      this.currentIndex = Math.max(0, this.currentIndex - this.itemsPerPage);
    }

    if (event.key === 'PageDown') {
      this.currentIndex = Math.min(
        this.items.length - 1,
        this.currentIndex + this.itemsPerPage,
      );
    }
  }

  private _listElement: HTMLUListElement;

  private _boundFn: () => void;

  private _boundClickFn: () => void;

  private _parentTop = 0;

  private _itemHeight = 42;

  private _itemHeightSmall = 36;

  get listItems(): HTMLLIElement[] {
    return Array.from(this.host?.shadowRoot?.querySelectorAll('li') || []);
  }

  private _handleItemsPerPage() {
    const itemHeight = this.small ? this._itemHeightSmall : this._itemHeight;

    const containerHeight = this.itemsPerPage * itemHeight + itemHeight / 2;

    this._listElement.style.maxHeight = `${containerHeight}px`;
    this._listElement.style.setProperty(
      '--_c-menu-item-height',
      `${itemHeight}px`,
    );
  }

  private _onOpen() {
    this._handleItemsPerPage();

    window.requestAnimationFrame(async () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const { bottom, right, height, width } =
        this._listElement.getBoundingClientRect();

      const { top: parentTop } = this.parent.getBoundingClientRect();

      this._parentTop = parentTop;

      this.scrollingParent = await getScrollParent(this.parent);

      this._boundFn = this._onScroll.bind(this);

      this.scrollingParent.addEventListener('scroll', this._boundFn);

      this.open.emit({
        height,
        isInView: {
          x: right < viewportWidth,
          y: bottom < viewportHeight,
        },
        width,
      });
    });
  }

  private _onScroll() {
    const { top: parentTop } = this.parent.getBoundingClientRect();

    const differenceY = this._parentTop - parentTop;

    this.host.style.top = `${this.top - differenceY}px`;
  }

  private _handleClick(event) {
    if (!event.composedPath().includes(this.host)) {
      this.close.emit();
    }
  }

  private _handleZIndex() {
    const styles = window.getComputedStyle(
      (this.parent.assignedSlot || this.parent).parentElement,
    );

    const zIndex = styles.getPropertyValue('z-index');

    this.host.style.zIndex = zIndex === 'auto' ? '1' : zIndex;
  }

  componentDidLoad() {
    this._boundClickFn = this._handleClick.bind(this);

    window.addEventListener('click', this._boundClickFn, {
      once: true,
    });

    this._handleZIndex();

    this._onOpen();

    this.currentIndex = this.index;
  }

  disconnectedCallback() {
    this.scrollingParent.removeEventListener('scroll', this._boundFn);
    window.removeEventListener('click', this._boundClickFn);
  }

  private _renderItem = (item) => {
    const classes = {
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

  render() {
    const listClasses = {
      'c-menu-items': true,
      'c-menu-items--small': this.small,
      'c-menu-items--active': this.active,
    };

    return (
      <Host>
        <ul class={listClasses} ref={(el) => (this._listElement = el)}>
          {this.items.map((item) => this._renderItem(item))}
        </ul>
      </Host>
    );
  }
}
