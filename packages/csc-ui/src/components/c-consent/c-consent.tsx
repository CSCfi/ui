import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'c-consent',
  styleUrl: 'c-consent.css',
  shadow: true,
})
export class CConsent {

  render() {
    return (
      <Host>
        <c-row style={ { 'margin': '0', 'column-gap': '10px', 'align-items': 'center' } }>
        
          <slot></slot>
        </c-row>
      </Host>
    );
  }

}
