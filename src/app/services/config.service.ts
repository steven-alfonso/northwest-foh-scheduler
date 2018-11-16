import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {Config} from '@models/config.model';

@Injectable()
export class ConfigService {
    public config$: Observable<Config> = this.http.get('./config.json')
        .pipe(
            map(response => {
                return <Config>response;
            }),
            shareReplay(1)
        );

    constructor(private http: HttpClient) { }
}