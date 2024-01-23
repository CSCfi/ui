import {
  Component,
  h,
  Host,
  Prop,
  Element,
  Event,
  EventEmitter,
  Listen,
  Watch,
} from '@stencil/core';
import { mdiChevronRight } from '@mdi/js';

/**
 * @parent c-side-navigation
 */
@Component({
  tag: 'c-side-navigation-item',
  styleUrl: 'c-side-navigation-item.scss',
  shadow: true,
})
export class CSideNavigationItem {
  @Element() hostElement: HTMLCSideNavigationItemElement;

  /**
   * Indicate active state
   */
  @Prop() active: boolean;

  /**
   * Hyperlink url
   */
  @Prop() href: string;

  /**
   * Hyperlink target
   */
  @Prop() target: string = null;

  /**
   * Loading state
   */
  @Prop() loading = false;

  /**
   * Emit changes to the c-accordion
   * @private
   */
  @Event() itemChange: EventEmitter;

  @Listen('itemChange')
  handleChange(event: Event) {
    if (this._isSubItem) {
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();

      this.active = !this.active;
    }
  }

  @Watch('active')
  onActiveChange(active: boolean) {
    this._handleChildFocusableChange(active);
  }

  private _ariaLabel: string;

  private _isSubItem = false;

  private _handleChildFocusableChange(focusable: boolean) {
    if (!this._slotHasContent) return;

    Array.from(this.hostElement.querySelectorAll('[slot="sub-item"]')).forEach(
      (child: HTMLCSubNavigationItemElement) => {
        child.ariaHidden = (!focusable).toString();
        child.focusable = focusable;
      },
    );
  }

  private _redirect(event: KeyboardEvent | Event) {
    if (
      (event instanceof KeyboardEvent && event?.key === 'Enter') ||
      !(event instanceof KeyboardEvent)
    ) {
      if (this._isSubItem) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
      }

      this.itemChange.emit(event);

      if (!this._slotHasContent) {
        const sidenav = document.querySelector('c-side-navigation');
        sidenav.menuVisible = false;
      }

      if (this.href) {
        if (this.target) {
          window.open(this.href, this.target);
        } else {
          window.location.href = this.href;
        }
      }
    }
  }

  private _slotHasContent = false;

  private _assignSubItemSlots() {
    const subItems = this.hostElement.querySelectorAll(
      'c-side-navigation-item',
    );

    Array.from(subItems).forEach((item) => {
      item.setAttribute('slot', 'sub-item');
    });
  }

  componentWillLoad() {
    this._assignSubItemSlots();

    this._slotHasContent =
      !!this.hostElement.querySelector('[slot="sub-item"]');

    this._isSubItem = !!this.hostElement.getAttribute('slot');

    this._handleChildFocusableChange(this.active);
  }

  componentDidLoad() {
    for (const node of this.hostElement.childNodes) {
      if (node.nodeName === '#text') {
        this._ariaLabel = node.nodeValue.trim();
        break;
      }
    }

    this._handleChildClasses();
  }

  private _handleChildClasses() {
    if (!this._isSubItem) return;

    Array.from(this.hostElement.children)
      .filter((child) => child.tagName === 'C-SUB-NAVIGATION-ITEM')
      .forEach((child: HTMLCSubNavigationItemElement) => {
        child.classList.add('c-sub-navigation-item--sub-level');
      });
  }

  render() {
    const classes = {
      'c-side-navigation-item': true,
      'c-side-navigation-item--parent': this._slotHasContent,
      active: this.active,
    };

    const subNavigationClasses = {
      subnavactive: this.active,
      'sub-item': !this.active,
    };

    const a11y = {
      role: 'menuitem',
      tabindex: '0',
    };

    if (this._slotHasContent) {
      a11y['aria-expanded'] = (!!this.active)?.toString();
    } else if (this.active) {
      a11y['aria-current'] = 'page';
    }

    return (
      <Host
        {...a11y}
        class={classes}
        onClick={(e) => this._redirect(e)}
        onKeyDown={(e) => this._redirect(e)}
      >
        <div
          class={{
            'c-side-navigation-item__header': true,
            'c-side-navigation-item__header--expandable': this._slotHasContent,
          }}
        >
          {this._slotHasContent && (
            <c-icon class="svg" path={mdiChevronRight}></c-icon>
          )}
          <div class="c-side-navigation-item__slot">
            <slot></slot>
          </div>
        </div>

        {this._slotHasContent && (
          <nav
            role="menubar"
            aria-label={this._ariaLabel}
            aria-expanded={(!!this.active)?.toString()}
            class={subNavigationClasses}
          >
            <slot name="sub-item"></slot>
          </nav>
        )}

        <c-loader
          size={32}
          hide={!this.loading}
          style={{ pointerEvents: 'none' }}
        ></c-loader>
      </Host>
    );
  }
}
