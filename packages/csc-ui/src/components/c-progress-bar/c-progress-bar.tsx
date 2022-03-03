import { Component, Host, h, Prop } from '@stencil/core';

/**
 * @group Indicators
 */
@Component({
  tag: 'c-progress-bar',
  styleUrl: 'c-progress-bar.scss',
  shadow: true,
})
export class CProgressBar {
  /**
   * Progress bar value in percentage (0 to 100)
   */
  @Prop() value = 0;

  /**
   * Color of the bar (valid css color)
   *
   * @default var(--csc-primary)
   */
  @Prop() color: string;

  /**
   * Indeterminate state of the progress bar
   */
  @Prop() indeterminate = false;

  private _getSafeValue() {
    if (this.value >= 0 && this.value <= 100) return this.value;

    if (this.value < 0) return 0;

    return 100;
  }

  render() {
    const style = {
      '--value': `${this._getSafeValue()}%`,
      '--bar-color': this.color ? this.color : null,
    };
    const classes = {
      'c-progress': true,
      'c-progress--indeterminate': this.indeterminate,
    };

    return (
      <Host>
        <div class={classes} style={style}>
          <div class="c-progress__bar"></div>
        </div>
        {this.indeterminate ? (
          ''
        ) : (
          <div class="c-progress__percentage">{this._getSafeValue()} %</div>
        )}
      </Host>
    );
  }
}
