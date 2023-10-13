import { Component, Host, Prop, h } from '@stencil/core';

/**
 * @group indicators
 */
@Component({
  tag: 'c-spinner',
  styleUrl: 'c-spinner.scss',
  shadow: true,
})
export class CSpinner {
  /**
   * Color of the spinner
   */
  @Prop() color = 'var(--c-primary-600)';

  /**
   * Size of the spinner
   */
  @Prop() size = 24;

  /**
   * Width of the spinner
   */
  @Prop() width = 2;

  render() {
    const iconParams = {
      cx: this.size / 2,
      cy: this.size / 2,
      r: this.size / 2 - 2,
    };

    const style = {
      '--c-size': `${this.size}px`,
      '--c-width': `${this.width}px`,
      '--c-color': this.color,
    };

    return (
      <Host class="c-spinner" style={style}>
        <svg>
          <circle {...iconParams}></circle>
        </svg>
      </Host>
    );
  }
}
