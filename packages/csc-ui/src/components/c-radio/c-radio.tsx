import { Component, Host, h, Prop, Listen, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'c-radio',
  styleUrl: 'c-radio.css',
  shadow: true,
})
export class CRadio {
  @Prop({ mutable: true }) selected: object;
  @Prop() label: string;
  @Prop() color: string = '';
  @Prop() items: any[] = [
    { label: 'default 1', value: 0 },
    { label: 'default 2', value: 1 },
    { label: 'default 3', value: 2 },
  ];

  @Event() changeValue: EventEmitter;

  @Listen('keydown')
  handleKeyDown(ev: any){
    if (ev.key === ' ') {
      ev.preventDefault();
    }
  }

  select(item) {
    this.selected = item;
    this.changeValue.emit(item);
  }

  selectWithSpace(ev, item) {
    if (ev.key === ' ') {
      this.selected = item;
      this.changeValue.emit(item);
    }
  }

  getRadioButton = (item) => {
    const itemId = item.value.toString().replace(/[^a-zA-Z0-9-_]/g, '');

    return  (
      <div class="c-radio-row" onClick={() => this.select(item)}>
        <div class="c-radio-wrapper" role="radio" tabindex="0" aria-labelledby={itemId} aria-checked={ this.selected === item } onKeyDown={(event) => this.selectWithSpace(event, item)}>
          <div class={ this.selected === item ? `c-radio active csc-bg-color ${this.color}` : `c-radio csc-bg-color ${this.color}` }>
            <div class="c-radio-outer-circle"></div>
            <div class="c-radio-inner-circle"></div>
          </div>
        </div>
        <label class="c-radio-label" id={itemId}>{ item.label }</label>
      </div>
    );
  };

  render() {
    return (
      <Host>
        { this.label ? <label id="c-radio-group-label">{ this.label }</label> : '' }
        <div role="radiogroup" aria-labelledby="c-radio-group-label">
          { this.items.map(item => this.getRadioButton(item)) }
        </div>
      </Host>
    );
  }

}
