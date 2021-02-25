import { Component, Element, Host, Prop, State, h, Listen, Event, EventEmitter, Watch } from '@stencil/core';
import { mdiChevronDown } from '@mdi/js';

@Component({
  tag: 'c-autocomplete',
  styleUrl: 'autocomplete.css',
  shadow: true
})
export class Autocomplete {
  @Prop() label: string;
  @Prop() name: string;
  @Prop({ mutable: true }) query: any = null;
  @Prop({ mutable: true }) value: any = null;
  @Prop() dense: boolean;
  @Prop() required: boolean = null;
  @Prop() items: any[] = [
    { name: 'Default 1', value: 'default1' },
    { name: 'Default 2', value: 'default2' },
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

  @Watch('items')
  watchHandler() {
    this.currentIndex = null;
  }

  @Element() host: HTMLElement;
  @State() menuVisible: boolean = false;
  @State() currentIndex: number = null;
  outerWrapperClasses = ['outer-wrapper'];
  validationClasses = ['validation-message'];
  @Listen('keydown')
  handleKeyDown(ev: any){
    if (ev.key === 'Tab') {
      this.menuVisible = false;
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
        this.select(selectedItem);
        this.menuVisible = false;
      }
    }
  }

  current = null;
  validationIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E71D32" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>;

  showMenu() {
    if (this.menuVisible) {
      this.currentIndex = null;
    }
    this.menuVisible = !this.menuVisible;
  }
  
  handleChange(event) {
    this.menuVisible = true;
    this.query = event.target.value;
  }

  select(item) {
    this.query = item.name;
    this.value = item;
    this.valueChangedHandler(item);
    // this.menuVisible = false;
  }

  componentDidLoad() {
    const _this = this;

    window.addEventListener("click", function(event: any) {
      if (!event.target.matches('c-autocomplete')) {
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
    let borderLabel = 'border-label';
    if (this.query !== '') {
      borderLabel += ' value-set';
    }

    if (this.required && !this.value) {
      this.outerWrapperClasses.push('required');
      this.validationClasses.push('show');
    } else {
      this.outerWrapperClasses = this.outerWrapperClasses.filter(c => c !== 'required');
      this.validationClasses = this.validationClasses.filter(c => c !== 'show');
    }


    let classes = 'c-autocomplete-wrapper'
    if (this.menuVisible) classes = `${classes} c-autocomplete-wrapper-active`;
    if (this.dense) classes = `${classes} c-autocomplete-dense`;
    const labelBlock = (<div class={borderLabel}>
      <label class="top-span" htmlFor={ this.name }>{ this.label }{ this.required ? '*' : '' }</label>
      <label class="hidden">{ this.label }{ this.required ? '*' : '' }</label>
    </div>);

    return (
      <Host>
        {/* <label id="c-autocomplete-label">
          { this.label }
          { this.required ? <span class="required"> *</span> : '' }
        </label>
        <div class="c-autocomplete">
          <div
            class={ classes }
            onClick={() => this.showMenu()}
            role="button"
            aria-labelledby="c-autocomplete-label"
          >
            <c-row class="no-wrap">
              <div class="c-autocomplete-current">
                <input
                  value={this.query}
                  ref={el => this.current = el as HTMLElement}
                  aria-autocomplete="list"
                  aria-controls="c-menu-parent"
                  aria-haspopup="true"
                  onInput={(event) => this.handleChange(event)}
                />
              </div>
              <svg
                width="22"
                height="22"
                fill="#222"
                viewBox="0 0 24 24"
                class={ this.menuVisible ? 'c-autocomplete-icon rotated' : 'c-autocomplete-icon'}
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
          <div id="c-menu-parent" class="c-menu-parent" aria-expanded={this.menuVisible}>
            { this.menuVisible ? <ul class="c-menu">
              {this.items.map(item => this.getListItem(item))}
            </ul> : ''}
          </div>
        </div> */}
        <div
          class={this.outerWrapperClasses.join(' ')}
          tabindex="0"
          onClick={() => this.showMenu()}
          role="button"
          aria-labelledby="c-select-label"
        >
          <div
            class="full-width"
            role="button"
            aria-labelledby="c-autocomplete-label"
          >
            <c-row class="no-wrap">
              <div class="c-autocomplete-current">
                <input
                  value={this.query}
                  ref={el => this.current = el as HTMLElement}
                  aria-autocomplete="list"
                  aria-controls="c-menu-parent"
                  aria-haspopup="true"
                  onInput={(event) => this.handleChange(event)}
                />
              </div>
              <svg
                width="22"
                height="22"
                fill="#222"
                viewBox="0 0 24 24"
                class={ this.menuVisible ? 'c-autocomplete-icon rotated' : 'c-autocomplete-icon'}
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
          <div id="c-menu-parent" class="c-menu-parent" aria-expanded={this.menuVisible}>
            { this.menuVisible ? <ul class="c-menu">
              {this.items.map(item => this.getListItem(item))}
            </ul> : ''}
          </div>
          <div class="border-wrapper">
            <div class="border-left"></div>
            { this.label ? labelBlock : null }
            <div class="border-right"></div>
          </div>
        </div>
        <div class={this.validationClasses.join(' ')}>{this.validationIcon} Required field</div>
      </Host>
    );
  }

}
