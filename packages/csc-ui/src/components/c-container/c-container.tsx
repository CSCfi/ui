import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "c-container",
  styleUrl: "c-container.css",
  shadow: true,
})
export class CContainer {
  @Prop() width: number;

  render() {
    let style = {};
    if (this.width > 0) {
      style = { "max-width": `${this.width}px` };
    }

    return (
      <Host style={style}>
        <slot></slot>
      </Host>
    );
  }
}
