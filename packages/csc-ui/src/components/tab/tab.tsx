import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'c-tab',
  styleUrl: 'tab.css',
  shadow: true
})
export class Tab {
  @Prop() active: boolean;

  render() {
    return (
      <Host tabindex="0" role="button">
        <div class={ this.active ? 'c-tab active' : 'c-tab' }>
          <slot></slot>
        </div>
      </Host>
    );
  }

}
