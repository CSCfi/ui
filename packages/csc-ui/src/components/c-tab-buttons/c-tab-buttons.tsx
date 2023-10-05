import {
  Component,
  h,
  Element,
  Prop,
  Event,
  EventEmitter,
  Watch,
  Listen,
  Host,
} from '@stencil/core';

/**
 * @group Content Selectors
 * @slot Default slot - Default slot for the c-button elements
 */
@Component({
  tag: 'c-tab-buttons',
  styleUrl: 'c-tab-buttons.scss',
  shadow: true,
})
export class CTabButtons {
  /**
   * Value of tab buttons
   */
  @Prop({ mutable: true }) value: number | string = 0;

  /**
   * Always require a selection
   */
  @Prop() mandatory = false;

  /**
   * Used as controller for c-tabs
   * @private
   */
  @Prop() tabs = false;

  /**
   * Size of the buttons
   */
  @Prop() size: 'default' | 'small' = 'default';

  /**
   * Disable tab buttons
   */
  @Prop({ attribute: 'disabled' }) hostDisabled = false;

  /**
   * Emit changes to the parent
   */
  @Event({ bubbles: false }) changeValue: EventEmitter<number | string>;

  @Element() el: HTMLCTabButtonsElement;

  private _isIndexBased: boolean;

  private _focusedTabValue = this.value;

  @Watch('value')
  onValueChange(value: string | number) {
    this.buttons.forEach((button: HTMLCButtonElement) => {
      if (!button.disabled) {
        button.setAttribute('outlined', 'true');
      }
    });

    if (value !== null) {
      this.buttons.forEach((button: HTMLCButtonElement) => {
        if (!button.disabled) {
          button.setAttribute('outlined', 'true');
        }
      });

      const button =
        this.buttons.find((btn) => btn.value === value) || this.buttons[value];

      if (button) {
        button.removeAttribute('outlined');
      }
    }

    this.changeValue.emit(this.buttons[value]?.value ?? value);
  }

  @Listen('tabFocus', { passive: true })
  tabFocusHandler(event: CustomEvent) {
    event.stopPropagation();

    this._focusedTabValue = event.detail;
  }

  @Listen('keyup', { capture: true })
  handleKeyUp(event: KeyboardEvent) {
    event.stopPropagation();

    const isArrowLeft = event.key === 'ArrowLeft';
    const isArrowRight = event.key === 'ArrowRight';

    if (!isArrowRight && !isArrowLeft) return;

    const tabIndex =
      this._getTabIndex(this._focusedTabValue) ??
      +this.buttons[this._focusedTabValue]?.dataset.index;

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

    const value = isArrowLeft ? previousValue : nextValue;

    const item = this.buttons
      .find(
        (button) => button.value === value || button.dataset.index === value,
      )
      .shadowRoot.querySelector('button');

    requestAnimationFrame(() => {
      item?.focus();
    });
  }

  @Listen('tabChange', { passive: true })
  onTabChange(event: CustomEvent) {
    if (!this.tabs) event.stopPropagation();

    const isActive =
      this.value !== null &&
      (this._isIndexBased
        ? +event.detail === +this.value
        : event.detail === this.value);

    // Disable deselection if mandatory prop is set to true
    if (this.mandatory && isActive) {
      return;
    }

    const nullValue = this._isIndexBased ? null : '';
    const value = this._isIndexBased ? +event.detail : event.detail;

    this.value = isActive ? nullValue : value;
  }

  get availableValues() {
    return this.buttons.map((button) => button.value ?? button.dataset.index);
  }

  get buttons() {
    return Array.from(
      this.el.querySelectorAll(':scope > c-button'),
    ) as HTMLCButtonElement[];
  }

  private _getTabIndex(value: string | number) {
    const index = this.availableValues.findIndex(
      (buttonValue) => buttonValue === value,
    );

    return index;
  }

  componentDidLoad() {
    this._isIndexBased = this.buttons.every(
      (button) => typeof button.value === 'undefined',
    );

    this.buttons.forEach((button: HTMLCButtonElement, index) => {
      button.setAttribute('data-index', String(index));
      button.setAttribute('tabs', 'true');

      if (!button.disabled) {
        button.setAttribute('outlined', 'true');
        button.outlined = true;
      }

      button.disabled = this.hostDisabled || button.disabled;
      button.size = this.size;

      const isActive =
        this.value !== null &&
        (this._isIndexBased
          ? index === +this.value
          : button.value === this.value);

      button.shadowRoot
        .querySelector('button')
        .setAttribute('tabindex', isActive && !this.hostDisabled ? '0' : '-1');

      if (isActive) {
        button.removeAttribute('outlined');
      }
    });
  }

  render() {
    const classes = {
      'c-tab-buttons': true,
      disabled: this.hostDisabled,
    };

    return (
      <Host class={classes}>
        <slot></slot>
      </Host>
    );
  }
}
