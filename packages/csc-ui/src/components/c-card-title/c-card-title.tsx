import { Component, Element, h } from '@stencil/core';
/**
 * @parent c-card
 * @slot Default slot - Card title text
 */
@Component({
  tag: 'c-card-title',
  styleUrl: 'c-card-title.scss',
  shadow: true,
})
export class CCardTitle {
  @Element() hostElement: HTMLCCardTitleElement;

  private _slotHasContent = false;

  private _isWrapped = false;

  private _resizeObserver: ResizeObserver;

  private _wrapperElement: HTMLHeadingElement;

  private _headerElement: HTMLDivElement;

  private _actionsElement: HTMLDivElement;

  private _handleResize() {
    if (!this._headerElement || !this._actionsElement) return;

    this._isWrapped =
      this._headerElement.getBoundingClientRect().top <
      this._actionsElement.getBoundingClientRect().top;

    this._wrapperElement.classList.toggle(
      'c-card-title--wrapped',
      this._isWrapped,
    );
  }

  componentWillLoad() {
    this._slotHasContent = !!this.hostElement.querySelector('[slot="actions"]');
  }

  componentDidLoad() {
    this._resizeObserver = new ResizeObserver(() => {
      this._handleResize();
    });

    this._resizeObserver.observe(this.hostElement);
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
  }

  render() {
    const classes = {
      'c-card-title': true,
      'c-card-title--actions': this._slotHasContent,
    };

    return (
      <header
        class={classes}
        ref={(el) => (this._wrapperElement = el as HTMLHeadingElement)}
      >
        <div
          class="c-card-title__header"
          ref={(el) => (this._headerElement = el as HTMLDivElement)}
        >
          <p>
            <slot></slot>
          </p>
          <div class="c-card-title__underline"></div>
        </div>

        {this._slotHasContent && (
          <div
            class="c-card-title__actions"
            ref={(el) => (this._actionsElement = el as HTMLDivElement)}
          >
            <slot name="actions"></slot>
          </div>
        )}
      </header>
    );
  }
}
