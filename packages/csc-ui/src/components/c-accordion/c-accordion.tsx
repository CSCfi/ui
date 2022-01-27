import {
  Component,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
  Listen,
} from "@stencil/core";
import { v4 as uuid } from "uuid";

@Component({
  tag: "c-accordion-item",
  styleUrl: "c-accordion.css",
  shadow: true,
})
export class CAccordion {
  @Prop() heading: string;
  @Prop() icon: string;
  @Prop({ mutable: true }) value = false;
  @Event() changeValue: EventEmitter;

  @Listen("keydown", { capture: true })
  handleKeyDown(ev: any) {
    if (ev.key === "Enter" || ev.code === "Space") {
      this.value = true;
      this.changeValue.emit(true);
    }
  }

  show() {
    this.value = !this.value;
    this.changeValue.emit(this.value);
  }

  uniqueId = uuid();

  icons = {
    enabled: (
      <path
        fill="#006778"
        d="M16,7V3H14V7H10V3H8V7H8C7,7 6,8 6,9V14.5L9.5,18V21H14.5V18L18,14.5V9C18,8 17,7 16,7Z"
      />
    ),
    disabled: (
      <path
        fill="#006778"
        d="M22.11 21.46L2.39 1.73L1.11 3L6.25 8.14C6.1 8.41 6 8.7 6 9V14.5L9.5 18V21H14.5V18L15.31
        17.2L20.84 22.73L22.11 21.46M13.09 16.59L12.67 17H11.33L10.92 16.59L8 13.67V9.89L13.89 15.78L13.09 16.59M12.2 9L10.2
        7H14V3H16V7C17 7 18 8 18 9V14.5L17.85 14.65L16 12.8V9.09C16 9.06 15.95 9 15.92 9H12.2M10 6.8L8 4.8V3H10V6.8Z"
      />
    ),
    bell: (
      <path
        fill="#006778"
        d="M12 2A2 2 0 0 0 10 4A2 2 0 0 0 10 4.29C7.12 5.14 5 7.82 5 11V17L3 19V20H21V19L19 17V11C19 7.82 16.88 5.14 14 4.29A2 2 0 0 0 14 4A2 2 0 0 0 12 2M12 6A5 5 0 0 1 17 11V18H7V11A5 5 0 0 1 12 6M21 7V13H23V7H21M21 15V17H23V15H21M10 21A2 2 0 0 0 12 23A2 2 0 0 0 14 21H10Z"
      />
    ),
    pending: (
      <path
        fill="#006778"
        d="M21 11.11V5C21 3.9 20.11 3 19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.11 3.9 21 5 21H11.11C12.37 22.24 14.09 23 16 23C19.87 23 23 19.87 23 16C23 14.09 22.24 12.37 21 11.11M12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3M5 19V5H7V7H17V5H19V9.68C18.09 9.25 17.08 9 16 9H7V11H11.1C10.5 11.57 10.04 12.25 9.68 13H7V15H9.08C9.03 15.33 9 15.66 9 16C9 17.08 9.25 18.09 9.68 19H5M16 21C13.24 21 11 18.76 11 16S13.24 11 16 11 21 13.24 21 16 18.76 21 16 21M16.5 16.25L19.36 17.94L18.61 19.16L15 17V12H16.5V16.25Z"
      />
    ),
  };

  getIcon() {
    if (this.icon)
      return <svg viewBox="0 0 24 24">{this.icons[this.icon]}</svg>;
    return <slot name="icon"></slot>;
  }

  render() {
    return (
      <Host>
        <div
          class="accordion-header"
          tabindex="0"
          aria-expanded={this.value}
          onClick={() => this.show()}
          id={`c-accordion-${this.uniqueId}`}
        >
          <div class="icon-wrapper">{this.getIcon()}</div>

          <h4>{this.heading}</h4>
          <c-spacer></c-spacer>
          {
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {!this.value ? (
                <path
                  fill="#006778"
                  d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"
                />
              ) : (
                <path
                  fill="#006778"
                  d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
                />
              )}
            </svg>
          }
        </div>
        <div
          class={
            this.value
              ? "accordion-content-wrapper"
              : "accordion-content-wrapper hidden"
          }
        >
          <div
            class="accordion-content"
            role="region"
            aria-labelledby={`c-accordion-${this.uniqueId}`}
          >
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  }
}
