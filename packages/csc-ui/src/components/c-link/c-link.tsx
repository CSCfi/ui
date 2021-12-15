import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-link',
  styleUrl: 'c-link.css',
  shadow: true,
})
export class CLink {
  @Prop() href: string;
  @Prop() underline: boolean;
  @Prop() target: string;

  render() {
    let classes = `${this.underline ? 'underline' : ''}`;
    return (
      <a class={classes} href={this.href} target={this.target}>
        <slot></slot>
      </a>
    );
  }

}
