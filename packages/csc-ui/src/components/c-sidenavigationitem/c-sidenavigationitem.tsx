import { mdiChevronRight } from '@mdi/js';
import {
  Component,
  Host,
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
} from '@stencil/core';
/**
 * @parent c-sidenavigation
 */
@Component({
  tag: 'c-sidenavigationitem',
  styleUrl: 'c-sidenavigationitem.scss',
  shadow: true,
})
export class CSidenavigationitem {
  @Element() hostElement: HTMLCSidenavigationitemElement;
  /**
   * Indicate active state
   */
  @Prop() active: boolean;
  /**
   * Hyperlink url
   */
  @Prop() href: string;

  /**
   * Loading state
   */
  @Prop() loading = false;

  /**
   * Emit changes to the c-accordion
   * @private
   */
  @Event() itemChange: EventEmitter;
  private _redirect(event: KeyboardEvent | Event) {
    if (
      (event instanceof KeyboardEvent && event?.key === 'Enter') ||
      !(event instanceof KeyboardEvent)
    ) {
      event.stopPropagation();
      this.itemChange.emit();

      if (!this._slotHasContent) {
        const sidenav = document.querySelector('c-sidenavigation');
        sidenav.menuVisible = false;
      }

      if (this.href) {
        window.location.href = this.href;
      }
    }
  }

  private _slotHasContent = false;

  componentWillLoad() {
    this._slotHasContent = !!this.hostElement.querySelector(
      '[slot="subnavitem"]',
    );
  }

  private _getChevron() {
    if (!this._slotHasContent) return;
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" class="svg">
        <path d={mdiChevronRight} />
      </svg>
    );
  }
  render() {
    const classes = this.active && 'active';

    return (
      <Host
        tabindex="0"
        onClick={(e) => this._redirect(e)}
        onKeyDown={(e) => this._redirect(e)}
      >
        <div class={classes}>
          <div class="styleMain">
            <c-row align="center" gap={4}>
              <div class="middle">{this._getChevron()}</div>
              <slot name="main"></slot>
            </c-row>
          </div>
          <div
            aria-expanded={this.active}
            class={this.active ? 'subnavactive' : 'subnavitem'}
          >
            {this.active ? <slot name="subnavitem"></slot> : ''}
          </div>
        </div>
        <c-loader size={32} hide={!this.loading}></c-loader>
      </Host>
    );
  }
}
