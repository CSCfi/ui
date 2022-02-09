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

@Component({
  tag: 'c-content-switcher',
  styleUrl: 'c-content-switcher.scss',
  shadow: true,
})
export class ContentSwitcher {
  @Prop({ mutable: true }) value!: number;
  /**
   * Always require a value
   *
   * @type {boolean}
   * @memberof ContentSwitcher
   */
  @Prop() mandatory: boolean = false;
  /**
   * Always require a value
   *
   * @type {boolean}
   * @memberof ContentSwitcher
   */
  @Prop() size: 'default' | 'small' = 'default';
  /**
   * Disable the content switcher
   */
  @Prop({ attribute: 'disabled' }) hostDisabled: boolean;
  @Element() el: HTMLElement;
  @Event() changeValue: EventEmitter;

  @Watch('value')
  watchPropHandler(value: number) {
    if (value || value === 0) {
      /* @ts-ignore */
      this.buttons[value].outlined = false;
    }

    this.changeValue.emit(value);
  }

  @Listen('click')
  onHandleClickEvent(ev) {
    const clickStack = ev.composedPath();
    const switcher = clickStack.find((e) => e.tagName === 'C-CONTENT-SWITCHER');
    const button = clickStack.find((e) => e.tagName === 'C-BUTTON');

    if (!button || !switcher) return;

    const { index } = button.dataset;

    if (+index === this.value && this.mandatory) return;

    switcher.childNodes.forEach((btn: HTMLElement) => {
      /* @ts-ignore */
      btn.outlined = true;
    });

    this.value = this.value === +index ? null : +index;
  }

  get buttons() {
    return this.el.childNodes;
  }

  componentDidRender() {
    this.buttons.forEach((button: HTMLElement, index) => {
      button.setAttribute('data-index', String(index));

      /* @ts-ignore */
      button.noRadius = true;
      /* @ts-ignore */
      button.fit = true;
      /* @ts-ignore */
      button.disabled = this.hostDisabled;
      /* @ts-ignore */
      button.dense = this.size === 'small';

      if (index !== this.value) {
        /* @ts-ignore */
        button.outlined = true;
      }

      const buttonElement = button.shadowRoot.querySelector('.csc-button');

      buttonElement.classList.add('grouped');
    });
  }

  valueChangedHandler(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.value = +value;
    this.changeValue.emit(+value);
  }

  render() {
    const classes = {
      'c-content-switcher': true,
      'c-content-switcher--disabled': this.hostDisabled,
    };

    return (
      <div class={classes}>
        <slot></slot>
      </div>
    );
  }
}
