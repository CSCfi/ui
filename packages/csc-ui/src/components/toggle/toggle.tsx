import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'c-toggle',
  styleUrl: 'toggle.css',
  shadow: true
})
export class Button {
  @Prop() color: string = 'blue';
  @Prop() fixed: boolean;
  @Prop() fit: boolean;
  @Prop() active: boolean;
  @Prop() subtitle: string;
  @Prop() description: string;

  render() {
    let classes = `c-toggle ${this.color} ${this.fixed ? 'fixed' : ''} ${this.fit ? 'fit' : ''}`;
    if (this.active) {
      classes = `${classes} active`;
    }

    let subtitle = null;
    if (this.subtitle) {
      subtitle = <div class="c-toggle-subtitle">{this.subtitle}</div>
    }
    let description = null;
    if (this.description) {
      description = <div class="c-toggle-description">{this.description}</div>
    }

    return (
      <div class={classes}>
        <div class="c-toggle-padding">
          <slot></slot>
          { subtitle }
          { description }
        </div>
      </div>
    );
  }

}
