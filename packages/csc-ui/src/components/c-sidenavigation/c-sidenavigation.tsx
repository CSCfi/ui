import { Component, Host, h, Prop } from '@stencil/core';
/**
 * @group Navigation
 */
@Component({
  tag: 'c-sidenavigation',
  styleUrl: 'c-sidenavigation.scss',
  shadow: true,
})
export class CSidenavigation {
  /**
   * Mobile version
   */
  @Prop() mobile: boolean;

  /**
   * Mobile version menu visibility
   */
  @Prop({ mutable: true }) menuVisible: boolean = false; // eslint-disable-line
  componentDidLoad() {
    const _this = this;

    window.addEventListener('click', function (event: any) {
      if (
        event.target.matches('c-navigationbutton') ||
        event.target.matches('c-sidenavigation')
      ) {
        _this.menuVisible = !_this.menuVisible;
      }
    });
  }
  render() {
    const classes = ['c-sidenavigation'];
    classes.push(this.menuVisible ? 'showMenu' : 'hideMenu');
    if (this.mobile === true) {
      classes.push('mobile');
    }
    return (
      <Host class={this.mobile !== true ? 'desktop' : ''}>
        <div class={classes.join(' ')}>
          <div>
            <slot></slot>
            <div class="vertical-spacer"></div>
            <slot name="bottom"></slot>
          </div>
        </div>
        {this.menuVisible && this.mobile === true && (
          <div class="c-overlay c-fadeIn"></div>
        )}
      </Host>
    );
  }
}
