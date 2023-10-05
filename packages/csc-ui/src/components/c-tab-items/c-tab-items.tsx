import {
  Component,
  Element,
  Host,
  Listen,
  Prop,
  h,
  Watch,
  State,
} from '@stencil/core';

/**
 * @parent c-tabs
 * @slot Default slot - Default slot
 */
@Component({
  tag: 'c-tab-items',
  styleUrl: 'c-tab-items.scss',
  shadow: true,
})
export class CTabItems {
  /**
   * Currently active tab
   */
  @Prop() value!: number | string;

  /**
   * Disable animation
   * @private
   */
  @Prop() disableAnimation = false;

  @Element() el: HTMLCTabItemsElement;

  @State() activeTab: HTMLCTabItemElement;

  @Watch('value')
  onValueChange() {
    this._setActiveTab();
  }

  @Listen('contentChange', { passive: true })
  tabContentChangeHandler(e: CustomEvent) {
    e.stopPropagation();

    this.el.style.setProperty('--c-tab-items-height', 'auto');
  }

  private _resizeObserver: ResizeObserver;

  private _debounce = null;

  private _isAnimating = false;

  private _initialized = false;

  private get _tabs() {
    return Array.from(
      this.el.querySelectorAll('c-tab-item'),
    ) as HTMLCTabItemElement[];
  }

  private _setActiveTab() {
    this._tabs.forEach((tab) => {
      if (tab.value === this.value) {
        this.activeTab = tab;
      }

      tab.classList.toggle('active', tab.value === this.value);
    });

    this.el.style.setProperty(
      '--c-tab-items-height',
      `${this.activeTab.scrollHeight}px`,
    );

    requestAnimationFrame(() => {
      this.el.style.setProperty(
        '--c-tab-items-position-left',
        `${-1 * this.activeTab.offsetLeft}px`,
      );

      if (!this.disableAnimation && !this._initialized) {
        setTimeout(() => {
          this.el.style.setProperty(
            '--c-tab-items-animation-duration',
            '300ms',
          );

          this._initialized = true;
        }, 500);
      }
    });
  }

  private _handleResize() {
    if (this._isAnimating) return;

    if (this._debounce !== null) {
      clearTimeout(this._debounce);
      this._debounce = null;
    }

    this._debounce = setTimeout(() => {
      this._setActiveTab();
    }, 50);
  }

  componentWillLoad() {
    if (this.disableAnimation) {
      this.el.style.setProperty('--c-tab-items-animation-duration', '0ms');
    }
  }

  componentDidLoad() {
    this._resizeObserver = new ResizeObserver(() => {
      this._handleResize();
    });

    this._resizeObserver.observe(this.el);
  }

  render() {
    return (
      <Host>
        <div>
          <slot></slot>
        </div>
      </Host>
    );
  }
}
