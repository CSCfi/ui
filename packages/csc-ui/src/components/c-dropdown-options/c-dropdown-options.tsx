import {
  Component,
  Host,
  Prop,
  h,
  Element,
  Method,
  Watch,
  Event,
  EventEmitter,
  State,
} from '@stencil/core';
// import { DropdownOptionsItem } from './c-dropdown-options-item';

@Component({
  tag: 'c-dropdown-options',
  styleUrl: 'c-dropdown-options.scss',
  shadow: true,
})
export class CDropdownOptions {
  @Element() el: HTMLCDropdownOptionsElement;

  /**
   * Dropdown dialog element
   */
  private _dialog: HTMLDialogElement;

  private _list: HTMLUListElement;

  private _outsideClickFn: () => void;

  private _resizeObserver: ResizeObserver;

  /**
   * Items per page before adding scroll
   */
  @Prop() itemsPerPage: number;

  /**
   * Dropdown parent
   */
  @Prop() parent:
    | HTMLCSelectElement
    | HTMLCAutocompleteElement
    | HTMLCAutocomplete2Element;

  /**
   * Dropdown options
   */
  @Prop() options: NodeListOf<HTMLCOptionElement>;

  /**
   * Current index value
   */
  @Prop() index: number;

  /**
   * Triggered when option is selected
   */
  @Event() selectOption: EventEmitter;

  /**
   * Triggered when dropdown opens or closes
   */
  @Event() dropdownStateChange: EventEmitter<boolean>;

  private _inputElement: HTMLCInputElement;

  private _dummyElement: HTMLDivElement;

  private _isMobile = false;

  @State() renderedList = null;

  @State() isOpen = false;

  @Watch('options')
  optionsWatcher() {
    requestAnimationFrame(() => {
      this.renderedList = this._renderList();
    });
  }

  @Watch('isOpen')
  stateWatcher() {
    this.dropdownStateChange.emit(this.isOpen);
  }

  /**
   * Open dropdown
   */
  @Method()
  async open() {
    if (this._dialog.open) return;

    this._positionMenu();

    this._outsideClickFn = this._handleOutsideClick.bind(this);

    window.addEventListener('click', this._outsideClickFn);

    requestAnimationFrame(() => {
      this.isOpen = true;
    });
  }

  /**
   * Open dropdown
   */
  @Method()
  async close() {
    this._dialog.close();

    this.isOpen = false;

    this._inputElement.slot = 'default';

    this._inputElement.hideDetails = this._hideDetails;

    this._dummyElement.style.width = '0';
    this._dummyElement.style.display = 'none';
    this._dialog.style.width = '0';

    window.removeEventListener('click', this._outsideClickFn);
  }

  private _setIsMobile() {
    this._isMobile = window.matchMedia(
      'only screen and (max-width: 760px)',
    ).matches;
  }

  componentDidLoad() {
    this._setIsMobile();

    this._hideDetails = this.parent.hideDetails;

    this._inputElement = this.el.querySelector('c-input');

    this._resizeObserver = new ResizeObserver(() => {
      this._setIsMobile();

      if (!this._dialog.open) return;

      this.close();
    });

    this._resizeObserver.observe(window.document.body);

    requestAnimationFrame(() => {
      this.renderedList = this._renderList();
    });
  }

  /**
   * Update list items
   */
  @Method()
  async updateList() {
    requestAnimationFrame(() => {
      this.renderedList = this._renderList();
    });
  }

  private _handleOutsideClick(event) {
    if (!this.isOpen) return;

    if (!event.composedPath().includes(this._dialog)) {
      this.close();
    }
  }

  private _inputSize = {
    height: 0,
    width: 0,
  };

  private _openedOnTop = false;

  private _hideDetails = false;

  private _highlightMatchingText(value: string) {
    const { query } = this.parent as HTMLCAutocompleteElement;

    if (this.parent.tagName === 'C-SELECT' || query === '') return value;

    const regex = new RegExp(query, 'gi');

    const highlighted = value
      .replace(/(<([^>]+)>)/gi, '')
      .replace(regex, (match) => `<mark>${match}</mark>`);

    return highlighted;
  }

  private _getParentPosition() {
    return this.parent.shadowRoot
      .querySelector('.c-input__slot')
      .getBoundingClientRect();
  }

  private _positionMenu() {
    const { innerWidth, innerHeight } = window;

    requestAnimationFrame(() => {
      if (!this._isMobile) {
        const { top: parentTop, width } = this._getParentPosition();

        const inputSize = this.el.getBoundingClientRect();

        this._inputSize = {
          height: inputSize.height,
          width: inputSize.width,
        };

        this._dialog.style.width = `${width}px`;
        this._dialog.style.top = `${inputSize.top}px`;
        this._dialog.style.bottom = 'auto';
        this._dialog.style.left = `${inputSize.left}px`;

        const { bottom, right, height } = this._dialog.getBoundingClientRect();

        this._list.style.maxHeight = 'calc(100svh - 52px)';

        const isInView = {
          x: right < innerWidth,
          y: bottom < innerHeight,
        };

        const fitsOnTop = parentTop - height > 0;

        if (!fitsOnTop && !isInView.y) {
          this._dialog.style.maxHeight = `${parentTop}px`;
        }

        if (!isInView.y || this._openedOnTop) {
          this._openedOnTop = true;

          this._inputElement.hideDetails = true;
          this._inputElement.slot = 'input-slot-bottom';

          this._dialog.style.top = 'auto';
          this._dialog.style.bottom = `${innerHeight - inputSize.top - 44}px`;
          this._inputElement.scrollIntoView();
        }

        this._dummyElement.style.width = `${this.parent.clientWidth}px`;
        this._dummyElement.style.height = `${this._inputSize.height}px`;
        this._dummyElement.style.display = 'block';
      }

      this._dummyElement.slot = 'default';

      this._inputElement.slot = 'input-top';

      this._inputElement.hideDetails = true;

      this._dialog.showModal();
    });
  }

  private _renderList() {
    if (!this.options) return '';

    const options = Array.from(this.options);

    return options.map((option) => {
      const optionValue = option.querySelector('c-option-value');

      if (optionValue) {
        optionValue.innerHTML = this._highlightMatchingText(
          optionValue.textContent,
        );
      }

      return (
        <li
          onClick={(event) => {
            if (option.disabled) {
              event.preventDefault();

              return;
            }

            this.selectOption.emit({ name: option.name, value: option.value });
          }}
          innerHTML={option.outerHTML}
        ></li>
      );
    });
  }

  render() {
    if (
      this._dialog &&
      this.itemsPerPage &&
      this.itemsPerPage > 0 &&
      this.options.length > this.itemsPerPage
    ) {
      this._dialog.style.maxHeight = 42 * (this.itemsPerPage + 0.5) + 'px';
    }

    return (
      <Host>
        <slot name="default"></slot>

        <div class="dummy" ref={(el) => (this._dummyElement = el)}></div>

        <dialog
          ref={(el) => (this._dialog = el)}
          class={{ mobile: this._isMobile }}
        >
          <div class="input-top-wrapper">
            <slot name="input-top"></slot>
          </div>

          <ul
            ref={(el) => (this._list = el)}
            class={{ active: this.isOpen, mobile: this._isMobile }}
          >
            {this.renderedList}
          </ul>

          <slot name="input-bottom"></slot>
        </dialog>
      </Host>
    );
  }
}
