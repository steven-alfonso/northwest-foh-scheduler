import { Injectable } from "@angular/core";
import * as _ from 'lodash';
import * as moment from 'moment/moment';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { finalize, map, switchMap, take } from 'rxjs/operators';
import { PlanningCenterService } from '@services/planning-center.service';

@Injectable()
export class PlanningCenterStore {
    private _currentArrangements: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    private _creatingHelpers: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public readonly currentArrangements$ = this._currentArrangements.asObservable();
    public readonly creatingHelpers$ = this._creatingHelpers.asObservable();

    constructor(private planningCenterService: PlanningCenterService) {
        this.planningCenterService.foo();
    }

    createHelper(serviceTypeId: number | string, _startDate: Date, _endDate?: Date) {
        const s = moment(_startDate).startOf('day');
        const endDate: number = _endDate ? moment(_endDate).endOf('day').unix() : s.endOf('day').unix();
        const startDate: number = s.unix();
        this._creatingHelpers.next(true);
        this.planningCenterService.getPlans(serviceTypeId)
            .pipe(
                map((plans) => {
                    // Get plans that are within date range
                    return _.orderBy(plans.filter(plan => {
                        const sortDate = moment(plan.attributes.sort_date).unix();
                        return sortDate >= startDate && sortDate <= endDate;
                    }), plan => {
                        return plan.attributes.sort_date;
                    });
                }),
                take(1),
                switchMap(plans => {
                    // Get team members on plans
                    const planMembers$ = plans.map(plan => {
                        return this.planningCenterService.getMembersOnPlan(serviceTypeId, plan.id)
                            .pipe(
                                map(members => {
                                    return {
                                        plan: plan, members: members
                                    };
                                })
                            )
                    });
                    return forkJoin(planMembers$);
                }),
                switchMap(planMembers => {
                    const planArrangments$ = planMembers.map(planMember => {
                        return this.planningCenterService.getArrangementsOnPlan(serviceTypeId, planMember.plan.id)
                            .pipe(
                                map(arrangements => {
                                    return { ...planMember, arrangements: arrangements };
                                })
                            )

                    });
                    return forkJoin(planArrangments$)
                }),
                finalize(() => {
                    this._creatingHelpers.next(false);
                })
            )
            .subscribe(plansMembers => {
                console.log(plansMembers);
                this._currentArrangements.next(plansMembers);
            });
    }
}