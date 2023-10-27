import { Component, OnInit } from '@angular/core';
import { VersionService } from '../services/version.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  constructor(public versionService: VersionService) {}

  ngOnInit(): void {}
}
