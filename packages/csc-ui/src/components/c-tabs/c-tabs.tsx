import {
  Component,
  h,
  Host,
  Element,
  Event,
  Prop,
  EventEmitter,
  Listen,
  Watch,
} from '@stencil/core';

/**
 * @group Content Selectors
 * @slot Default slot - Default slot
 */
@Component({
  tag: 'c-tabs',
  styleUrl: 'c-tabs.scss',
  shadow: true,
})
export class CTabs {
  /**
   * Currently active tab
   */
  @Prop({ mutable: true }) value!: number | string;

  /**
   * Disable the bottom border
   */
  @Prop() borderless = false;

  /**
   * Disable animation
   */
  @Prop() disableAnimation = false;

  /**
   * Vertical tabs
   */
  @Prop() vertical = false;

  /**
   * Emit changes to the parent
   */
  @Event({ bubbles: false }) changeValue: EventEmitter;

  @Element() el: HTMLCTabsElement;

  private _tabsTabsElement: HTMLDivElement;

  private _tabsScrollElement: HTMLDivElement;

  private _initialized = false;

  private _resizeObserver: ResizeObserver;

  private _debounce = null;

  private _moveDebounce = null;

  private _isDirty = false;

  private _focusedTabValue = this.value;

  private static _uniqueId = 0;

  @Watch('value')
  onExternalValueChange() {
    this._handleActiveTab();
    this.changeValue.emit(this.value);
  }

  @Listen('tabFocus', { passive: true })
  tabFocusHandler(event: CustomEvent) {
    event.stopPropagation();

    this._focusedTabValue = event.detail;
  }

  @Listen('tabChange', { passive: true })
  tabChangeHandler(event: CustomEvent) {
    event.stopPropagation();

    this.value = event.detail;

    this._updateItemsValue();
  }

  @Listen('keydown', { capture: true })
  handleKeyDown(event: KeyboardEvent) {
    // @ts-expect-error - type of the event.target is unknown
    if (!this.tabs.includes(event.target) || event.target.disabled) return;

    if (event.key === 'Enter' || event.code === 'Space') {
      this.value = (event.target as HTMLCTabElement).value;
    }
  }

  @Listen('keyup', { capture: true })
  handleKeyUp(event: KeyboardEvent) {
    this._isDirty = true;

    // @ts-expect-error - type of the event.target is unknown
    if (!this.tabs.includes(event.target)) return;

    const isArrowLeft = event.key === 'ArrowLeft';
    const isArrowRight = event.key === 'ArrowRight';

    if (!isArrowRight && !isArrowLeft) return;

    const tabIndex = this._getTabIndex(this._focusedTabValue);

    const firstAvailableValue = this.availableValues.at(0);
    const lastAvailableValue = this.availableValues.at(-1);

    const isBeginning = this._focusedTabValue === firstAvailableValue;
    const isEnd = this._focusedTabValue === lastAvailableValue;

    const nextValue = isEnd
      ? firstAvailableValue
      : this.availableValues[tabIndex + 1];

    const previousValue = isBeginning
      ? lastAvailableValue
      : this.availableValues[tabIndex - 1];

    if (isArrowLeft) {
      this._focusTab(previousValue);
    }

    if (isArrowRight) {
      this._focusTab(nextValue);
    }
  }

