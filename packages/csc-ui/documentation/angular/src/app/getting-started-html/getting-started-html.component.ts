import { Component, OnInit } from '@angular/core';
import { VersionService } from '../services/version.service';
import { formatTemplate } from '../utils/utils';

@Component({
  selector: 'app-getting-started-html',
  templateUrl: './getting-started-html.component.html',
  styleUrls: ['./getting-started-html.component.scss'],
})
export class GettingStartedHtmlComponent implements OnInit {
  showCode = false;
  script = '';
  template = formatTemplate(
    `
    <c-card>
      <form action="" method="get">
        <c-card-title>Login example</c-card-title>

        <c-card-content>
          <c-text-field label="Username" name="username" form></c-text-field>
          <c-text-field label="Password" name="password" type="password" form></c-text-field>
        </c-card-content>

        <c-card-actions right>
          <c-button type="submit">Login</c-button>
        </c-card-actions>
      </form>
    </c-card>`,
    false,
  );

  constructor(private _versionService: VersionService) {}

  ngOnInit(): void {
    this.script = `<script src="https://unpkg.com/csc-ui@${this._versionService.version}/dist/cscwebcomponents/cscwebcomponents.esm.js" type="module"></script>`;
  }
}
