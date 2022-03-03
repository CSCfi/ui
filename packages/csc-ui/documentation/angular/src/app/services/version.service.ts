import { Injectable } from '@angular/core';
import config from '../../../../../package.json';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  version = config.version;
}
