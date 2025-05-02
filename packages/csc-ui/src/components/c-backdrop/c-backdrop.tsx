import { Component, Host, Prop, State, Watch, h } from '@stencil/core';

/**
 * @parent None
 */
@Component({
  tag: 'c-backdrop',
  styleUrl: 'c-backdrop.scss',
  shadow: true,
})
export class CBackdrop {
  /**
   * Disable backdrop blur effect
   */
  @Prop() disableBackdropBlur = false;

  @State() blur = true;

  @Watch('disableBackdropBlur')
  onValueChange(value: boolean) {
    this.blur = !value;
  }

  render() {
    return (
      <Host>
        <div
          class={{
            'c-backdrop': true,
            'c-backdrop--blur': this.blur,
          }}
        ></div>
      </Host>
    );
  }
}
