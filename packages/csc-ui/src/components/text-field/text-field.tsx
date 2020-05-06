import { Component, Prop, Host, h } from '@stencil/core';

@Component({
  tag: 'c-text-field',
  styleUrl: 'text-field.css',
  shadow: true
})
export class TextField {
  @Prop() number: boolean;
  @Prop() disabled: boolean;
  @Prop() dense: boolean;
  @Prop() label: string;
  @Prop() name: string;
  @Prop() step: number = null;
  @Prop() min: number = null;
  @Prop() max: number = null;
  @Prop({ mutable: true }) value: string;

  handleChange(event) {
    this.value = event.target.value;
  }

  render() {
    let classes = this.dense ? 'text-field-wrapper text-field-dense' : 'text-field-wrapper';
    let labelClasses = '';
    if (this.disabled) {
      classes = `${classes} text-field-disabled`;
      labelClasses = 'label-disabled';
    }
    return (
      <Host>
        <label class={ labelClasses } htmlFor={ this.name }>{ this.label }</label>
        <div class={ classes }>
          <input name={this.name} disabled={this.disabled} type={this.number ? 'number' : 'text'} min={this.min} max={this.max} step={this.step} value={this.value} onInput={(event) => this.handleChange(event)}/>
        </div>
      </Host>
    );
  }

}
