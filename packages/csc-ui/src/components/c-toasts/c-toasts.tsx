import {
  Component,
  Host,
  h,
  Prop,
  Element,
  Method,
  State,
} from '@stencil/core';
import { CToastMessage, CToastPosition, CToastType } from '../../types';
import { v4 as uuid } from 'uuid';

/**
 * @group Popups
 */
@Component({
  tag: 'c-toasts',
  styleUrl: 'c-toasts.css',
  shadow: true,
})
export class CToasts {
  @Element() el: HTMLCToastsElement;

  /**
   * Use absolute positioning
   */
  @Prop() absolute = false;

  /**
   * Horizontal position
   */
  @Prop() horizontal: 'left' | 'center' | 'right' = 'center';

  /**
   * Vertical position
   */
  @Prop() vertical: 'top' | 'bottom' = 'bottom';

  @State() messages: CToastMessage[] = [];

  private _getDefaultOptions = () => ({
    type: CToastType.Info,
    duration: 6000,
    persistent: false,
    indeterminate: false,
    position: CToastPosition.Fixed,
    id: uuid(),
  });

  /**
   * Add a new message
   */
  @Method()
  async addToast(message: CToastMessage) {
    requestAnimationFrame(() => {
      const defaultOptions = this._getDefaultOptions();

      this.messages = [
        ...this.messages,
        {
          ...defaultOptions,
          ...message,
          duration:
            +message?.duration > 0
              ? +message.duration
              : defaultOptions.duration,
        },
      ];
    });
  }

  /**
   * Remove a message by id (id should be specified in the addToast params)
   */
  @Method()
  async removeToast(id: string) {
    const toast = this.el.shadowRoot.querySelector(
      `#c-toast--${id}`,
    ) as HTMLCToastElement;

    toast?.closeToast();
  }

  // componentWillLoad() {
  //   this._initializeMessages(this.messages);
  // }

  // private _initializeMessages(messages: CToastMessage[]) {
  //   if (!messages.length) return;

  //   requestAnimationFrame(() => {
  //     const defaultOptions = this._getDefaultOptions();

  //     this.messages = [
  //       ...messages.map((message) => ({
  //         ...this._getDefaultOptions(),
  //         ...message,
  //         duration:
  //           +message?.duration > 0
  //             ? +message.duration
  //             : defaultOptions.duration,
  //       })),
  //     ];
  //   });
  // }

  private _onMessageClose(event: CustomEvent) {
    this._removeMessage(event.detail.id);
  }

  private _removeMessage(id: string) {
    const toast = this.el.shadowRoot.querySelector(
      `#c-toast--${id}`,
    ) as HTMLCToastElement;

    toast?.remove();

    const messageCount = this.el.shadowRoot.querySelectorAll('c-toast').length;

    if (messageCount === 0) {
      this.messages = [].slice();
    }
  }

  private _renderMessage(message: CToastMessage) {
    return (
      <c-toast
        message={message}
        onClose={(e) => this._onMessageClose(e)}
      ></c-toast>
    );
  }

  render() {
    return (
      <Host
        class={{
          absolute: this.absolute,
          [this.vertical]: true,
          [this.horizontal]: true,
        }}
      >
        {this.messages.map((message) => this._renderMessage(message))}
      </Host>
    );
  }
}
