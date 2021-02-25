import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-tag',
  styleUrl: 'c-tag.css',
  shadow: true,
})
export class CTag {

  @Prop() active: boolean;
  @Prop() fit: boolean;

  render() {
    return (
      <Host tabindex="0" role="button" class={ this.fit ? 'fit' : '' }>
        <div class={ this.active ? 'c-tag active' : 'c-tag' }>
          <slot></slot>
        </div>
      </Host>
    );
  }

}
