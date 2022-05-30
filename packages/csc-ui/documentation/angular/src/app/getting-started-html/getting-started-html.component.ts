import { Component, OnInit } from '@angular/core';
import { VersionService } from '../services/version.service';

@Component({
  selector: 'app-getting-started-html',
  templateUrl: './getting-started-html.component.html',
  styleUrls: ['./getting-started-html.component.scss'],
})
export class GettingStartedHtmlComponent implements OnInit {
  showCode = false;
  script = '';
  template = `<c-card>
  <c-card-title>Login example</c-card-title>

  <c-card-content>
    <c-text-field label="Username" name="username" form hide-details></c-text-field>

    <c-text-field
      label="Password"
      name="password"
      type="password"
      form
      hide-details
    ></c-text-field>
  </c-card-content>

  <c-card-actions justify="space-between">
    <c-link href="#" underline>Forgot password?</c-link>
    <c-button type="submit">Login</c-button>
  </c-card-actions>
</c-card>`;

  constructor(private _versionService: VersionService) {}

  ngOnInit(): void {
    this.script = `<script src="https://unpkg.com/csc-ui@${this._versionService.version}/dist/cscwebcomponents/cscwebcomponents.esm.js" type="module"></script>`;
  }
}
