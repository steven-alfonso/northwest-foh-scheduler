import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config, ConfigPlan } from '@models/config.model';
import { PcoPlanDatum } from '@models/pco-plans.model';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ConfigService } from './config.service';

@Injectable()
export class PlanningCenterService {
    constructor(private http: HttpClient, private configService: ConfigService) { }

    getPlans(serviceTypeId: number | string): Observable<PcoPlanDatum[]> {
        return this.configService.config$.pipe(
            switchMap((config: Config) => {
                const plan = <ConfigPlan>(_.find(config.planningCenterApi.plans, { id: serviceTypeId }) || {});
                const planRoute = `${config.planningCenterApi.routes.plans}`
                    .replace(':serviceTypeId', `${serviceTypeId}`)
                    .replace(':offset', `${plan.offset}`);
                return this.http.get(`${'https://cors-anywhere.herokuapp.com/'}${config.planningCenterApi.url}${planRoute}`,
                    {
                        ...config.planningCenterApi.options,
                    });
                // return this.http.get('./mock-data/mock-plan-response.json')
            }),
            map((response: any) => <PcoPlanDatum[]>response.data)
        );
    }

    getMembersOnPlan(serviceTypeId: number | string, planId: number | string) {
        return this.configService.config$.pipe(
            switchMap((config: Config) => {
                const planRoute = `${config.planningCenterApi.routes.membersOnPlan}`
                    .replace(':serviceTypeId', `${serviceTypeId}`)
                    .replace(':planId', `${planId}`);
                return this.http.get(`${'https://cors-anywhere.herokuapp.com/'}${config.planningCenterApi.url}${planRoute}`,
                    {
                        ...config.planningCenterApi.options,
                    });
            }),
            map((response: any) => response.data)
        );
    }

    getArrangementsOnPlan(serviceTypeId: number | string, planId: number | string) {
        return this.configService.config$.pipe(
            switchMap((config: Config) => {
                const planRoute = `${config.planningCenterApi.routes.membersOnPlan}`
                    .replace(':serviceTypeId', `${serviceTypeId}`)
                    .replace(':planId', `${planId}`);
                return this.http.get(`${'https://cors-anywhere.herokuapp.com/'}${config.planningCenterApi.url}${planRoute}`,
                    {
                        ...config.planningCenterApi.options,
                    });
            }),
            map((response: any) => response.data)
        );
    }

    foo() {
        return this.configService.config$.pipe(
            switchMap((config: Config) => {
                return this.http.get(`${'https://api.planningcenteronline.com/services/v2/people'}/5746715`,
                    {
                        ...config.planningCenterApi.options,
                    });
            }),
            map((response: any) => response.data)
        )
            .subscribe(a => {
                console.log(a);
            });
    }
}