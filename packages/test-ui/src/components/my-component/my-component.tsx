import { Component, Prop, Host, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {
  /**
   * välye
   */
  @Prop({ mutable: true }) value = false;

  @Prop() returnValue = false;
  @Prop() jokke = false;

  /**
   * poopage
   */
  @Prop() poop: { name: string; count: number };

  @Event({ bubbles: false, eventName: 'change-value' }) changeValue: EventEmitter<{ value: boolean | { name: string; count: number } }>;

  onKeijjo(e: Event) {
    console.log(`Seijjalla on ${this.poop?.count} ${this.poop?.name}a`, e, this.value, this.poop, { jokke: this.jokke, returnValue: this.returnValue });
    this.value = !this.value;
    // this.changeValue.emit({ value: this.returnValue || this.jokke ? this.poop : this.value });
    this.changeValue.emit({ value: { ...this.poop } });
  }

  render() {
    return (
      <Host>
        <div>
          <input
            class="visuallyhidden"
            type="checkbox"
            aria-checked={(!!this.value).toString()}
            checked={this.value}
            onChange={(event) => this.onKeijjo(event)}
          />

          <label>
            <div
              class="ripple"
            >
              <svg viewBox="0 0 100 100">
                {!!this.value && (
                  <path
                    class="path"
                    d="M 12 52 l 24 24 l 47 -47 l -3 -3 l -44 44 l -21 -21 l -3 3"
                  />
                )}
              </svg>
            </div>

            <div class="c-checkbox__label-content">
              <slot></slot>
            </div>
          </label>
        </div>
      </Host>
    );
  }
}
