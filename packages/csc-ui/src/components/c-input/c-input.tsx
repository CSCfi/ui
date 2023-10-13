import {
  Component,
  Host,
  h,
  State,
  Prop,
  Event,
  EventEmitter,
  Element,
  Watch,
  Method,
} from '@stencil/core';
import { CAutocompleteItem, CSelectItem } from '../../types';
import { _CDropdownParams } from '../c-dropdowns/c-dropdowns';

/**
 * @parent None
 */
@Component({
  tag: 'c-input',
  styleUrl: 'c-input.scss',
  shadow: false,
})
export class CInput {
  /**
   * Auto focus the input
   */
  @Prop() autofocus = false;

  /**
   * Disable the input
   */
  @Prop() disabled = false;

  /**
   * Render a hidden input outside the shadow dom
   */
  @Prop() form = false;

  /**
   * Hide the hint and error messages
   */
  @Prop() hideDetails = false;

  /**
   * Hint text for the input
   */
  @Prop() hint = '';

  /**
   * Id of the input
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Id of the input element
   */
  @Prop() inputId: string;

  /**
   * Items per page before adding scroll
   */
  @Prop() itemsPerPage = 6;

  /**
   * Label of the input
   */
  @Prop() label: string;

  /**
   * Maximum value on a numeric input
   */
  @Prop() max: number = null;

  /**
   * Minimum value on a numeric input
   */
  @Prop() min: number = null;

  /**
   * Name of the input
   */
  @Prop() name: string;

  /**
   * Placeholder of the input
   */
  @Prop() placeholder: string;

  /**
   * Mark as readonly
   */
  @Prop() readonly = false;

  /**
   * Set the input as required
   */
  @Prop() required = false;

  /**
   * Rows on the input
   */
  @Prop() rows = 1;

  /**
   * Shadow variant of the input
   */
  @Prop() shadow = false;

  /**
   * Step size on a numeric input
   */
  @Prop() step: number = null;

  /**
   * Type of the input
   */
  @Prop() type: string;

  /**
   * Set the validíty of the input
   */
  @Prop() valid = true;

  /**
   * Manual validation
   */
  @Prop() validate = false;

  /**
   * Validate the input on blur
   */
  @Prop() validateOnBlur = false;

  /**
   * Custom validation message
   */
  @Prop() validation = 'Required field';

  /**
   * Value of the input
   */
  @Prop() value: string | number | boolean | CSelectItem | CAutocompleteItem;

  /**
   * Variant
   */
  @Prop() variant: 'text' | 'select' = 'text';

  /**
   * Emit changes to the parent
   */
  @Event({ bubbles: false }) changeValue: EventEmitter;

  /**
   * Emit click to the parent
   */
  @Event({ bubbles: false }) itemClick: EventEmitter;

  @State() isFocused = false;

  @State() labelWidth = 0;

  @State() preSlotWidth = 0;

  @State() statusText = '';

  @State() currentIndex: number = null;

  @Element() hiddenEl!: HTMLCInputElement;

  @Watch('valid')
  onValidChange() {
    if (this.validateOnBlur && !this._hasBlurred) return;

    this._setAriaDescriptionId();
  }

  @Watch('validation')
  onValidationMessageChange() {
    this._updateStatusText();
  }

  @Watch('value')
  onValueChange(value) {
    if (!value) {
      this._onReset();
    }
  }

  @Watch('placeholder')
  onPlaceholderChange(placeholder) {
    if (placeholder) this._onReset();
  }

  private _hasBlurred = false;

  private _labelRef: HTMLLabelElement;

  private _debounce = null;

  private _dropdownsElement: HTMLCDropdownsElement;

  private _dropdownElement: HTMLCDropdownElement;

  private _outsideClickFn: () => void;

  // private _parentTop = 0;

  // private _listSize = 0;

  // private _parent: HTMLCSelectElement | HTMLCAutocompleteElement;

