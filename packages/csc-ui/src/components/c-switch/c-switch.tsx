import {
  Component,
  h,
  Element,
  Prop,
  State,
  Event,
  EventEmitter,
} from '@stencil/core';

@Component({
  tag: 'c-switch',
  styleUrl: 'c-switch.scss',
  shadow: true,
})
export class Switch {
  @Prop({ attribute: 'disabled' }) hostDisabled: boolean;
  @Prop({ attribute: 'id' }) hostId: string;
  @Prop({ mutable: true }) value: boolean = false;

  @Element() host: HTMLElement;
  @State() hasLabel: boolean = false;

  @Event() changeValue: EventEmitter;

  componentDidLoad() {
    const slotted = this.host.childNodes;

    this.hasLabel = slotted && slotted.length > 0;
  }

  valueChangedHandler(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).checked;

    this.value = value;
    this.changeValue.emit(value);
  }

  render() {
    const classes = {
      'c-switch': true,
      'c-switch--disabled': !!this.hostDisabled,
      'c-switch--label': this.hasLabel,
    };

    return (
      <label class={classes} htmlFor={this.hostId}>
        <div class="c-switch__input">
          <input
            id={this.hostId}
            aria-checked={this.value}
            type="checkbox"
            role="switch"
            disabled={this.hostDisabled}
            checked={this.value}
            onInput={(e) => this.valueChangedHandler(e)}
          />
          <span class="c-switch__slider"></span>
        </div>
        {this.hasLabel ? (
          <div class="c-switch__label">
            <slot></slot>
          </div>
        ) : null}
      </label>
    );
  }
}
