import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-accordion',
  templateUrl: './c-accordion.component.html',
  styleUrls: ['./c-accordion.component.scss'],
})
export class CAccordionComponent implements OnInit {
  example = `<c-accordion [value]="['one', 'three']" multiple>
  <c-accordion-item heading="One" value="one">
    <i class="mdi mdi-access-point" slot="icon"></i>
    Lorem ipsum dolor sit amet.
  </c-accordion-item>
  <c-accordion-item heading="Two" value="two">
    <i class="mdi mdi-nas" slot="icon"></i>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum, perspiciatis?
  </c-accordion-item>
  <c-accordion-item heading="Three" value="three">
    <i class="mdi mdi-camera" slot="icon"></i>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia voluptatum perspiciatis
    itaque!
  </c-accordion-item>
</c-accordion>`;

  constructor() {}

  ngOnInit(): void {}
}
