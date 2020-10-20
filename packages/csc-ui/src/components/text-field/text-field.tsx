import { Component, Prop, Host, h, State } from '@stencil/core';

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
  @Prop() valid: boolean = true;
  @Prop() required: boolean = null;
  @Prop() validateOnBlur: boolean = false;
  @Prop() label: string;
  @Prop() name: string;
  @Prop() step: number = null;
  @Prop() min: number = null;
  @Prop() max: number = null;
  @Prop() rows: number = 1;
  @Prop() placeholder: string;
  @Prop({ mutable: true }) value: string;
  @State() classes = this.dense ? 'text-field-wrapper text-field-dense' : 'text-field-wrapper';

  handleChange(event) {
    this.value = event.target.value;
  }

  validate() {
    this.classes = this.dense ? 'text-field-wrapper text-field-dense' : 'text-field-wrapper';
    if (this.validateOnBlur) {
      if ((this.required && this.value === '') || !this.valid) {
        this.classes = `${this.classes} required-border`;
        console.warn(this.classes);
      }
    }
  }

  render() {
    if (!this.validateOnBlur) {
      this.validate();
      if ((this.required && this.value === '') || !this.valid) {
        this.classes = `${this.classes} required-border`;
      }
    }
    let labelClasses = '';
    if (this.disabled) {
      this.classes = `${this.classes} text-field-disabled`;
      labelClasses = 'label-disabled';
    }
    const textInput = <input name={this.name} onBlur={() => this.validate()} aria-labelledby="c-text-label" disabled={this.disabled} readonly={this.readonly} type={this.number ? 'number' : 'text'} min={this.min} max={this.max} step={this.step} placeholder={this.placeholder} value={this.value} onInput={(event) => this.handleChange(event)}/>;
    const textArea = <textarea name={this.name} onBlur={() => this.validate()} rows={this.rows} aria-labelledby="c-text-label" disabled={this.disabled} placeholder={this.placeholder} readonly={this.readonly} onInput={(event) => this.handleChange(event)} value={this.value}></textarea>;
    
    return (
      <Host>
        <label id="c-text-label" class={ labelClasses } htmlFor={ this.name }>{ this.label }{ this.required ? <span class="required"> *</span> : '' }</label>
        <div class={ this.classes }>
          { this.rows > 1 ? textArea : textInput }
        </div>
      </Host>
    );
  }

}
