import {
  Component,
  Element,
  Host,
  h,
  Prop,
  EventEmitter,
  Event,
} from '@stencil/core';

/**
 * @parent c-tabs
 * @slot Default slot - Default slot
 */
@Component({
  tag: 'c-tab-item',
  styleUrl: 'c-tab-item.scss',
  shadow: true,
})
export class CTabItem {
  /**
   * Tab value
   */
  @Prop() value!: number | string;

  /**
   * Active
   * @private
   */
  @Prop() active = false;

  /**
   * Emit changes to the parent
   */
  @Event() contentChange: EventEmitter;

  @Element() el: HTMLCTabItemElement;

  private _resizeObserver: ResizeObserver;

  componentDidLoad() {
    this._resizeObserver = new ResizeObserver(() => {
      this._handleResize();
    });

    this._resizeObserver.observe(this.el.shadowRoot.querySelector('div'));
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
  }

  private _handleResize() {
    this.contentChange.emit();
  }

  render() {
    const attributes = {
      role: 'tabpanel',
    };

    return (
      <Host {...attributes}>
        <div class={{ active: this.active }}>
          <slot></slot>
        </div>
      </Host>
    );
  }
}
