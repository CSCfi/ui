import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-progressbar',
  styleUrl: 'c-progressbar.css',
  shadow: true,
})
export class CProgressbar {
  @Prop() value: number;
  @Prop() color: string;

  render() {
    const color = this.color ? this.color : '#008675';
    const style = { 'width': `${this.value}%`, 'background-color': color };
    return (
      <Host>
        <div class="c-progress-bar-container">
          <div class="c-progress-bar" style={style}></div>
        </div>
        <div class="c-progress-bar-percentage">
          { this.value } %
        </div>
      </Host>
    );
  }

}
