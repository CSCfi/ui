import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-modal',
  templateUrl: './c-modal.component.html',
  styleUrls: ['./c-modal.component.scss'],
})
export class CModalComponent implements OnInit {
  templates = [
    `<c-button (click)="modal = true">Open modal</c-button>

<c-modal cControl [(ngModel)]="modal">
  <c-card>
    <c-card-title>Modal</c-card-title>
    <c-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </c-card-content>
    <c-card-actions>
      <c-button (click)="modal = false">Close</c-button>
    </c-card-actions>
  </c-card>
</c-modal>`,
    `<c-button (click)="dismissableModal = true">Open dismissable modal</c-button>

<c-modal cControl [(ngModel)]="dismissableModal" [persistent]="false">
  <c-card>
    <c-card-title>Dismissable</c-card-title>
    <c-card-content>
      <p>This modal can be dismissed by clicking outside the content</p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </c-card-content>
    <c-card-actions>
      <c-button (click)="dismissableModal = false">Close</c-button>
    </c-card-actions>
  </c-card>
</c-modal>`,
  ];
  modal = false;
  dismissableModal = false;

  constructor() {}

  ngOnInit(): void {}
}
