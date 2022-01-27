import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'c-tab',
  styleUrl: 'tab.css',
  shadow: true
})
export class Tab {
  @Prop() active: boolean;
  @Prop({ attribute: 'id' }) hostId: string;

  render() {
    return (
      <Host tabindex="0" role="button">
        <div id={this.hostId} class={ this.active ? 'c-tab active' : 'c-tab' }>
          <slot></slot>
        </div>
      </Host>
    );
  }

}
