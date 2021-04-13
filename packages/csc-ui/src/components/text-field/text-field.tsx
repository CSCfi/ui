import { Component, Prop, Host, h, EventEmitter, Event, State, Watch } from '@stencil/core';

@Component({
  tag: 'c-text-field',
  styleUrl: 'text-field.css',
  shadow: true
})
export class TextField {
  @Prop() validate: boolean = false;
  @Watch('validate')
  validateChange(newValue: boolean) {
    if (newValue) {
      this.runValidate(true);
    }
  }
  @Prop() number: boolean;
  @Prop() disabled: boolean;
  @Prop() readonly: boolean;
  @Prop() valid: boolean = true;
  @Prop() validation: string = 'Required field';
  @Prop() required: boolean = null;
  @Prop() validateOnBlur: boolean = false;
  @Prop() label: string;
  @Prop() name: string;
  @Prop() type: string;
  @Prop() step: number = null;
  @Prop() min: number = null;
  @Prop() max: number = null;
  @Prop() rows: number = 1;
  @Prop() placeholder: string;
  @Prop({ mutable: true }) value: string;
  outerWrapperClasses = ['outer-wrapper'];
  validationClasses = ['validation-message'];
  @Event() changeValue: EventEmitter;
  @State() tick = {}
  blurred = false;

  setBlur() {
    this.blurred = true;
    if (this.validateOnBlur) {
      this.runValidate(true);
    }
  }

  handleChange(event) {
    this.value = event.target.value;
    this.changeValue.emit(event.target.value);
  }

  runValidate(forceUpdate = false) {
    this.outerWrapperClasses = this.outerWrapperClasses.filter(c => c !== 'required');
    this.validationClasses = this.validationClasses.filter(c => c !== 'show');
    if (
      (this.blurred || !this.validateOnBlur) &&
      ((this.required && !this.value) || !this.valid)
    ) {
      this.outerWrapperClasses.push('required');
      this.validationClasses.push('show');
      if (forceUpdate) {
        this.tick = {};
      }
    }
  }

  validationIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E71D32" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>;

  render() {
    this.runValidate();
    if (this.disabled) {
      this.outerWrapperClasses.push('disabled');
    } else {
      this.outerWrapperClasses = this.outerWrapperClasses.filter(c => c !== 'disabled');
    }
    let borderLabel = 'border-label';
    if (this.value !== '' || this.placeholder) {
      borderLabel += ' value-set';
    }

    const labelBlock = (<div class={borderLabel}>
      <label class="top-span" htmlFor={ this.name }>{ this.label }{ this.required ? '*' : '' }</label>
      <label class="hidden">{ this.label }{ this.required ? '*' : '' }</label>
    </div>);

    let type = 'text';
    if (this.number) {
      type = 'number';
    }
    if (this.type) {
      type = this.type;
    }

    const textInput = <input name={this.name} onBlur={() => this.setBlur()} aria-labelledby="c-text-label" disabled={this.disabled} readonly={this.readonly} type={type} min={this.min} max={this.max} step={this.step} placeholder={this.placeholder} value={this.value} onInput={(event) => this.handleChange(event)} onChange={(event) => this.handleChange(event)}/>;
    const textArea = <textarea name={this.name} onBlur={() => this.setBlur()} rows={this.rows} aria-labelledby="c-text-label" disabled={this.disabled} placeholder={this.placeholder} readonly={this.readonly} onInput={(event) => this.handleChange(event)} value={this.value}></textarea>;
    return (
      <Host>
        <div class={this.outerWrapperClasses.join(' ')}>
          { this.rows > 1 ? textArea : textInput }
          <div class="border-wrapper">
            <div class="border-left"></div>
            { this.label ? labelBlock : null }
            <div class="border-right"></div>
          </div>
        </div>
        <div class={this.validationClasses.join(' ')}>{this.validationIcon} {this.validation}</div>
      </Host>
    );
  }

}
