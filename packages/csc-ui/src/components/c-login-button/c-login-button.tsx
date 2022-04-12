import { Component, h, Prop } from '@stencil/core';

/**
 * @parent c-login-buttons
 */
@Component({
  tag: 'c-login-button',
  styleUrl: 'c-login-button.scss',
  shadow: true,
})
export class CLoginButton {
  /**
   * Login provider link
   */
  @Prop() href = '';

  /**
   * Login provider logo url
   */
  @Prop() src = '';

  /**
   * Alt description for logo
   */
  @Prop() alt = '';

  render() {
    return (
      <a style={{ backgroundImage: this.src }} href={this.href}>
        <img src={this.src} alt={this.alt} />
        <div>
          <slot></slot>
        </div>
      </a>
    );
  }
}
