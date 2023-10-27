import { Component, Host, Prop, h } from '@stencil/core';

/**
 * @parent c-radio-group
 */
@Component({
  tag: 'c-radio',
  styleUrl: 'c-radio.scss',
  shadow: true,
})
export class CRadio {
  /**
   * Set option as checked
   */
  @Prop() checked = false;

  /**
   * Disable the radio button
   */
  @Prop() disabled = false;

  /**
   * Radio button value
   */
  @Prop() value: string;

  render() {
    return <Host></Host>;
  }
}
