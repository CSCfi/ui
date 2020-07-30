import { Component, Prop, Host, h } from '@stencil/core';

@Component({
  tag: 'c-text-field',
  styleUrl: 'text-field.css',
  shadow: true
})
export class TextField {
  @Prop() number: boolean;
  @Prop() disabled: boolean;
  @Prop() readonly: boolean;
  @Prop() dense: boolean;
  @Prop() required: boolean = null;
  @Prop() label: string;
  @Prop() name: string;
  @Prop() step: number = null;
  @Prop() min: number = null;
  @Prop() max: number = null;
  @Prop() rows: number = 1;
  @Prop() placeholder: string;
  @Prop({ mutable: true }) value: string;

  handleChange(event) {
    this.value = event.target.value;
  }

  render() {
    let classes = this.dense ? 'text-field-wrapper text-field-dense' : 'text-field-wrapper';
    if (this.required && this.value === '') {
      classes = `${classes} required-border`;
    }
    let labelClasses = '';
    if (this.disabled) {
      classes = `${classes} text-field-disabled`;
      labelClasses = 'label-disabled';
    }
    const textInput = <input name={this.name} aria-labelledby="c-text-label" disabled={this.disabled} readonly={this.readonly} type={this.number ? 'number' : 'text'} min={this.min} max={this.max} step={this.step} placeholder={this.placeholder} value={this.value} onInput={(event) => this.handleChange(event)}/>;
    const textArea = <textarea name={this.name} rows={this.rows} aria-labelledby="c-text-label" disabled={this.disabled} placeholder={this.placeholder} readonly={this.readonly} onInput={(event) => this.handleChange(event)}>{this.value}</textarea>;
    
    return (
      <Host>
        <label id="c-text-label" class={ labelClasses } htmlFor={ this.name }>{ this.label }{ this.required ? <span class="required"> *</span> : '' }</label>
        <div class={ classes }>
          { this.rows > 1 ? textArea : textInput }
        </div>
      </Host>
    );
  }

}
