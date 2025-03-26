import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core';

/**
 * @group Form
 */
@Component({
  tag: 'c-slider',
  styleUrl: 'c-slider.scss',
  shadow: true,
})
export class CSlider {
  /**
   * Id of the element
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Id of the element
   */
  @Prop({ attribute: 'name' }) hostName: string;

  /**
   * Aria label
   */
  @Prop({ attribute: 'aria-label' }) ariaLabelInternal: string;

  /**
   * Max value
   */
  @Prop() max = '100';

  /**
   * Min value
   */
  @Prop() min = '0';

  /**
   * Step
   */
  @Prop() step = '1';

  /**
   * Value
   */
  @Prop() value: string | number = '50';

  /**
   * Unit
   */
  @Prop() unit = '%';

  /**
   * Thow ticks
   */
  @Prop() ticks = false;

  /**
   * Show tick labels
   */
  @Prop() labels = false;

  /**
   * Disable tooltip
   */
  @Prop() disableTooltip = false;

  /**
   * Label of the slider
   */
  @Prop() label: string;

  /**
   * Disable the slider
   */
  @Prop() disabled = false;

  /**
   * Segment count
   */
  @Prop() segments = '10';

  /**
   * Emit value changes to parent
   */
  @Event({ bubbles: false })
  changeValue: EventEmitter;

  @State() trackPosition: number;

  @State() tickPositions: string[] = [];

  private static _uniqueId = 0;

  private _inputElement: HTMLInputElement;

  @Watch('segments')
  onSegmentChange() {
    this._calculateTickPositions();
  }

  @Watch('value')
  onValueChange(value) {
    this._calculateTrackPosition();

    requestAnimationFrame(() => {
      this._inputElement.value = value.toString();
    });
  }

  private _formatNumber(number: number, decimals = 0) {
    return new Intl.NumberFormat('fi-FI', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(number);
  }

  private _calculateTickPositions() {
    this.tickPositions = [...new Array(+this.segments + 1)].map((_, index) => {
      const fraction = +this.max / +this.segments;

      return (index * fraction).toString();
    });
  }

  private _calculateTrackPosition() {
    this.trackPosition =
      ((+this.value - +this.min) / (+this.max - +this.min)) * 100;
  }

  private _onInput(event: Event) {
    const { value } = event.target as HTMLInputElement;

    this.changeValue.emit(typeof this.value === 'number' ? +value : value);

    this._calculateTrackPosition();
  }

  private _isActive(value: number) {
    return this.trackPosition >= (100 / +this.max) * value;
  }

  componentWillLoad() {
    CSlider._uniqueId += 1;
  }

  componentDidLoad() {
    this._calculateTrackPosition();

    this._calculateTickPositions();

    requestAnimationFrame(() => {
      this._inputElement.value = this.value.toString();
    });
  }

  render() {
    const classes = {
      'c-slider': true,
      'c-slider--labels': this.labels,
    };

    const styles = {
      '--_c-slider-position': `${this.trackPosition}`,
    };

    return (
      <Host class={classes} style={styles}>
        <div>
          {!!this.label && (
            <label class="c-slider__label">
              {!!this.label && this.label} {this.ariaLabelInternal}
            </label>
          )}

          <div class="c-slider__wrapper">
            {!this.disableTooltip && (
              <div class="c-slider__tooltip-wrapper" aria-hidden="true">
                <span
                  data-tooltip={`${this._formatNumber(+this.value)}${
                    this.unit
                  }`}
                ></span>
              </div>
            )}

            <input
              ref={(el) => (this._inputElement = el)}
              aria-label={this.ariaLabelInternal || this.label}
              aria-valuenow={this.value}
              aria-valuetext={`${this.value}${this.unit}`}
              aria-valuemin={this.min}
              aria-valuemax={this.max}
              type="range"
              name={this.hostName}
              id={this.hostId || `c-slider__${CSlider._uniqueId}`}
              min={this.min}
              max={this.max}
              step={this.step}
              disabled={this.disabled}
              onInput={(event) => this._onInput(event)}
            />
          </div>

          <div
            class={{
              'c-slider__ticks': true,
              'c-slider__ticks--disabled': this.disabled,
            }}
            aria-hidden="true"
          >
            {this.tickPositions.map((position) => (
              <span
                class={{
                  active: this._isActive(Math.round(+position)),
                  ticks: this.ticks,
                  labels: this.labels,
                }}
                data-value={this._formatNumber(Math.round(+position))}
              ></span>
            ))}
          </div>
        </div>
      </Host>
    );
  }
}