  private get _prefersReducedMotion() {
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      this.disableAnimation
    );
  }

  private get _tabItems() {
    return this.el.querySelector(
      ':scope > c-tab-items',
    ) as HTMLCTabItemsElement;
  }

  private get _tabButtons() {
    return this.el.querySelector(
      ':scope > c-tab-buttons',
    ) as HTMLCTabButtonsElement;
  }

  private _updateItemsValue() {
    this.tabItems.value = this.value;

    if (this._tabButtons) {
      this._tabButtons.value = this.value;
    }
  }

  componentWillLoad() {
    CTabs._uniqueId += 1;

    this._tabItems.disableAnimation = this._prefersReducedMotion;

    // if tab buttons are used, mark them as tab controller
    if (this._tabButtons) {
      this.el.classList.add('c-tabs--buttons');
      this._tabButtons.setAttribute('tabs', 'true');
    }

    this._updateItemsValue();
  }

  componentDidLoad() {
    this._observer.observe(this.el);

    this._resizeObserver = new ResizeObserver((entries) => {
      this._handleResize(entries[0].contentRect.width);
    });

    this._resizeObserver.observe(this.el);

    this.el.style.setProperty('--_c-tabs-count', this.setsize.toString());
  }

  get tabs() {
    if (!!this._tabButtons) {
      return Array.from(
        this._tabButtons.querySelectorAll(':scope > c-button'),
      ) as HTMLCButtonElement[];
    }

    return Array.from(
      this.el.querySelectorAll(':scope > c-tab'),
    ) as HTMLCTabElement[];
  }

  get tabItems() {
    return this.el.querySelector('c-tab-items') as HTMLCTabItemsElement;
  }

  get setsize() {
    return this.tabs.length;
  }

  get availableValues() {
    return this.tabs.map((tab) => tab.value);
  }

  private _observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this._handleActiveTab();

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 1 },
  );

  private _previousWidth = 0;

  private _getTabIndex(value: string | number) {
    return this.availableValues.findIndex((tab) => tab === value);
  }

  private _setIndicatorTop(value: number) {
    this.el.style.setProperty('--_c-tabs-indicator-top', `${value}px`);
  }

  private _setIndicatorLeft(value: number) {
    this.el.style.setProperty('--_c-tabs-indicator-left', `${value}px`);
  }

  private _setIndicatorWidth(value: number) {
    this.el.style.setProperty('--_c-tabs-indicator-width', value.toString());
  }

  private _handleActiveTab() {
    requestAnimationFrame(() => {
      let position = 0;

      const oldTab =
        (this.el.querySelector('[aria-selected="true"]') as HTMLCTabElement) ??
        this.tabs[0];

      this.tabs.forEach(
        (tab: HTMLCTabElement | HTMLCButtonElement, index: number) => {
          if (!tab.disabled) {
            position += 1;
          }

          const isActive = tab.value === this.value;

          const tabId = `c-tab-${CTabs._uniqueId}-${index + 1}`;

          const tabItemId = `c-tab-item-${CTabs._uniqueId}-${index + 1}`;

          tab.setAttribute('id', tabId);
          tab.setAttribute('aria-controls', tabItemId);

          if (!this._tabButtons) {
            (tab as HTMLCTabElement).active = isActive;
          } else if (isActive) {
            this._tabButtons.value = tab.value;
          }

          const item = (
            Array.from(
              this.tabItems.querySelectorAll(':scope > c-tab-item'),
            ) as HTMLCTabItemElement[]
          ).find((child) => child.value === tab.value);

          item.setAttribute('disabled', tab.disabled.toString());

          item.setAttribute('id', tabItemId);
          item.setAttribute('aria-labelledby', tabId);
          item.active = isActive;
          item.setAttribute('active', isActive.toString());

          if (!tab.disabled) {
            tab.setAttribute('aria-posinset', position.toString());
            tab.setAttribute('setsize', this.availableValues.length.toString());
          }

          if (isActive && !this._tabButtons) {
            this._moveIndicator(
              oldTab as HTMLCTabElement,
              tab as HTMLCTabElement,
            );

            // console.log('active tab', oldTab, tab);
          }

          if (isActive && this._isDirty) {
            tab.focus();
          }
        },
      );
    });
  }

  private _focusTab(value: string | number) {
    if (this._tabButtons) {
      return;
    }

    const item = this.tabs.find((tab) => tab.value === value);

    item?.focus();
  }

  private _handleResize(width: number) {
    if (this._debounce !== null) {
      clearTimeout(this._debounce);
      this._debounce = null;
    }

    this._debounce = setTimeout(() => {
      if (width === this._previousWidth) return;

      this._handleActiveTab();
      this._previousWidth = width;
    }, 200);
  }

  private _moveIndicator(oldTab: HTMLCTabElement, newTab: HTMLCTabElement) {
    requestAnimationFrame(() => {
      if (this._initialized && !this._prefersReducedMotion) {
        this.el.style.setProperty('--_c-tabs-transition-speed', '200ms');
      }

      this._setIndicatorTop(this.el.querySelector('c-tab').offsetHeight);

      const newTabWidth = newTab.offsetWidth / this.el.offsetWidth;

      const newTabPosition = oldTab.compareDocumentPosition(newTab);

      let transitionWidth = 0;

      // if the new tab is to the right
      if (newTabPosition === 4) {
        transitionWidth =
          newTab.offsetLeft + newTab.offsetWidth - oldTab.offsetLeft;
      } else {
        // if the tab is to the left
        transitionWidth =
          oldTab.offsetLeft + oldTab.offsetWidth - newTab.offsetLeft;

        this._setIndicatorLeft(newTab.offsetLeft);
      }

      this._setIndicatorWidth(transitionWidth / this.el.offsetWidth);

      const onTransitionEnd = (event) => {
        if (event.propertyName !== 'scale') return;

        this._setIndicatorLeft(newTab.offsetLeft);

        this._setIndicatorWidth(newTabWidth);

        this.el.removeEventListener('transitionend', onTransitionEnd);

        if (!this._initialized) {
          this.el.classList.add('c-tabs--initialized');
        }

        this._initialized = true;
      };

      this.el.addEventListener('transitionend', onTransitionEnd);
    });
  }

  render() {
    const classes = {
      'c-tabs': true,
      'c-tabs--borderless': this.borderless,
    };

    return (
      <Host role="tablist" class={classes}>
        <slot></slot>

        <div>
          <slot name="items"></slot>
        </div>
      </Host>
    );
  }
}
