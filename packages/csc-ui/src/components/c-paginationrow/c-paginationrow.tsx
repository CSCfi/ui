import { Component, Host, h, Prop, State } from '@stencil/core';
import { mdiChevronDown, mdiDotsHorizontal } from '@mdi/js';

@Component({
  tag: 'c-paginationrow',
  styleUrl: 'c-paginationrow.css',
  shadow: true,
})
export class CPaginationrow {
  @Prop() itemsPerPage: number;
  @Prop() itemsTotal: number;
  @Prop({ mutable: true }) pageNumber: number;
  @State() totalPages: number = 1;
  @State() active: boolean = true;
  @Prop() items: any[] = [{value: 1}, {value: 10}, {value: 15}, {value: 20}, {value: 100}];

  changePage = (number) => {
    this.pageNumber = number;
  }

  nextPage = () => {
    if (this.pageNumber < this.totalPages){
      this.pageNumber = this.pageNumber + 1;
    }
  };
  previousPage = () => {
    if ( this.pageNumber > 1){
      this.pageNumber = this.pageNumber - 1;
    }
  }
  
  countItems = () => {
    if ( this.itemsPerPage * this.pageNumber < this.itemsTotal){
      return (
        this.itemsPerPage * this.pageNumber
      );
    } else {
      return (
        this.itemsTotal
      );
    }
  }

  getDotsIcon = () => (<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    class="dots-icon"
  >
    <path d={ mdiDotsHorizontal } />
  </svg>);

  getPageNumbers = () => {
    const classes = this.active && 'active';
    if (this.totalPages <= 7) {
      const pages = [];
      for (var i = 1; i <= this.totalPages; i++){
          pages.push(i);
      }
      const row = pages.map((number) =>
        <div class="mapped">{this.pageNumber === number ? <div class="item"><div class={classes}>{number}</div></div> : <div  class="item" onClick={() => this.changePage(number)}>{number}</div>}</div>
      );
      return (
        <div class="c-numbers">
          {row}
        </div>
      );

    } else if (this.totalPages > 7){
      if (this.pageNumber < 5){
        const pages = [];
        for (var i = 1; i <= 5; i++){
            pages.push(i);
        }
        const row = pages.map((number) =>
          <div class="mapped">{this.pageNumber === number ? <div class="item"><div class={classes}>{number}</div></div> : <div class="item" onClick={() => this.changePage(number)}>{number}</div>}</div>
        );
        row.push(<div class="mapped"><div class="item">{this.getDotsIcon()}</div></div>)
        row.push(<div class="mapped">{this.pageNumber === this.totalPages ? <div class="item"><div class={classes}>{this.totalPages}</div></div> : <div class="item" onClick={() => this.changePage(this.totalPages)}>{this.totalPages}</div>}</div>)
        return (
          <div class="c-numbers">
            {row}
          </div>
        );
      } else if (this.pageNumber >= 5 && this.totalPages - this.pageNumber > 3) {
        return (
        <div class="c-numbers">
          <div class="mapped">
            {this.pageNumber === 1 ? <div class="item"><div class={classes}>1</div></div> : <div class="item" onClick={() => this.changePage(1)}>1</div>}
          </div>
          <div class="mapped">
            <div class="item">{this.getDotsIcon()}</div>
          </div>
          <div class="item" onClick={() => this.changePage(this.pageNumber - 1)}>{this.pageNumber - 1}</div>
          <div class="item">
            <div class={classes}>{this.pageNumber}</div>
          </div>
          <div class="item" onClick={() => this.changePage(this.pageNumber + 1)}>{this.pageNumber + 1}</div>
          <div class="mapped">
            <div class="item">{this.getDotsIcon()}</div>
          </div>
          <div class="item" onClick={() => this.changePage(this.totalPages)}>{this.totalPages}</div>
        </div>
        );
      } else if (this.pageNumber >= 5 && this.totalPages - this.pageNumber <= 3) {
        var row = [];
        row.push(<div class="mapped">{this.pageNumber === 1 ?  <div class="item"><div class={classes}>1</div></div> : <div class="item" onClick={() => this.changePage(1)}>1</div>}</div>)
        row.push(<div class="mapped"><div class="item">{ this.getDotsIcon() }</div></div>)
        const pages = [];
        for (var i =  this.totalPages - 4; i <= this.totalPages; i++){
            pages.push(i);
        }
        row.push(pages.map((number) =>
          <div class="mapped">{this.pageNumber === number ? <div class="item"><div class={classes}>{number}</div></div> : <div class="item" onClick={() => this.changePage(number)}>{number}</div>}</div>
        ));
        return (
        <div class="c-numbers">
          {row}
        </div>
      );
      }
    } 
    
  };

  render() {
    this.totalPages = Math.ceil(this.itemsTotal / this.itemsPerPage);

    const itemsOnPage = this.countItems();
    
    return (
      <Host>
        <c-row>
          <div class="c-numberOfItems">
            <div class="center-row">
              <div>items per page:</div>
              <div class="items-per-page-select">
                <c-menu
                  small
                  nohover
                  items={this.items.map(i => ({ action: () => this.itemsPerPage = i.value, name: i.value }))}
                >
                  <div slot="activator">
                    { this.itemsPerPage }
                  </div>
                </c-menu>
              </div>
              <div class="current-items">
                <div>{this.itemsPerPage * this.pageNumber - (this.itemsPerPage - 1)} - {itemsOnPage} of {this.itemsTotal} items</div>
              </div>
            </div>
            <div>
              <div>{this.pageNumber} of {this.totalPages} pages</div>
            </div>
          </div>
          <div class="previous-page-button" onClick={() => this.previousPage()}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              class={ 1 < this.pageNumber ? "active" : "disabled"}
            >
              <path d={ mdiChevronDown } />
            </svg>
          </div>
          <div class="c-pages">
            {this.getPageNumbers()}
          </div>
          <div class="next-page-button" onClick={() => this.nextPage()}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              class={ this.totalPages > this.pageNumber ? "active" : "disabled"}
            >
              <path d={ mdiChevronDown } />
            </svg>
          </div>
        </c-row>
      </Host>
    );
  }
}
