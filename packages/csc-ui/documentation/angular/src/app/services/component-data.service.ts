import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ComponentData } from 'src/interfaces/documentation';

@Injectable({
  providedIn: 'root',
})
export class ComponentDataService {
  active = new Subject<ComponentData>();
  readonly activeComponent$ = this.active.asObservable();

  setActiveComponent(component: ComponentData) {
    this.active.next(component);
  }
}
