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
   * Width of the dialog in pixels
   *
   */
  @Prop() width = 600;

  /**
   * Triggered when value is changed
   */
  @Event({ bubbles: false }) changeValue: EventEmitter<boolean>;

  @State() innerValue = false;

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
    if (!this.dismissable) return;

    this.value = false;
    this.changeValue.emit(this.value);
  }

  componentDidLoad() {
    this.innerValue = this.value;

    this.el.style.setProperty('--c-modal-width', `${this.width}px`);
  }

  render() {
    const modalClasses = {
      'c-modal': true,
      'c-modal--show': this.value,
    };

    const overlayClasses = {
      'c-overlay': true,
      'c-overlay--show': this.value,
    };

    return (
      <div class="modal-wrapper">
        <div class={modalClasses}>
          <slot></slot>
        </div>
        <div class={overlayClasses} onClick={() => this._hideModal()}></div>
      </div>
    );
  }
}
