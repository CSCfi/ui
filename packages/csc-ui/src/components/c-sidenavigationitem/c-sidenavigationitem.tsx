import { mdiChevronRight } from '@mdi/js';
import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'c-sidenavigationitem',
  styleUrl: 'c-sidenavigationitem.css',
  shadow: true,
})
export class CSidenavigationitem {
  @Prop() active: boolean;
  @Prop() subItems: boolean;
  @Prop() href: string;
  redirect() {
    if (!this.subItems) {
      const sidenav = document.querySelector('c-sidenavigation');
      sidenav.menuVisible = false;
    }
    if (this.href) {
      window.location.href = this.href;
    }
  }

  getChevron() {
    const svgClass = this.active ? 'svg' : 'svg hidden';
    return (<svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        class={ svgClass }
      >
        <path d={ mdiChevronRight } />
      </svg>);
  }
  render() {
    const classes = this.active && 'active';
    
    return (
      <Host class={classes} onClick={() => this.redirect()}>
        <div class="styleMain">
          <c-row class="align-center">
            <div class="middle">
              { this.getChevron() }
            </div>
            <slot name="main"></slot>
          </c-row>
        </div>
        <div aria-expanded={this.active} class={ this.active ? 'subnavactive' : 'subnavitem' }>
          { this.active ? <slot name="subnavitem"></slot> : '' } 
        </div>
      </Host>
    );
  }

}

