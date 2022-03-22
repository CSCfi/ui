import {
  Component,
  h,
  Element,
  Prop,
  Event,
  EventEmitter,
  Watch,
  Listen,
} from '@stencil/core';

/**
 * @group Content Selectors
 * @slot - Default slot for the c-button elements
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
  @Prop({ mutable: true }) value!: number | string;
  /**
   * Always require a selection
   */
  @Prop() mandatory: boolean = false;
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
  @Event() changeValue: EventEmitter<number | string>;
  @Element() el: HTMLCTabButtonsElement;

  private _isIndexBased: boolean;

  @Watch('value')
  watchPropHandler(value: string | number) {
    this.el.childNodes.forEach((button: HTMLCButtonElement) => {
      button.outlined = true;
    });

    if (value !== null) {
      const button =
        this.buttons.find((btn) => btn.value === value) || this.buttons[value];
      if (button) button.outlined = false;
    }

    this.changeValue.emit(this.buttons[value]?.value ?? value);
  }

  @Listen('click', { passive: true })
  onHandleClickEvent(ev) {
    if (this.hostDisabled) return;

    const clickStack = ev.composedPath();
    const tabs = clickStack.find((e) => e.tagName === 'C-TAB-BUTTONS');
    const button = clickStack.find((e) => e.tagName === 'C-BUTTON');

    if (!button || !tabs) return;

    const { index } = button.dataset;

    const isActive =
      this.value !== null &&
      (this._isIndexBased
        ? +index === +this.value
        : button.value === this.value);

    // Disable deselection if mandatory prop is set to true
    if (this.mandatory && isActive) {
      return;
    }

    const nullValue = this._isIndexBased ? null : '';

    this.value = isActive ? nullValue : button.value ?? +index;
  }

  get buttons() {
    return Array.from(this.el.childNodes).filter(
      (element: HTMLCButtonElement) => element.tagName === 'C-BUTTON',
    ) as HTMLCButtonElement[];
  }

  componentDidLoad() {
    // use 0 as value if nothing is provided
    this.value = this.value ?? 0;

    this._isIndexBased = this.buttons.every(
      (button) => typeof button.value === 'undefined',
    );

    this.buttons.forEach((button: HTMLCButtonElement, index) => {
      button.setAttribute('data-index', String(index));
      button.noRadius = true;
      button.fit = true;
      button.disabled = this.hostDisabled;
      button.size = this.size;

      const isActive =
        this.value !== null &&
        (this._isIndexBased
          ? index === +this.value
          : button.value === this.value);

      button.outlined = !isActive;

      const buttonElement = button.shadowRoot.querySelector('.c-button');

      buttonElement.classList.add('grouped');
    });
  }

  render() {
    const classes = {
      'c-tab-buttons': true,
      'c-tab-buttons--disabled': this.hostDisabled,
    };

    return (
      <div class={classes}>
        <slot></slot>
      </div>
    );
  }
}
