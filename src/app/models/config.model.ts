import { HttpHeaders, HttpParams } from "@angular/common/http";

export class HttpOptions {
    headers?: HttpHeaders;
    observe?: 'body';
    params?: HttpParams;
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
}

export class ConfigPlan {
    id: number | string;
    name: string;
    offset: number;
    default: boolean;
}

export class Config {
    planningCenterApi: {
        url: string;
        routes: {
            plans: string;
            membersOnPlan: string;
            arrangementsOnSong: string;
            itemsOnPlan: string;
        };
        plans: Array<ConfigPlan>;
        options: HttpOptions;
    };
    microphones: string[];
}