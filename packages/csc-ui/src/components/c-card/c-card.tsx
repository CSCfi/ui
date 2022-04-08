import { Component, Element, Host, h, Prop, getAssetPath } from '@stencil/core';

export type CardBackground = 'puhti' | 'mahti' | 'allas';
/**
 * @group Cards
 * @slot - Card contents
 */
@Component({
  tag: 'c-card',
  styleUrl: 'c-card.scss',
  shadow: true,
  assetsDirs: ['assets'],
})
export class CCard {
  /**
   * Card background image for login pages of specific services
   */
  @Prop() background: CardBackground;

  /**
   * Background color
   */
  @Prop() backgroundColor: string = 'white';

  @Element() host: HTMLCCardElement;

  private _allowedBackgrounds = ['puhti', 'mahti', 'allas'];

  render() {
    const style = {
      'background-color': this.backgroundColor,
    };

    const hostClasses = {
      'c-card': true,
    };

    if (this._allowedBackgrounds.includes(this.background)) {
      style['background-image'] = `url(${getAssetPath(
        `./assets/${this.background}.gif`,
      )}`;
      style['background-size'] = 'cover';
      style['background-position-y'] = 'bottom';
    }

    return (
      <Host class={hostClasses} style={style}>
        <slot></slot>
      </Host>
    );
  }
}
