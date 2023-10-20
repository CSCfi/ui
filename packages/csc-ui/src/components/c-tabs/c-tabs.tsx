import { mdiArrowLeft, mdiArrowRight } from '@mdi/js';
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
  State,
} from '@stencil/core';

export type CTabsJustify = 'stretch' | 'start' | 'end' | 'center';

enum ScrollDirection {
  Left = 2,
  Right = 4,
}

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
   * Justification of the children
   */
  @Prop() justify: CTabsJustify = 'stretch';

  /**
   * Mobile breakpoint in pixels
   * - affects the content stacking with the vertical tabs
   */
  @Prop() mobileBreakpoint = 640;

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

  @Watch('justify')
  onJustificationChange() {
    this._handleActiveTab();
  }

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
  tabChangeHandler(
    event: CustomEvent<{
      value: number | string;
      element: HTMLCTabElement;
    }>,
  ) {
    event.stopPropagation();

    this.value = event.detail.value;

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
      if (isBeginning) return;

      this._focusTab(previousValue);
    }

    if (isArrowRight) {
      if (isEnd) return;
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

  private _intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          this._handleOverflow();
        }, 1000);
      }
    },
    { threshold: 1 },
  );

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
    this._resizeObserver = new ResizeObserver((entries) => {
      this._handleResize(entries[0].contentRect.width);
    });

    this._resizeObserver.observe(this.el);

    this._intersectionObserver.observe(this.el);

    this.el.style.setProperty('--_c-tabs-count', this.setsize.toString());

    requestAnimationFrame(() => {
      this._handleOverflow();
    });
  }

  disconnectedCallback() {
    this._intersectionObserver.disconnect();
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

  private _previousWidth = 0;

  private _getTabIndex(value: string | number) {
    return this.availableValues.findIndex((tab) => tab === value);
  }

  private _setIndicatorTop(value: number) {
    const container = this.el.shadowRoot.querySelector(
      '.c-tabs__tabs',
    ) as HTMLDivElement;

    container.style.setProperty('--_c-tabs-indicator-top', `${value}px`);
  }

  private _setIndicatorLeft(value: number) {
    const container = this.el.shadowRoot.querySelector(
      '.c-tabs__tabs',
    ) as HTMLDivElement;

    container.style.setProperty('--_c-tabs-indicator-left', `${value}px`);
  }

  private _setIndicatorWidth(value: number) {
    const container = this.el.shadowRoot.querySelector(
      '.c-tabs__tabs',
    ) as HTMLDivElement;

    container.style.setProperty('--_c-tabs-indicator-width', value.toString());
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

            requestAnimationFrame(() => {
              if (!this.isOverflowing) return;

              const selectedTab = this.el.querySelector(
                'c-tab[aria-selected="true"]',
              ) as HTMLCTabElement;

              this._moveToTab(selectedTab);

              this._tabsTabsElement.style.setProperty(
                '--_c-tabs-transition-speed',
                '200ms',
              );
            });
          }

          if (isActive && this._isDirty) {
            tab.focus();
          }
        },
      );
    });
  }

  private _maxScrollOffset = 0;

  private _getDimensions(item: HTMLCTabElement) {
    const { x, width } = item.getBoundingClientRect();

    const { x: containerX, width: containerWidth } =
      this._tabsTabsElement.getBoundingClientRect();

    const { x: scrollerX, width: scrollerWidth } =
      this._tabsScrollElement.getBoundingClientRect();

    return {
      x,
      width,
      containerWidth,
      containerX,
      scrollerX,
      scrollerWidth,
    };
  }

  private _focusTab(value: string | number) {
    if (this._tabButtons) {
      return;
    }

    requestAnimationFrame(() => {
      const item = this.tabs.find(
        (tab) => tab.value === value,
      ) as HTMLCTabElement;

      const { x, width, containerX, containerWidth } =
        this._getDimensions(item);

      const isInView =
        x >= containerX && x + width <= containerX + containerWidth;

      if (isInView) {
        item?.focus();

        return;
      }

      this._moveToTab(item);
    });
  }

  private _handleResize(width: number) {
    if (this._moveDebounce !== null) return;

    if (this._debounce !== null) {
      clearTimeout(this._debounce);
      this._debounce = null;
    }

    this._debounce = setTimeout(() => {
      const content = this.el.shadowRoot.querySelector('.c-tabs__scroll');
      const container = this.el.shadowRoot.querySelector('.c-tabs__tabs');

      requestAnimationFrame(() => {
        if (width === this._previousWidth) return;
        this._handleOverflow();

        this.isMobile = width < this.mobileBreakpoint;

        this._maxScrollOffset =
          -1 * (content.scrollWidth - container.clientWidth);

        this._handleActiveTab();
        this._previousWidth = width;
      });
    }, 200);
  }

  private _moveIndicator(oldTab: HTMLCTabElement, newTab: HTMLCTabElement) {
    if (this._moveDebounce !== null) return;

    this._moveDebounce = setTimeout(() => {
      requestAnimationFrame(() => {
        const content = this.el.shadowRoot.querySelector(
          '.c-tabs__scroll',
        ) as HTMLDivElement;

        const container = this.el.shadowRoot.querySelector(
          '.c-tabs__tabs',
        ) as HTMLDivElement;

        if (this._initialized && !this._prefersReducedMotion) {
          container.style.setProperty('--_c-tabs-transition-speed', '200ms');
        }

        const buttonOffset = this.isOverflowing ? 36 : 4;

        const newTabWidth = newTab.offsetWidth / content.offsetWidth;

        const newTabHeight = this.vertical
          ? newTab.offsetHeight / content.offsetHeight
          : newTab.offsetHeight / content.offsetHeight;

        const newTabPosition = oldTab.compareDocumentPosition(newTab);

        let transitionWidth = 0;

        // if the new tab is to the right of down
        if (newTabPosition === ScrollDirection.Right) {
          transitionWidth = this.vertical
            ? newTab.offsetTop + newTab.offsetHeight - oldTab.offsetTop
            : newTab.offsetLeft + newTab.offsetWidth - oldTab.offsetLeft;
        } else {
          // if the tab is to the left or top
          transitionWidth = this.vertical
            ? oldTab.offsetTop + oldTab.offsetHeight - newTab.offsetTop
            : oldTab.offsetLeft + oldTab.offsetWidth - newTab.offsetLeft;

          this._setIndicatorLeft(newTab.offsetLeft - buttonOffset);
          this._setIndicatorTop(newTab.offsetTop - buttonOffset);
        }

        this._setIndicatorWidth(
          this.vertical
            ? transitionWidth / content.offsetHeight
            : transitionWidth / content.offsetWidth,
        );

        const onTransitionEnd = (event) => {
          if (event.propertyName !== 'scale') return;

          this._setIndicatorLeft(newTab.offsetLeft - buttonOffset);
          this._setIndicatorTop(newTab.offsetTop - buttonOffset);

          this._setIndicatorWidth(this.vertical ? newTabHeight : newTabWidth);

          content.removeEventListener('transitionend', onTransitionEnd);

          if (!this._initialized) {
            this.el.classList.add('c-tabs--initialized');
          }

          this._initialized = true;
        };

        content.addEventListener('transitionend', onTransitionEnd);
      });

      clearTimeout(this._moveDebounce);
      this._moveDebounce = null;
    }, 200);
  }

  private _startX = 0;

  private _touchOffset = 0;

  @State() isOverflowing = false;

  @State() isMobile = false;

  @State() scrollOffset = 0;

  @Watch('scrollOffset')
  onScrollOffsetChange(offset) {
    this._tabsTabsElement.style.setProperty(
      '--_c-tabs-scroll-position-x',
      `${offset}px`,
    );
  }

  private _handleOverflow() {
    if (this._tabButtons) {
      this.isOverflowing = false;

      return;
    }

    const content = this.el.shadowRoot.querySelector('.c-tabs__scroll');
    const container = this.el.shadowRoot.querySelector('.c-tabs__tabs');

    const contentSize = content.scrollWidth;
    const containerSize = container.clientWidth;

    this.isOverflowing = containerSize + 1 < contentSize;
  }

  private _onTouchEnd() {
    this._tabsTabsElement.style.setProperty(
      '--_c-tabs-transition-speed',
      '200ms',
    );
  }

  private _onTouchMove(event: TouchEvent) {
    if (this.vertical) return;

    event.preventDefault();

    this._tabsTabsElement.style.setProperty(
      '--_c-tabs-transition-speed',
      '0ms',
    );

    const offset =
      -1 * (this._touchOffset + this._startX - event.touches[0].clientX);

    const isInRange = offset <= 0 && offset >= this._maxScrollOffset;

    if (isInRange) {
      this.scrollOffset = offset;
    } else if (offset > 0 || !this.isOverflowing) {
      this.scrollOffset = 0;
    } else if (offset < this._maxScrollOffset) {
      this.scrollOffset = this._maxScrollOffset;
    }
  }

  private _onTouchStart(event: TouchEvent) {
    this._handleOverflow();

    if (!this.isOverflowing) return;

    this._touchOffset = this.scrollOffset * -1;
    this._startX = event.touches[0].clientX;
  }

  private _onBackClick() {
    const min = 0;

    const step = this._tabsTabsElement.clientWidth / 2;

    this.scrollOffset = Math.min(this.scrollOffset + step, min);
  }

  private _onForwardClick() {
    const max =
      (this._tabsScrollElement.scrollWidth -
        this._tabsTabsElement.clientWidth) *
      -1;

    const step = this._tabsTabsElement.clientWidth / 2;

    this.scrollOffset = Math.max(-1 * step + this.scrollOffset, max);
  }

  private _moveToTab(tab: HTMLCTabElement) {
    const onTransitionEnd = () => {
      tab?.focus();

      this._tabsScrollElement.removeEventListener(
        'transitionend',
        onTransitionEnd,
      );
    };

    requestAnimationFrame(() => {
      const tabIndex = this._getTabIndex(tab.dataset.value);
      const isFirstTab = tabIndex === 0;
      const isLastTab = tabIndex === this.availableValues.length - 1;

      if (isFirstTab) {
        this.scrollOffset = 0;

        return;
      }

      if (isLastTab) {
        this.scrollOffset = this._maxScrollOffset - 8;

        return;
      }

      const { x, width, containerWidth, containerX } = this._getDimensions(tab);

      const tabEnd = x + width;
      const containerEnd = containerX + containerWidth;

      const isOverflowingStart = x < containerX;
      const isOverflowingEnd = tabEnd > containerEnd;

      if (isOverflowingStart) {
        const tabInside = tabEnd - containerX;
        const tabOutside = tabInside - width;

        this.scrollOffset = this.scrollOffset - tabOutside + 4;
      }

      if (isOverflowingEnd) {
        this.scrollOffset -= tabEnd - containerEnd + 4;
      }
    });

    const content = this.el.shadowRoot.querySelector('.c-tabs__scroll');

    content.addEventListener('transitionend', onTransitionEnd);
  }

  render() {
    const classes = {
      'c-tabs': true,
      'c-tabs--borderless': this.borderless,
      'c-tabs--vertical': this.vertical,
      'c-tabs--overflow': this.isOverflowing,
      'c-tabs--mobile': this.isMobile,
      [`c-tabs--justify-${this.justify}`]: true,
    };

    return (
      <Host role="tablist" class={classes}>
        <div class="c-tabs__container">
          {this.isOverflowing && !this.vertical && (
            <c-icon-button
              size="x-small"
              ghost
              onClick={this._onBackClick.bind(this)}
            >
              <c-icon path={mdiArrowLeft}></c-icon>
            </c-icon-button>
          )}

          <div
            ref={(el) => (this._tabsTabsElement = el)}
            class="c-tabs__tabs"
            onTouchStart={this._onTouchStart.bind(this)}
            onTouchMove={this._onTouchMove.bind(this)}
            onTouchEnd={this._onTouchEnd.bind(this)}
          >
            <div
              ref={(el) => (this._tabsScrollElement = el)}
              class="c-tabs__scroll"
            >
              <slot></slot>
            </div>
          </div>

          {this.isOverflowing && !this.vertical && (
            <c-icon-button
              size="x-small"
              ghost
              onClick={this._onForwardClick.bind(this)}
            >
              <c-icon path={mdiArrowRight}></c-icon>
            </c-icon-button>
          )}
        </div>

        <div class="c-tabs__content">
          <slot name="items"></slot>
        </div>
      </Host>
    );
  }
}
