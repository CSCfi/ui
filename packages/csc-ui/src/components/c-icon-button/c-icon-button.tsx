import { Component, h, Prop } from '@stencil/core';
import { createRipple } from '../../utils/utils';

/**
 * @group Buttons
 * @slot - Default slot for the icon
 */
@Component({
  tag: 'c-icon-button',
  styleUrl: 'c-icon-button.scss',
  shadow: true,
})
export class CIconButton {
  /**
   * Show a badge on top of the icon
   */
  @Prop() badge: string;

  /**
   * Text variant of the button
   */
  @Prop() text = false;

  /**
   * Inverted color for dark backgrounds
   */
  @Prop() inverted = false;

  /**
   * Outlined variant of the button
   */
  @Prop() outlined = false;

  /**
   * Ghost variant of the button
   */
  @Prop() ghost = false;

  /**
   * Disable the button
   */
  @Prop() disabled = false;

  /**
   * Size of the button
   */
  @Prop() size: 'default' | 'x-small' | 'small' = 'default';

  private _container?: HTMLDivElement;

  private _renderBadge() {
    return <div class="icon-button-badge">{this.badge}</div>;
  }

  private _outerClasses() {
    return {
      'icon-button': true,
      disabled: !!this.disabled,
      text: !!this.text,
      ghost: !!this.ghost,
      outlined: !!this.outlined,
      inverted: !!this.inverted,
      'icon-button--small': this.size === 'small',
      'icon-button--x-small': this.size === 'x-small',
    };
  }

  private _onClick = (event) => {
    createRipple(event, this._container);
  };

  render() {
    return (
      <button class={this._outerClasses()} onClick={this._onClick}>
        <div
          class="inner-container"
          ref={(el) => (this._container = el as HTMLDivElement)}
        >
          <slot></slot>
        </div>
        {this.badge && this._renderBadge()}
      </button>
    );
  }
}
