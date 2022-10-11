import { Component, h, Prop } from '@stencil/core';

/**
 * @group Indicators
 * @parent c-steps
 * @slot - Default slot for the label
 */
@Component({
  tag: 'c-step',
  styleUrl: 'c-step.scss',
  shadow: false,
})
export class CStep {
  /**
   * Mark step as complete
   * @private
   */
  @Prop() complete = false;

  /**
   * Mark step as current
   * @private
   */
  @Prop() current = false;

  render() {
    const rootClasses = {
      'c-step': true,
      'c-step--complete': this.complete,
    };

    return (
      <div class={rootClasses}>
        <div class="c-step__indicator">
          {!this.complete && (
            <div
              class={{ dot: true, current: this.current }}
              onClick={() => (this.complete = true)}
            ></div>
          )}

          {this.complete && (
            <div>
              <svg viewBox="0 0 100 100">
                <path class="path" d="M12.1 52.1l24.4 24.4 53-53" />
              </svg>
            </div>
          )}
        </div>
        <div class="c-step__label">
          <slot></slot>
        </div>
      </div>
    );
  }
}
