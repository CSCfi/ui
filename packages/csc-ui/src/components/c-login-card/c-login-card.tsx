import { Component, Element, Host, h, Prop } from '@stencil/core';

export type CLoginCardBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

/**
 * @group Cards
 * @slot - Login Card contents
 */
@Component({
  tag: 'c-login-card',
  styleUrl: 'c-login-card.scss',
  shadow: true,
})
export class CLoginCard {
  /**
   * Background position (css background-position)
   */
  @Prop() backgroundPosition = 'bottom right';

  /**
   * Mobile breakpoint in pixels
   */
  @Prop() mobileBreakpoint = 600;

  /**
   * Add colored overlay to the background image
   */
  @Prop() overlay = false;

  /**
   * Add colored overlay to the background image
   */
  @Prop() overlayBlendMode: CLoginCardBlendMode = 'multiply';

  /**
   * Background image
   */
  @Prop() src = '';

  @Element() element: HTMLCLoginCardElement;

  private _observer: ResizeObserver;

  private _cardElement: HTMLDivElement;

  componentDidLoad() {
    this._observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;

      this._cardElement.classList.toggle(
        'c-login-card--mobile',
        width <= this.mobileBreakpoint,
      );
    });

    this._observer.observe(this.element);
  }

  disconnectedCallback() {
    this._observer.disconnect();
  }

  render() {
    const style = {
      backgroundImage: `url(${this.src})`,
      backgroundPosition: this.backgroundPosition,
      '--c-login-overlay-mode': !!this.overlay && this.overlayBlendMode,
    };

    const imageClasses = {
      'c-login-card__image': true,
      'c-login-card__image--overlay': !!this.overlay,
    };

    return (
      <Host>
        <svg width="0" height="0">
          <clipPath id="myClip" clipPathUnits="objectBoundingBox">
            <path d="m0.234,0.914 c0.132,-0.026,0.286,-0.05,0.436,-0.163 c0.083,-0.063,0.152,-0.145,0.21,-0.329 c0.055,-0.172,0.072,-0.421,0.072,-0.421 h0.048 v1 h-1 v-0.057 c0,0,0.145,-0.012,0.234,-0.029" />
          </clipPath>
        </svg>

        <div
          class="c-login-card"
          ref={(el) => (this._cardElement = el as HTMLDivElement)}
        >
          <div class={imageClasses} style={style}></div>

          <div class="c-login-card__content">
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  }
}
