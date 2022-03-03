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

  @Watch('value')
  watchPropHandler(value: string | number) {
    if (value !== null) {
      this.buttons[value].outlined = false;
    }

    this.changeValue.emit(value);
  }

  @Listen('click', { passive: true })
  onHandleClickEvent(ev) {
    const clickStack = ev.composedPath();
    const switcher = clickStack.find((e) => e.tagName === 'C-TAB-BUTTONS');
    const button = clickStack.find((e) => e.tagName === 'C-BUTTON');

    if (!button || !switcher) return;

    const { index } = button.dataset;

    // Disable deselection if mandatory prop is set to true
    if (
      (this.mandatory &&
        !this._isString(this.value) &&
        +index === +this.value) ||
      (this.mandatory &&
        this._isString(this.value) &&
        button.value === this.value)
    ) {
      return;
    }

    switcher.childNodes.forEach((btn: HTMLCButtonElement) => {
      btn.outlined = true;
    });

    this.value = this.value === +index ? null : +index;
  }

  get buttons() {
    return Array.from(this.el.childNodes) as HTMLCButtonElement[];
  }

  get valueIsString() {
    return Number.isNaN(+this.value);
  }

  componentDidLoad() {
    // use 0 as value if nothing is provided
    this.value = this.value ?? 0;

    this.buttons.forEach((button: HTMLCButtonElement, index) => {
      button.setAttribute('data-index', String(index));
      button.noRadius = true;
      button.fit = true;
      button.disabled = this.hostDisabled;
      button.size = this.size;

      if (
        (!this._isString(this.value) && index !== +this.value) ||
        (this._isString(this.value) && button.value !== this.value)
      ) {
        button.outlined = true;
      }

      const buttonElement = button.shadowRoot.querySelector('.c-button');

      buttonElement.classList.add('grouped');
    });
  }

  private _isString(value) {
    return Number.isNaN(+value);
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
