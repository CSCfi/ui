import { Component, Host, h } from '@stencil/core';
/**
 * Spacer component for flex containers
 * @group Layout
 */
@Component({
  tag: 'c-spacer',
  styleUrl: 'c-spacer.scss',
  shadow: true,
})
export class CSpacer {
  render() {
    return <Host></Host>;
  }
}
