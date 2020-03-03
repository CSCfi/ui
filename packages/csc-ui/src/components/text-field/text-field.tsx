import { Component, Prop, Host, h } from '@stencil/core';

@Component({
  tag: 'c-text-field',
  styleUrl: 'text-field.css',
  shadow: true
})
export class TextField {
  @Prop() number: boolean;
  @Prop() label: string;
  @Prop() name: string;
  @Prop() value: string;

  render() {
    return (
      <Host>
        { this.label }
        <div class="text-field-wrapper">
          <input name={this.name} type={this.number ? 'number' : 'text'} value={this.value}/>
        </div>
      </Host>
    );
  }

}
