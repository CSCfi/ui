import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'c-list-item-title',
  styleUrl: 'c-list-item-title.scss',
  shadow: true,
})
export class CListItemTitle {
  /**
   * Set the title active
   */
  @Prop() active = false;

  render() {
    const classes = {
      'c-list-item-title': true,
      'c-list-item-title--active': this.active,
    };

    return (
      <Host class={classes}>
        <slot />
      </Host>
    );
  }
}
