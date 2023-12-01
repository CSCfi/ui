import { Component, Prop, h } from '@stencil/core';
/**
 * Wrapper component for the whole page
 *
 * @group Layout
 * @slot Default slot - Contents of the page
 */
@Component({
  tag: 'c-main',
  styleUrl: 'c-main.scss',
  shadow: true,
})
export class CMain {
  /**
   * Disable the default dashboard layout
   */
  @Prop() disableLayout = false;

  render() {
    return (
      <main class={{ dashboard: !this.disableLayout }}>
        <slot></slot>
      </main>
    );
  }
}
