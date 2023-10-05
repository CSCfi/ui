import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import {
  Component,
  Element,
  Host,
  h,
  Prop,
  State,
  Method,
} from '@stencil/core';

/**
 * @group Cards
 * @slot Default slot - Card components
 */
@Component({
  tag: 'c-card',
  styleUrl: 'c-card.scss',
  shadow: true,
  assetsDirs: ['assets'],
})
export class CCard {
  /**
   * Enable the fullscreen toggle button
   */
  @Prop() fullscreen = false;

  @State() isFullscreen = false;

  @Element() host: HTMLCCardElement;

  private _toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  private _onFullscreen() {
    if (document.fullscreenElement) {
      this.exitFullscreen();

      return;
    }

    this.host.requestFullscreen();

    const modalWrapper =
      this.host.parentElement?.shadowRoot?.querySelector('.modal-wrapper');

    if (modalWrapper) {
      (modalWrapper as HTMLDivElement).style.display = this.isFullscreen
        ? 'block'
        : 'flex';
    }
  }

  componentDidLoad() {
    const title = this.host.querySelector('c-card-title');

    if (!!title && this.fullscreen) {
      title.style.marginRight = '40px';
    }

    this.host.addEventListener(
      'fullscreenchange',
      this._toggleFullscreen.bind(this),
    );
  }

  disconnectedCallback() {
    this.host.removeEventListener(
      'fullscreenchange',
      this._toggleFullscreen.bind(this),
    );
  }

  /**
   * Exit fullscreen from the outside
   */
  @Method()
  async exitFullscreen() {
    document.exitFullscreen();

    const modalWrapper =
      this.host.parentElement?.shadowRoot?.querySelector('.modal-wrapper');

    if (modalWrapper) {
      (modalWrapper as HTMLDivElement).style.display = 'flex';
    }
  }

  /**
   * Enter fullscreen from the outside
   */
  @Method()
  async enterFullscreen() {
    this.isFullscreen = true;
  }

  render() {
    const hostClasses = {
      'c-card': true,
    };

    return (
      <Host class={hostClasses}>
        {this.fullscreen && (
          <c-icon-button
            aria-hidden="true"
            class="c-card__fullscreen-toggle"
            title={this.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            text
            onClick={() => this._onFullscreen()}
          >
            <c-icon
              path={this.isFullscreen ? mdiFullscreenExit : mdiFullscreen}
            />
          </c-icon-button>
        )}
        <slot></slot>
      </Host>
    );
  }
}
