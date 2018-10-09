import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable()
export class ConfigService {
    public config$: Observable<any> = this.http.get('./src/config.json')
        .pipe(
            map(response => {
                return response;
            }),
            shareReplay(1)
        );

    constructor(private http: HttpClient) { }
}