import {
  Component,
  h,
  Element,
  Event,
  Prop,
  EventEmitter,
  Listen,
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
   * Emit changes to the parent
   */
  @Event() changeValue: EventEmitter;
  @Element() el: HTMLCTabsElement;

  @Listen('tabChange', { passive: true })
  tabChangeHandler(e) {
    this.value = e.detail;

    this._handleActiveTab();

    this.changeValue.emit(this.value);
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
    return (
      <div class="c-tabs">
        <slot></slot>
      </div>
    );
  }
}
