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
    { name: 'Default 2', value: 'default2' },
    { name: 'Default 3', value: 'default3' },
  ];

  @Event() changeValue: EventEmitter;
  valueChangedHandler(item: any) {
    this.changeValue.emit(item);
  }

  @Listen('keydown')
  handleKeyDown(ev: any){
    if (ev.key === 'ArrowDown') {
      this.menuVisible = true;
      const selectedId = ev.path[0].id;
      this.currentIndex = this.items.findIndex(i => i.value === selectedId.replace('item_', ''));
      if (this.currentIndex == null) {
        this.currentIndex = 0;
      } else if (this.currentIndex + 1 < this.items.length){
        this.currentIndex = this.currentIndex + 1;
      }
      const currentItem = this.items[this.currentIndex];
      if (currentItem && currentItem.ref) {
        currentItem.ref.focus();
      }
    }

    if (ev.key === 'ArrowUp') {
      this.menuVisible = true;
      const selectedId = ev.path[0].id;
      this.currentIndex = this.items.findIndex(i => i.value === selectedId.replace('item_', ''));
      if (this.currentIndex !== null && this.currentIndex > 0){
        this.currentIndex = this.currentIndex - 1;
        this.items[this.currentIndex].ref.focus();
      }
    }

    if (ev.key === 'Enter') {
      const selectedId = ev.path[0].id;
      if (selectedId.includes('item_')) {
        const selectedItem = this.items.find(i => i.value === selectedId.replace('item_', ''));
        this.value = selectedItem;
        this.valueChangedHandler(selectedItem);
        this.menuVisible = false;
        this.current.focus();
      }
    }
  }

  current = null;

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

    return (
      <li
        id={'item_' + item.value}
        ref={el => item.ref = el as HTMLElement}
        onClick={() => this.select(item)}
        tabindex="0"
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
