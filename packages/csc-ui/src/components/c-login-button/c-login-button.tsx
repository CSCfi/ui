import { Component, h, Prop } from '@stencil/core';

/**
 * @parent c-login-buttons
 * @slot default slot - Default slot
 */
@Component({
  tag: 'c-login-button',
  styleUrl: 'c-login-button.scss',
  shadow: true,
})
export class CLoginButton {
  /**
   * Login provider link. Do not set if using a javascript click handler
   */
  @Prop() href? = '';

  /**
   * Login provider logo url
   */
  @Prop() src!: string;

  /**
   * Alt description for logo
   */
  @Prop() alt = '';

  render() {
    const props = {
      tabindex: '0',
      ...(!!this.href ? { href: this.href } : {}),
    };

    return (
      <a {...props}>
        <img src={this.src || ''} alt={this.alt} />

        <div>
          <slot></slot>
        </div>
      </a>
    );
  }
}
