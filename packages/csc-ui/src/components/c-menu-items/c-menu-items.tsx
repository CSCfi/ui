import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';
import { CMenuOption } from '../../types';

@Component({
  tag: 'c-menu-items',
  styleUrl: 'c-menu-items.scss',
  shadow: true,
})
export class CMenuItems {
  /**
   * Menu items
   */
  @Prop() items: CMenuOption[] = [];

  /**
   * Small variant
   */
  @Prop() small = false;

  /**
   * is active
   */
  @Prop() active = false;

  /**
   * Triggered when menu is closed
   */
  @Event() close: EventEmitter;

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
