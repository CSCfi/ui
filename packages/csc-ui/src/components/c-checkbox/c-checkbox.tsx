import { Component, Host, h, Listen, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'c-checkbox',
  styleUrl: 'c-checkbox.css',
  shadow: true,
})
export class CCheckbox {
  @Prop() label: string;
  @Prop() color: string;
  @Prop({ mutable: true }) checked: boolean;
  @Event() changeValue: EventEmitter;

  @Listen('keydown')
  handleKeyDown(ev: any){
    if (ev.key === ' ') {
      ev.preventDefault();
      this.toggleState();
    }
  }

  toggleState() {
    this.checked = !this.checked;
    this.changeValue.emit(this.checked);
  }

  render() {
    const classes = `c-checkbox__background csc-bg-color ${this.color}`;
    return (
      <Host>
        <div class="c-checkbox-row" onClick={() => this.toggleState()}>
          <div role="checkbox" aria-checked={this.checked} tabindex="0" aria-labelledby="c-checkbox-label" class={ this.checked ? 'active c-checkbox' : 'c-checkbox'}>
            <div class={classes}>
              <svg class="c-checkbox__checkmark" viewBox="0 0 24 24">
                <path fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"></path>
              </svg>
            </div>
          </div>
          <label id="c-checkbox-label">{ this.label }</label>
        </div>
      </Host>
    );
  }
}
