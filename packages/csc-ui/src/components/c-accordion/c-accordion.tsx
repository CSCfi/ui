import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Listen,
  Prop,
  Watch,
} from '@stencil/core';

/**
 * @group Content Selectors
 * @slot - Default slot for the c-accordion-item components
 */
@Component({
  tag: 'c-accordion',
  styleUrl: 'c-accordion.scss',
  shadow: true,
})
export class CAccordion {
  /**
   * Value of the accordion
   */
  @Prop({ mutable: true }) value!: number | string | (number | string)[];

  /**
   * Allow expanding multiple items
   */
  @Prop() multiple: boolean = false;

  /**
   * Show an outline around expanded items
   */
  @Prop() outlined: boolean = false;

  /**
   * Emit changes to the parent
   */
  @Event() changeValue: EventEmitter<number | string>;

  @Element() el: HTMLCAccordionElement;

  @Watch('value')
  watchPropHandler(value: string | number) {
    this.changeValue.emit(value);
    this._handleItemExpansion();
  }

  @Listen('itemChange', { passive: true })
  onAccordionItemChange(
    event: CustomEvent<{ value: number | string; expanded: boolean }>,
  ) {
    const { value, expanded } = event.detail;

    if (this.multiple && Array.isArray(this.value)) {
      if (expanded) {
        this.value.push(value);
      } else {
        this.value = this.value.filter((v) => v !== value);
      }
    } else {
      this.value = expanded ? value : null;
    }
  }

  get items() {
    return Array.from(this.el.childNodes) as HTMLCAccordionItemElement[];
  }

  private _handleItemExpansion() {
    for (const item of this.items) {
      item.outlined = this.outlined;
      item.expanded = Array.isArray(this.value)
        ? this.value.includes(item.value)
        : item.value === this.value;
    }
  }

  componentDidLoad() {
    this._handleItemExpansion();
  }

  render() {
    return (
      <div class="c-accordion">
        <slot></slot>
      </div>
    );
  }
}
