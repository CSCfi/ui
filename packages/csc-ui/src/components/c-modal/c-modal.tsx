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

  private _dialog?: HTMLDialogElement;

  /**
   * Is the modal visible
   */
  @Prop() value = false;

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
   * Z-index of the modal
   */
  @Prop() zIndex = 10;

  /**
   * Disable backdrop blur effect
   */
  @Prop() disableBackdropBlur = false;

  /**
   * Triggered when value is changed
   */
  @Event({ bubbles: false })
  changeValue: EventEmitter<boolean>;

  @State() innerValue = false;

  @State() animateModal = false;

  private _debounce = null;

  private _animationsDisabled = false;

  @Watch('value')
  onValueChange(value: boolean) {
    if (value) {
      this._handleShow();

      return;
    }

    this._handleClose();
  }

  private _backdropElement: HTMLCBackdropElement;

  private _handleBackdrop = () => {
    const existingBackdrop = document.body.querySelector('c-backdrop');

    if (!existingBackdrop) {
      const backdrop = document.createElement('c-backdrop');

      document.body.appendChild(backdrop);

      this._backdropElement = backdrop;

      return;
    }

    this._backdropElement = existingBackdrop;
  };

  private _handleShow = () => {
    requestAnimationFrame(() => {
      this._backdropElement.setAttribute(
        'disable-backdrop-blur',
        this.disableBackdropBlur.toString(),
      );

      if (!this._animationsDisabled) {
        this._dialog?.addEventListener('animationend', this._onDialogOpened);
        this._dialog?.classList.add('opening');
        this._backdropElement?.shadowRoot
          ?.querySelector('.c-backdrop')
          ?.classList.add('opening');
      }

      this._dialog?.showModal();
    });
  };

  private _onDialogOpened = () => {
    this._dialog?.removeEventListener('animationend', this._onDialogOpened);
    this._dialog?.classList.remove('opening');
  };

  private _handleClose = () => {
    if (this._animationsDisabled) {
      this._onDialogClosed();

      return;
    }

    this._dialog?.addEventListener('animationend', this._onDialogClosed);
    this._dialog?.classList.add('closing');

    this._backdropElement?.shadowRoot
      ?.querySelector('.c-backdrop')
      ?.classList.remove('opening');
    this._backdropElement?.shadowRoot
      ?.querySelector('.c-backdrop')
      ?.classList.add('closing');
  };

  private _onDialogClosed = () => {
    if (!this._animationsDisabled) {
      this._dialog?.removeEventListener('animationend', this._onDialogClosed);
      this._dialog?.classList.remove('closing');
      this._backdropElement?.shadowRoot
        ?.querySelector('.c-backdrop')
        ?.classList.remove('closing');
    }

    this._dialog?.close();

    if (!document.fullscreenElement) return;

    document.exitFullscreen();
  };

  private _handleClickOutside = () => {
    this._dialog.addEventListener('click', (e) => {
      if (e.clientX === 0 && e.clientY === 0) return;

      const dialogDimensions = this._dialog.getBoundingClientRect();

      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        if (!this.dismissable) {
          this._dialog.classList.add('nudging');

          if (this._debounce !== null) {
            clearTimeout(this._debounce);
            this._debounce = null;
          }

          this._debounce = window.setTimeout(() => {
            this._dialog.classList.remove('nudging');

            this._debounce = null;
          }, 150);

          return;
        }

        this._handleClose();
        this.changeValue.emit(false);
      }
    });
  };

  private _handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      e.preventDefault();
      this._handleClose();
      this.changeValue.emit(false);
    }
  };

  componentWillLoad() {
    this.innerValue = this.value;

    const width = isNaN(this.width as number) ? this.width : `${this.width}px`;

    this.el.style.setProperty('--_c-modal-width', `${width}`);
  }

  componentDidLoad() {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    this._animationsDisabled = query.matches;

    this._handleClickOutside();

    this._handleBackdrop();

    if (this.value) {
      this._handleShow();
    }
  }

  render() {
    const dialogStyle = {
      'z-index': `${this.zIndex}`,
    };

    const classes = {
      'backdrop-blur': !this.disableBackdropBlur,
    };

    return (
      <dialog
        ref={(el) => (this._dialog = el as HTMLDialogElement)}
        style={dialogStyle}
        class={classes}
        onKeyDown={this._handleKeyDown}
      >
        <slot></slot>
      </dialog>
    );
  }
}
