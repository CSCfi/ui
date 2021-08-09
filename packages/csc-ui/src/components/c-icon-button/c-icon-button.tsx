import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-icon-button',
  styleUrl: 'c-icon-button.css',
  shadow: true,
})
export class CIconButton {
  @Prop() icon: string;
  @Prop() badge: string;

  iconPaths = {
    help: <path
    fill="currentColor"
    d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0
    12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20
    12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"
  />,
    arrowLeft: <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />,
    envelope: <path
      fill="currentColor"
      d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4
      20H20C21.1 20 22 19.1 22 18V6M20 6L12 11L4 6H20M20 18H4V8L12 13L20 8V18Z"
    />,
    trash: <path
      fill="currentColor"
      d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
    />,
    chevronLeft: <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />,
    chevronRight: <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />,
    createMessage: <path
      fill="currentColor"
      d="M19 15V18H16V20H19V23H21V20H24V18H21V15H19M14 18H3V8L11 13L19 8V13H21V6C21
      4.9 20.1 4 19 4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H14V18M19 6L11 11L3 6H19Z"
    />,
  };

  renderBadge() {
    return <div class="icon-button-badge">{ this.badge }</div>;
  }

  button() {
    return (
      <div class="icon-button">{ this.badge ? this.renderBadge() : '' }
        <svg viewBox="0 0 24 24">{ this.iconPaths[this.icon] }</svg>
      </div>);
  }

  render() {
    return this.button();
  }

}
