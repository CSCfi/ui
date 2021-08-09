import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-link',
  styleUrl: 'c-link.css',
  shadow: true,
})
export class CLink {
  @Prop() href: string;
  @Prop() underline: boolean;

  redirect() {
    if (this.href) {
      window.location.href = this.href;
    }
  }
  render() {
    let classes = `${this.underline ? 'underline' : ''}`;
    return (
      <Host class={classes} onClick={() => this.redirect()}>
        <slot></slot>
      </Host>
    );
  }

}
