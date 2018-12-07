import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config, ConfigPlan } from '@models/config.model';
import { PcoPlanDatum } from '@models/pco-plans.model';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map, switchMap, catchError, delay } from 'rxjs/operators';
import { ConfigService } from './config.service';

const corsAnywhereUrl = '';
// const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';

@Injectable()
export class PlanningCenterService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  async getPlans(serviceTypeId: number | string): Promise<PcoPlanDatum[]> {
    return this.configService.config$.pipe(
      switchMap((config: Config) => {
        const plan = <ConfigPlan>(_.find(config.planningCenterApi.plans, { id: serviceTypeId }) || {});
        const planRoute = `${config.planningCenterApi.routes.plans}`
          .replace(':serviceTypeId', `${serviceTypeId}`)
          .replace(':offset', `${plan.offset}`);
        return this.http.get(`${corsAnywhereUrl}${config.planningCenterApi.url}${planRoute}`, {
          ...config.planningCenterApi.options
        });
        // return this.http.get('./mock-data/mock-plan-response.json');
      }),
      map((response: any) => <PcoPlanDatum[]>response.data)
    )
    .toPromise();
  }

  async getMembersOnPlan(serviceTypeId: number | string, planId: number | string): Promise<any[]> {
    return this.configService.config$.pipe(
      switchMap((config: Config) => {
        const planRoute = `${config.planningCenterApi.routes.membersOnPlan}`
          .replace(':serviceTypeId', `${serviceTypeId}`)
          .replace(':planId', `${planId}`);
        return this.http.get(`${corsAnywhereUrl}${config.planningCenterApi.url}${planRoute}`, {
          ...config.planningCenterApi.options
        });
      }),
      map((response: any) => response.data)
    )
    .toPromise();
  }

  async getItemsOnPlan(serviceTypeId: number | string, planId: number | string): Promise<any[]> {
    return this.configService.config$.pipe(
      delay(200),
      switchMap((config: Config) => {
        const itemsRoute = `${config.planningCenterApi.routes.itemsOnPlan}`
          .replace(':serviceTypeId', `${serviceTypeId}`)
          .replace(':planId', `${planId}`);
        return this.http.get(`${corsAnywhereUrl}${config.planningCenterApi.url}${itemsRoute}`, {
          ...config.planningCenterApi.options
        });
      }),
      map((response: any) => {
        console.log(response);
        return response.data;
      })
    )
    .toPromise();
  }

  getArrangementsBySongId(songId: number | string): Observable<any[]> {
    return this.configService.config$
      .pipe(
        delay(200),
        switchMap((config: Config) => {
          const arrangementsRoute = `${config.planningCenterApi.routes.arrangementsOnSong}`.replace(':songId', `${songId}`);
          return this.http.get(`${corsAnywhereUrl}${config.planningCenterApi.url}${arrangementsRoute}`, {
            ...config.planningCenterApi.options
          });
        }),
        catchError(err => {
          console.error(err);
          return err;
        }),
        map((response: any) => response.data)
      );
  }
}
