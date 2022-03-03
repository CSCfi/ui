import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';

/**
 * @group Popups
 */
@Component({
  tag: 'c-modal',
  styleUrl: 'c-modal.scss',
  shadow: true,
})
export class CModal {
  /**
   * Is the modal visible
   */
  @Prop({ mutable: true }) value: boolean = false;
  /**
   * Not dismissed when touching/clicking outside the content
   */
  @Prop() persistent: boolean = true;
  /**
   * Triggered when value is changed
   */
  @Event() changeValue: EventEmitter<boolean>;

  private _hideModal() {
    if (this.persistent) return;
    this.value = false;
    this.changeValue.emit(this.value);
  }
  render() {
    return (
      this.value && (
        <div class="modal-wrapper">
          <div class="c-modal">
            <slot></slot>
          </div>
          <div
            class="c-overlay c-fadeIn"
            onClick={() => this._hideModal()}
          ></div>
        </div>
      )
    );
  }
}
