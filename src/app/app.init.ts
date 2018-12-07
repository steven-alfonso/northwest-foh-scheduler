import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Config } from '@models/config.model';

@Injectable()
export class AppInitService {
  private appConfig: Config;

  constructor(private injector: Injector) {}

  init() {
    const http = this.injector.get(HttpClient);
    return http
      .get('./config.json')
      .toPromise()
      .then(data => {
        this.appConfig = <Config>data;
      });
  }

  get config() {
    return this.appConfig;
  }
}
