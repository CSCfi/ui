import {
  Component,
  h,
  Element,
  Event,
  Prop,
  EventEmitter,
  Listen,
  Watch,
} from '@stencil/core';

/**
 * @group Content Selectors
 * @slot - Default slot
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
   * Emit changes to the parent
   */
  @Event() changeValue: EventEmitter;
  @Element() el: HTMLCTabsElement;

  @Watch('value')
  onExternalValueChange() {
    this._handleActiveTab();
    this.changeValue.emit(this.value);
  }

  @Listen('tabChange', { passive: true })
  tabChangeHandler(e) {
    this.value = e.detail;
  }

  @Listen('keydown', { capture: true })
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.code === 'Space') {
      this.value = (event.target as HTMLCTabElement).value;
    }
  }

  componentDidLoad() {
    this._handleActiveTab();
  }

  get tabs() {
    return Array.from(this.el.childNodes) as HTMLCTabElement[];
  }

  private _handleActiveTab() {
    this.tabs.forEach((tab: HTMLCTabElement) => {
      tab.active = tab.value === this.value;
    });
  }

  render() {
    const classes = {
      'c-tabs': true,
      'c-tabs--borderless': this.borderless,
    };

    return (
      <div class={classes}>
        <slot></slot>
      </div>
    );
  }
}
