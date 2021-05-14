import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-link',
  styleUrl: 'c-link.css',
  shadow: true,
})
export class CLink {
  @Prop() href: string;
  redirect() {
    if (this.href) {
      window.location.href = this.href;
    }
  }
  render() {
    return (
      <Host onClick={() => this.redirect()}>
        <slot></slot>
      </Host>
    );
  }

}
