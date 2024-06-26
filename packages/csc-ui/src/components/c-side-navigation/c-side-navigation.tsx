import { mdiArrowRight } from '@mdi/js';
import { Component, Host, h, Prop, Listen, Element } from '@stencil/core';
/**
 * @group Navigation
 * @slot Default slot - Default slot
 * @slot bottom - Place items at the bottom
 */
@Component({
  tag: 'c-side-navigation',
  styleUrl: 'c-side-navigation.scss',
  shadow: true,
})
export class CSideNavigation {
  /**
   * Background styles
   */
  @Prop() styles: { [key: string]: string };

  /**
   * Mobile version
   */
  @Prop() mobile: boolean;

  /**
   * Mobile version menu visibility
   */
  @Prop({ mutable: true }) menuVisible: boolean = false; // eslint-disable-line

  private _containerElement: HTMLElement;

  @Element() host: HTMLCSideNavigationElement;

  @Listen('itemChange')
  handleChange(event: Event) {
    const slotted = this.host.querySelectorAll('c-side-navigation-item');
    const target = event.target as HTMLCSideNavigationItemElement;
    const { active } = target;

    slotted.forEach((item) => {
      if (item.querySelector('c-sub-navigation-item[slot="sub-item"]')) {
        item.active = false;
      }
    });

    if (target.querySelector('[slot="sub-item"]')) {
      target.active = !active;
    } else {
      target.active = true;
    }
  }

  private _assignSubItemSlots() {
    const subItems = this.host.querySelectorAll('c-sub-navigation-item');

    Array.from(subItems).forEach((item) => {
      item.setAttribute('slot', 'sub-item');
    });
  }

  componentWillLoad() {
    this._assignSubItemSlots();
  }

  componentDidLoad() {
    const el = document.querySelector('body');

    ['click', 'keyup'].forEach((eventType) => {
      el.addEventListener(eventType, (e: MouseEvent | KeyboardEvent) => {
        if ((e.target as HTMLElement).matches('c-navigation-button')) {
          if (eventType === 'click') {
            this.menuVisible = !this.menuVisible;
          } else if (e instanceof KeyboardEvent && e.key === 'Enter') {
            this.menuVisible = !this.menuVisible;
          }
        }
      });
    });

    const addStyles = (el: HTMLElement, styles: { [key: string]: string }) =>
      Object.assign(el.style, styles);

    addStyles(this._containerElement, this.styles);
  }

  private _closeMenu() {
    this.menuVisible = false;
  }

  render() {
    const classes = {
      'c-side-navigation': true,
      'hide-menu': !this.menuVisible,
      mobile: !!this.mobile,
      desktop: !this.mobile,
    };

    const containerClasses = {
      'c-side-navigation__content': true,
      'c-side-navigation__content--hidden': !this.menuVisible,
      'c-side-navigation__content--mobile': !!this.mobile,
      'c-side-navigation__content--desktop': !this.mobile,
    };

    return (
      <Host class={{ desktop: !this.mobile }}>
        <div class={containerClasses}>
          <nav
            ref={(el) => (this._containerElement = el)}
            class={classes}
            role="menubar"
          >
            {this.mobile && (
              <div class="c-side-navigation__burger">
                <c-icon-button text inverted onClick={() => this._closeMenu()}>
                  <span class="visuallyhidden">Close sidemenu</span>
                  <c-icon path={mdiArrowRight}></c-icon>
                </c-icon-button>
              </div>
            )}

            <div
              class={{
                'c-side-navigation__wrapper': true,
                'c-side-navigation__wrapper--mobile': !!this.mobile,
              }}
            >
              <slot></slot>

              <div class="vertical-spacer"></div>

              <slot name="bottom"></slot>
            </div>
          </nav>
        </div>

        {this.menuVisible && this.mobile && (
          <div
            class="c-overlay c-fade-in"
            onClick={() => this._closeMenu()}
          ></div>
        )}
      </Host>
    );
  }
}
