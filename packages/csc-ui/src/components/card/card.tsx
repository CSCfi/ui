import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-card',
  styleUrl: 'card.css',
  shadow: true
})
export class Card {
  @Prop() color: string = '';
  @Prop() pa: number = 0;
  @Prop() ma: number = 0;
  @Prop() py: number = 0;
  @Prop() px: number = 0;
  @Prop() my: number = 0;
  @Prop() mx: number = 0;
  @Prop() elevation: number = 1;
  @Prop() noRadius: boolean;

  render() {
    let classes = `elevation-${this.elevation}`;
    if (this.color !== '') {
      classes = `csc-bg-color ${this.color}`;
    }
    if (this.noRadius) {
      classes = `${classes} no-radius`;
    }
    let style = {};

    if (this.py > 0) {
      style['padding-top'] = `${this.py * 4}px`;
      style['padding-bottom'] = `${this.py * 4}px`;
    }

    if (this.px > 0) {
      style['padding-left'] = `${this.px * 4}px`;
      style['padding-right'] = `${this.px * 4}px`;
    }

    if (this.mx > 0) {
      style['margin-left'] = `${this.mx * 4}px`;
      style['margin-right'] = `${this.mx * 4}px`;
    }

    if (this.my > 0) {
      style['margin-top'] = `${this.my * 4}px`;
      style['margin-bottom'] = `${this.my * 4}px`;
    }

    if (this.pa > 0) {
      style['padding'] = `${this.pa * 4}px`;
    }

    if (this.ma > 0) {
      style['margin'] = `${this.ma * 4}px`;
    }


    return (
      <Host class={classes} style={ style }>
        <slot></slot>
      </Host>
    );
  }

}
