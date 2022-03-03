import { Component, Host, h } from '@stencil/core';
/**
 * A container component for cookie consent
 *
 * @slot - Cookie consent content
 */
@Component({
  tag: 'c-consent',
  styleUrl: 'c-consent.scss',
  shadow: true,
})
export class CConsent {
  render() {
    return (
      <Host>
        <c-row align="center" gap={8}>
          <slot></slot>
        </c-row>
      </Host>
    );
  }
}
