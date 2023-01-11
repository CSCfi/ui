import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  State,
  Watch,
  Element,
} from '@stencil/core';

/**
 * @group Popups
 */
@Component({
  tag: 'c-modal',
  styleUrl: 'c-modal.scss',
  shadow: true,
})
export class CModal {
  @Element() el: HTMLCModalElement;

  /**
   * Is the modal visible
   */
  @Prop({ mutable: true }) value = false;

  /**
   * Dismissed when touching/clicking outside the content
   */
  @Prop() dismissable = false;

  /**
   * Width of the dialog. Numeric value is considered as pixel value (400 -> 400px)
   *
   */
  @Prop() width: string | number = 600;

  /**
   * Triggered when value is changed
   */
  @Event({ bubbles: false }) changeValue: EventEmitter<boolean>;

  @State() innerValue = false;

  @State() animateModal = false;

  private _debounce = null;

  @Watch('value')
  onValueChange(value: boolean) {
    setTimeout(
      () => {
        this.innerValue = value;
        this.changeValue.emit(this.value);
      },
      value ? 0 : 500,
    );
  }

  private _hideModal() {
    if (!this.dismissable) {
      this.animateModal = true;

      if (this._debounce !== null) {
        clearTimeout(this._debounce);
        this._debounce = null;
      }

      this._debounce = window.setTimeout(() => {
        this.animateModal = false;

        this._debounce = null;
      }, 150);

      return;
    }

    this.value = false;
    this.changeValue.emit(this.value);
  }

  componentDidLoad() {
    this.innerValue = this.value;

    const width = isNaN(this.width as number) ? this.width : `${this.width}px`;

    this.el.style.setProperty('--c-modal-width', `${width}`);
  }

  render() {
    const modalClasses = {
      'c-modal': true,
      'c-modal--show': this.value,
      'c-modal--hide': !this.innerValue,
      'c-modal--animate': this.animateModal,
    };

    const overlayClasses = {
      'c-overlay': true,
      'c-overlay--hide': !this.innerValue,
      'c-overlay--show': this.value,
    };

    return (
      <div class="modal-wrapper">
        <div class={modalClasses} aria-hidden={!this.value}>
          {this.innerValue && <slot></slot>}
        </div>
        <div class={overlayClasses} onClick={() => this._hideModal()}></div>
      </div>
    );
  }
}