  componentWillLoad() {
    if (this.variant === 'select') {
      this._createDropdownWrapper();
    }
  }

  componentDidLoad() {
    if (this.autofocus) {
      setTimeout(() => {
        this._onFocus(false);
      }, 500);
    }

    this._calculateElementWidths();
    this._setAriaDescriptionId();

    if (this.label) {
      this._observer.observe(this._labelRef);
    }

    this.inputField?.addEventListener('focus', () => this._onFocus(false));
    this.inputField?.addEventListener('blur', () => this._onBlur());
    this.inputField?.addEventListener(
      'keypress',
      this._preventNonNumericalInput,
    );

    // hide the placeholder text initially if there is a label
    if (this.inputField) {
      this.inputField.placeholder =
        !!this.label || !this.placeholder ? '' : this.placeholder;

      this.inputField.title = this.label ?? this.placeholder;

      requestAnimationFrame(() => {
        const container = this.inputField.closest(
          '.c-input-menu__input',
        ) as HTMLDivElement;

        if (!container) return;

        container.dataset.placeholder = this.placeholder;
      });
    }
  }

  disconnectedCallback() {
    this.inputField?.removeEventListener('focus', () => this._onFocus(false));
    this.inputField?.removeEventListener('blur', () => this._onBlur());
    this.inputField?.removeEventListener(
      'keypress',
      this._preventNonNumericalInput,
    );

    this._observer.disconnect();

    this._dropdownElement?.remove();
  }

  get isActive() {
    return !!this.value || typeof this.value === 'boolean' || this.isFocused;
  }

  private _setAriaDescriptionId() {
    this.inputField.removeAttribute('aria-describedby');

    let type = null;

    if (this.valid && !this.value && this.hint) {
      type = 'hint';
    }

    if (!this.valid) {
      type = 'error';
    }

    if (type) {
      this.inputField.setAttribute(
        'aria-describedby',
        `${type}-${this.inputId}`,
      );
    }
  }

