import { Component, Element, Host, Prop, State, h, Listen, Event, EventEmitter } from '@stencil/core';
import { mdiChevronDown } from '@mdi/js';

@Component({
  tag: 'c-select',
  styleUrl: 'select.css',
  shadow: true
})
export class Select {
  @Prop() label: string;
  @Prop() dense: boolean;
  @Prop() name: string;
  @Prop() required: boolean = null;
  @Prop({ mutable: true }) value: any = null;
  @Element() host: HTMLElement;
  @State() menuVisible: boolean = false;
  @State() currentIndex: number = null;
  @Prop() items: any[] = [
    { name: 'Default 1', value: 'default1' },
    { name: 'Second 2', value: 'default2' },
    { name: 'Default 3', value: 'default3' },
  ];

  @Event() changeValue: EventEmitter;
  valueChangedHandler(item: any) {
    function isItem(element) {
      return element === item;
    }
    this.currentIndex = this.items.findIndex(isItem);
    this.changeValue.emit(item);
  }

  @Listen('keydown', { capture: true })
  handleKeyDown(ev: any){
    const letterNumber = /^[0-9a-zA-Z]+$/;
    if (ev.key.match(letterNumber) && ev.key.length === 1) {
      if ((Date.now() - this.lastKeyPressTime) > 3000 || this.searchString.length > 2) {
        this.searchString = ev.key;
      } else {
        this.searchString = `${this.searchString}${ev.key}`;
      }
      this.lastKeyPressTime = Date.now();
      const selectedItem = this.items.find(i => i.name.toLowerCase().includes(this.searchString));
      if (selectedItem) {
        this.value = selectedItem;
        this.valueChangedHandler(selectedItem);
      }
    }

    if (ev.key === 'Tab') {
      this.menuVisible = false;
    }

    if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      if (this.currentIndex !== null && this.currentIndex > 0){
        this.currentIndex = this.currentIndex - 1;
      }
      const selectedItem = this.items[this.currentIndex];
      this.value = selectedItem;
      this.valueChangedHandler(selectedItem);
    }

    if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      if (this.currentIndex === null) {
        this.currentIndex = 0;
      } else if (this.currentIndex + 1 < this.items.length){
        this.currentIndex = this.currentIndex + 1;
      }
      const selectedItem = this.items[this.currentIndex];
      this.value = selectedItem;
      this.valueChangedHandler(selectedItem);
    }

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (this.menuVisible === false) {
        this.menuVisible = true;
      } else {
        if (this.currentIndex === null) {
          this.currentIndex = 0;
        } else if (this.currentIndex + 1 < this.items.length){
          this.currentIndex = this.currentIndex + 1;
        }
      }
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.menuVisible = true;
      if (this.currentIndex !== null && this.currentIndex > 0){
        this.currentIndex = this.currentIndex - 1;
      } else if (this.currentIndex === 0){
        this.currentIndex = null;
      }
    }
    if (ev.keyCode === 32) {
      if (this.menuVisible === false) {
        this.menuVisible = true;
      }
    }

    if (ev.key === 'Escape') {
      if (this.menuVisible === true) {
        this.menuVisible = false;
        this.currentIndex = null;
      }
    }

    if (ev.key === 'Enter') {
      if (this.currentIndex !== null) {
        const selectedItem = this.items[this.currentIndex];
        this.value = selectedItem;
        this.valueChangedHandler(selectedItem);
        this.menuVisible = false;
      }
    }
  }

  current = null;
  lastKeyPressTime = null;
  searchString = '';

  showMenu() {
    if (this.menuVisible) {
      this.currentIndex = null;
    }
    this.menuVisible = !this.menuVisible;
  }

  select(item) {
    this.value = item;
    this.valueChangedHandler(item);
    this.menuVisible = false;
  }

  componentDidLoad() {
    const _this = this;
    window.addEventListener("click", function(event: any) {
      if (!event.target.matches('c-select')) {
        _this.menuVisible = false;
        _this.currentIndex = null;
      }
    });
  }

  getListItem = (item)=> {
    let classes = '';
    if (this.dense) {
      classes = 'dense';
    }

    if (this.items[this.currentIndex] === item) {
      classes = `${classes} active`;
    }

    return (
      <li
        id={'item_' + item.value}
        ref={el => item.ref = el as HTMLElement}
        onClick={() => this.select(item)}
        class={classes}
      >
        {item.name}
      </li>
    );
  };

  render() {
    let classes = 'c-select-wrapper';
    if (this.menuVisible) classes = `${classes} c-select-wrapper-active`;
    if (this.dense) classes = `${classes} c-select-dense`;
    return (
      <Host>
        <label id="c-select-label">
          { this.label }
          { this.required ? <span class="required"> *</span> : '' }
        </label>
        <div class="c-selections">
          <div
            class={ classes }
            onClick={() => this.showMenu()}
            ref={el => this.current = el as HTMLElement}
            tabindex="0"
            role="button"
            aria-labelledby="c-select-label"
          >
            <c-row>
              <div class="c-select-current">
                { this.value.name }
              </div>
              <svg
                width="22"
                height="22"
                fill="#222"
                viewBox="0 0 24 24"
                class={ this.menuVisible ? 'c-select-icon rotated' : 'c-select-icon'}
              >
                <path d={ mdiChevronDown } />
              </svg>
            </c-row>
          </div>
          <input
            type="hidden"
            value={ this.value.value }
            name={ this.name }
          />
          <div class="c-menu-parent" aria-expanded={this.menuVisible}>
            { this.menuVisible ? <div class="c-menu">
              {this.items.map(item => this.getListItem(item))}
            </div> : ''}
          </div>
        </div>
      </Host>
    );
  }

}
