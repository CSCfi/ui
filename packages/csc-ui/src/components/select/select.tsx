import { Component, Element, Host, Prop, State, h, Listen, Event, EventEmitter, Watch } from '@stencil/core';
import { mdiChevronDown } from '@mdi/js';

@Component({
  tag: 'c-select',
  styleUrl: 'select.css',
  shadow: true
})
export class Select {
  @Prop() validate: boolean = false;
  @Watch('validate')
  validateChange(newValue: boolean) {
    if (newValue) {
      this.runValidate();
    }
  }
  @Prop() label: string;
  @Prop() dense: boolean;
  @Prop() shadow: boolean;
  @Prop() labelRight: boolean;
  @Prop() name: string;
  @Prop() required: boolean = null;
  @Prop() showNone: boolean = null;
  @Prop() validateOnBlur: boolean = false;
  @Prop() itemsPerPage: number;
  @Prop() placeholder = '';
  @Prop({ mutable: true }) value: any = null;
  @Element() host: HTMLElement;
  @State() menuVisible: boolean = false;
  @State() currentIndex: number = null;
  @Prop() items: any[] = [
    { name: 'Default 1', value: 'default1' },
    { name: 'Default 2', value: 'default2' },
    { name: 'Default 3', value: 'default3' },
  ];
  outerWrapperClasses = ['outer-wrapper'];
  validationClasses = ['validation-message'];

  @Event() changeValue: EventEmitter;
  valueChangedHandler(item: any) {
    function isItem(element) {
      return element.value === item.value;
    }
    this.currentIndex = this.items.findIndex(isItem);
    this.changeValue.emit({ name: item.name, value: item.value });
    // item.ref.scrollIntoView();
  }

  scrollToElement() {
    if (this.items.length > this.itemsPerPage) {
      this.items[this.currentIndex].ref.scrollIntoView();
    }
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
      const selectedItem = this.items.find(i => i.name.toLowerCase().startsWith(this.searchString));
      function isItem(element) {
        return element === selectedItem;
      }
      if (selectedItem) {
        if (this.menuVisible) {
          this.currentIndex = this.items.findIndex(isItem);
          this.scrollToElement();
        } else {
          this.value = selectedItem;
          this.valueChangedHandler(selectedItem);
        }
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
        if (this.menuVisible) {
          this.scrollToElement();
        }
      }
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.menuVisible = true;
      if (this.currentIndex !== null && this.currentIndex > 0){
        this.currentIndex = this.currentIndex - 1;
        if (this.menuVisible) {
          this.scrollToElement();
        }
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
  blurred = false;

  showMenu() {
    if (this.menuVisible) {
      this.currentIndex = null;
    }
    this.menuVisible = !this.menuVisible;
  }

  hideMenu() {
    // this.currentIndex = null;
    this.menuVisible = false;
    this.blurred = true;
  }

  select(item) {
    this.value = item;
    this.valueChangedHandler(item);
    this.menuVisible = false;
  }

  getListItem = (item)=> {
    let classes = '';
    if (this.dense) {
      classes = 'dense';
    }

    if (this.items[this.currentIndex] === item) {
      classes = `${classes} active`;
    }

    if (item.value === null) {
      classes = `${classes} none`;
    }

    let itemId = 'none';
    if (item.value) {
      itemId = item.value.replace(/[^a-zA-Z0-9-_]/g, '');
    }

    return (
      <li
        id={'item_' + itemId}
        ref={el => item.ref = el as HTMLElement}
        onClick={() => this.select(item)}
        class={classes}
      >
        {item.name}
      </li>
    );
  };

  validationIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E71D32" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>;

  runValidate() {
    if (this.required && !this.value && (this.blurred || !this.validateOnBlur)) {
      this.outerWrapperClasses.push('required');
      this.validationClasses.push('show');
    } else {
      this.outerWrapperClasses = this.outerWrapperClasses.filter(c => c !== 'required');
      this.validationClasses = this.validationClasses.filter(c => c !== 'show');
    }
  }
  render() {
    let itemsPerPageStyle = {};
    if (this.itemsPerPage && this.itemsPerPage > 0 && this.items.length > this.itemsPerPage) {
      itemsPerPageStyle = {
        'max-height': (47 * this.itemsPerPage) + 'px',
        'overflow-y': 'scroll'
      };
    }
    let borderLabel = 'border-label';
    if (this.value !== '' || this.placeholder) {
      borderLabel += ' value-set';
      this.outerWrapperClasses.push('value-set');
    }
    this.runValidate();

    const labelBlock = (<div class={borderLabel}>
      <label class="top-span" htmlFor={ this.name }>{ this.label }{ this.required ? '*' : '' }</label>
      <label class="hidden">{ this.label }{ this.required ? '*' : '' }</label>
    </div>);

    if (this.shadow) {
      this.outerWrapperClasses.push('shadow');
    }
    if (this.labelRight) {
      this.outerWrapperClasses.push('label-right');
    }
    
    return (
      <Host>
        <div
          class={this.outerWrapperClasses.join(' ')}
          tabindex="0"
          role="button"
          onBlur={() => this.hideMenu()}
          aria-labelledby="c-select-label"
        >
          <div
            onClick={() => this.showMenu()}
            ref={el => this.current = el as HTMLElement}
            class="full-width"
          >
            <div class="c-select-row">
              <slot name="pre"></slot>
              { this.items.length === 0 ? <div class='c-select-current c-menu-no-items'></div> : <div class="c-select-current">{ (this.value && this.value.name) ? this.value.name : <span>{this.placeholder}</span> }</div> }
              <slot name="post"></slot>
              <svg
                width="22"
                height="22"
                fill="#222"
                viewBox="0 0 24 24"
                class={ this.menuVisible ? 'c-select-icon rotated' : 'c-select-icon'}
              >
                <path d={ mdiChevronDown } />
              </svg>
            </div>
          </div>
          
          <input
            type="hidden"
            value={ this.value ? this.value.value : null }
            name={ this.name }
          />
          <div class="c-menu-parent" aria-expanded={this.menuVisible}>
            { this.menuVisible ? <div class="c-menu" style={itemsPerPageStyle}>
              { this.showNone ? this.getListItem({ name: 'None', value: null }) : null }
              {this.items.map(item => this.getListItem(item))}
            </div> : '' }
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