  private _observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this._calculateElementWidths();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 1 },
  );

  private _calculateElementWidths() {
    this.labelWidth = !!this.label ? this._labelRef.scrollWidth * 0.75 + 6 : 0;
    this.preSlotWidth = this.inputField.offsetLeft;
  }

  private _handleOutsideClick(event) {
    if (!event.composedPath().includes(this._dropdownElement)) {
      this.closeDropdown();
    }
  }

  private async _getScrollParent(element): Promise<HTMLElement> {
    return new Promise((resolve) => {
      if (!element) {
        resolve(undefined);
      }

      let parent = element.parentNode;

      while (parent) {
        if (parent.shadowRoot === undefined) {
          parent = parent.host;
        } else {
          const { overflow, overflowX } = window.getComputedStyle(parent);

          if (
            overflowX !== 'scroll' &&
            overflow.split(' ').every((o) => o === 'auto' || o === 'scroll')
          ) {
            resolve(parent);
          }

          parent = parent.parentNode;
        }
      }

      resolve(document.documentElement);
    });
  }

  /**
   * Create a dropdown
   */
  @Method()
  async createDropdown(params: _CDropdownParams) {
    const wrapper = await this._getScrollParent(this.hiddenEl);

    this._dropdownElement = await this._dropdownsElement.createDropdown({
      ...params,
      wrapper,
    });
  }

  /**
   * Opens the dropdown
   */
  @Method()
  async openDropdown() {
    this._dropdownElement.shadowRoot
      .querySelector('ul')
      .classList.add('active');

    this._dropdownElement.isOpen = true;

    this._outsideClickFn = this._handleOutsideClick.bind(this);

    requestAnimationFrame(() => {
      window.addEventListener('click', this._outsideClickFn);
    });
  }

  /**
   * Closes the dropdown
   */
  @Method()
  async closeDropdown() {
    this._dropdownElement.shadowRoot
      .querySelector('ul')
      .classList.remove('active');

    this._dropdownElement.isOpen = false;

    window.removeEventListener('click', this._outsideClickFn);
  }

  private _createDropdownWrapper() {
    const existingElement = document.querySelector('c-dropdowns');
    const element = existingElement || document.createElement('c-dropdowns');

    this._dropdownsElement = element;
    // this._dropdownsElement.itemsPerPage = this.itemsPerPage;

    if (existingElement) return;

    document.body.appendChild(element);
  }

  private _onBlur = () => {
    // delay the blur event to prevent the label from 'flashing' on c-select selection
    setTimeout(() => {
      this.isFocused = false;
      this._hasBlurred = true;

      // show the label if there's no label or value
      this._onReset();
    }, 100);
  };

  private _onFocus = (click = true) => {
    if (this.disabled) return;

    this.isFocused = true;

    this.inputField?.focus();

    if (click) {
      this.inputField?.click();
      this.itemClick.emit();
    }

    // show the label if there's no value
    if (this.inputField) {
      this.inputField.placeholder =
        !!this.value || !this.placeholder ? '' : this.placeholder;
    }
  };

  private _onReset() {
    if (this.inputField) {
      this.inputField.placeholder =
        !this.label && !this.value && !!this.placeholder
          ? this.placeholder
          : '';
    }
  }

  /**
   * Prevent non numeric values in the numeric fields
   */
  private _preventNonNumericalInput(event: KeyboardEvent) {
    if (this.type !== 'number') return;

    if (!event.key.match(/^[0-9,\.]+$/)) event.preventDefault();
  }

  private _renderBorders() {
    if (this.shadow) return;

    const classes = {
      active: this.isActive,
    };

    return (
      <fieldset aria-hidden="true">
        <legend
          class={classes}
          style={{
            '--c-input-legend-width': this.labelWidth + 'px',
          }}
        >
          <span class="notranslate"></span>
        </legend>
      </fieldset>
    );
  }

  private _renderLabel() {
    if (!this.label) return;

    const classes = {
      active: this.isActive,
    };

    return (
      <label
        htmlFor={this.inputId}
        ref={(el) => (this._labelRef = el as HTMLLabelElement)}
        class={classes}
      >
        {this.label}
        {this.required && <span>&nbsp;*</span>}
      </label>
    );
  }

  get inputField() {
    return this.hiddenEl?.querySelector('.c-input__input') as
      | HTMLInputElement
      | HTMLTextAreaElement;
  }

  private _updateStatusText() {
    if (this._debounce !== null) {
      clearTimeout(this._debounce);
      this._debounce = null;
    }

    this._debounce = window.setTimeout(() => {
      this.statusText = this.valid ? '' : `Error: ${this.validation}`;

      this._debounce = null;
    }, 1400);
  }

  render() {
    const containerClasses = {
      'c-input': true,
      'c-input--disabled': this.disabled,
      'c-input--shadow': this.shadow,
      'c-input--textarea': this.rows > 1,
      'c-input--error': !this.valid,
      filled: !!this.value,
      [`c-input--${this.variant}`]: true,
    };

    return (
      <Host disabled={this.disabled}>
        <div
          id={'announce-' + this.inputId}
          class="visuallyhidden"
          aria-live="polite"
          aria-atomic="true"
        >
          {this.statusText}
        </div>

        <div class={containerClasses}>
          <div class="c-input__control">
            <div class="c-input__slot" onClick={() => this._onFocus()}>
              {this._renderBorders()}

              <div
                class="c-input__field"
                style={{
                  '--c-input-label-position': this.preSlotWidth + 'px',
                }}
              >
                <slot name="pre"></slot>

                {this._renderLabel()}

                <slot></slot>
              </div>
            </div>

            {!this.hideDetails && (
              <c-message
                hint={this.hint}
                inputId={this.inputId}
                valid={this.valid}
                validation={this.validation}
              />
            )}
          </div>
        </div>
      </Host>
    );
  }
}
