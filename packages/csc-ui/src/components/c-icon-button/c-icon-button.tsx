import { Component, h, Prop } from "@stencil/core";

@Component({
  tag: "c-icon-button",
  styleUrl: "c-icon-button.css",
  shadow: true,
})
export class CIconButton {
  @Prop() icon: string;
  @Prop() badge: string;
  @Prop() text: boolean;
  @Prop() outlined: boolean;
  @Prop() ghost: boolean;
  @Prop() disabled: boolean;

  renderBadge() {
    return <div class="icon-button-badge">{this.badge}</div>;
  }

  outerClasses() {
    return {
      "icon-button": true,
      disabled: !!this.disabled,
      text: !!this.text,
      ghost: !!this.ghost,
      outlined: !!this.outlined,
    };
  }

  innerClasses() {
    return {
      "inner-container": true,
      ripple: !this.disabled,
    };
  }

  cssClasses(classes) {
    return Object.keys(classes)
      .filter((key) => classes[key])
      .join(" ");
  }

  button() {
    return (
      <button class={this.cssClasses(this.outerClasses())}>
        <div class={this.cssClasses(this.innerClasses())}>
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
