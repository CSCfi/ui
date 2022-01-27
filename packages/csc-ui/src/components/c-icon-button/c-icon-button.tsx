import { Component, h, Prop } from "@stencil/core";

@Component({
  tag: "c-icon-button",
  styleUrl: "c-icon-button.css",
  shadow: true,
})
export class CIconButton {
  @Prop() icon: string;
  @Prop() badge: string;
  @Prop() outlined: boolean;
  @Prop() disabled: boolean;

  renderBadge() {
    return <div class="icon-button-badge">{this.badge}</div>;
  }

  button() {
    const classes = ["icon-button"];

    if (this.outlined) {
      classes.push("outlined");
    }

    if (this.disabled) {
      classes.push("disabled");
    }

    const innerClasses = ["innerContainer"];
    if (!this.disabled) {
      innerClasses.push("ripple");
    }

    return (
      <button class={classes.join(" ")}>
        <div class={innerClasses.join(" ")}>
          <slot></slot>
        </div>
        {this.badge ? this.renderBadge() : ""}
      </button>
    );
  }

  render() {
    return this.button();
  }
}
