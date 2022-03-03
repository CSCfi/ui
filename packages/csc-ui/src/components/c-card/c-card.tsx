import { Component, Host, h, Prop, getAssetPath } from '@stencil/core';

export type CardBackground = 'puhti' | 'mahti' | 'allas';
/**
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
   * Background color
   */
  @Prop() backgroundColor: string = 'white';
  /**
   * Card background image for login pages of specific services
   */
  @Prop() background: CardBackground;

  private _allowedBackgrounds = ['puhti', 'mahti', 'allas'];
  render() {
    const style = {
      'background-color': this.backgroundColor,
    };

    if (this._allowedBackgrounds.includes(this.background)) {
      style['background-image'] = `url(${getAssetPath(
        `./assets/${this.background}.gif`,
      )}`;
      style['background-size'] = 'cover';
      style['background-position-y'] = 'bottom';
    }

    return (
      <Host class="elevation-1" style={style}>
        <slot></slot>
      </Host>
    );
  }
}
