import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import typeDefinitions from '../examples/example-data/types.js';

@Component({
  selector: 'app-types',
  templateUrl: './types.component.html',
  styleUrls: ['./types.component.scss'],
})
export class TypesComponent implements OnInit, AfterViewInit {
  types = Object.keys(typeDefinitions)
    .map((key) => ({ type: key, value: typeDefinitions[key].trim() }))
    .sort((a, b) => a.type.localeCompare(b.type));

  constructor(private _route: ActivatedRoute, private _router: Router) {}

  ngOnInit() {
    this._route.fragment.subscribe((fragment) => {
      const typeDefinition = document.getElementById(fragment);

      if (!typeDefinition) return;

      window.requestAnimationFrame(() =>
        typeDefinition.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' }),
      );
    });
  }

  ngAfterViewInit() {
    const element = document.getElementById(this._route.snapshot.fragment);

    if (!element) return;

    setTimeout(() => {
      window.requestAnimationFrame(() => element.scrollIntoView({ behavior: 'smooth' }));
    }, 1000);
  }

  scrollToType(type) {
    this._router.navigate([], { fragment: type });
  }
}
