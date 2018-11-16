import { Injectable } from '@angular/core';
import { PlanningCenterService } from '@services/planning-center.service';
import orderBy from 'lodash/orderBy';
import uniq from 'lodash/uniq';
import moment from 'moment/moment';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { finalize, map, switchMap, take } from 'rxjs/operators';
import { Person } from '@models/person.model';
import { plainToClass } from 'class-transformer';

@Injectable()
export class PlanningCenterStore {
  private _currentArrangements: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private _creatingHelpers: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public readonly currentArrangements$ = this._currentArrangements.asObservable().pipe(
    map(currentArrangements => {
      return currentArrangements.map(arrangement => {
        return {
          ...arrangement,
          possiblePositions: (arrangements => {
            let possiblePositions = arrangements.map(ar => {
              return ar.attributes.team_position_name;
            });
            return uniq(possiblePositions).sort();
          })(arrangement.arrangements),
        };
      });
    }),
    map(currentArrangements => {
      return currentArrangements.map(arrangement => {
        return {
          ...arrangement,
          person: arrangement.members.map(member => {
            return plainToClass(Person, {
              id: member.relationships.person.data.id,
              name: member.attributes.name,
              teamPositionName: member.attributes.team_position_name,
              needsHeadphones: true,
            });
          }),
        };
      });
    }),
    map(currentArrangements => {
      console.log(currentArrangements);
      return currentArrangements;
    })
  );
  public readonly creatingHelpers$ = this._creatingHelpers.asObservable();

  constructor(private planningCenterService: PlanningCenterService) {
    // this.planningCenterService.foo();
  }

  createHelper(serviceTypeId: number | string, _startDate: Date, _endDate?: Date) {
    const s = moment(_startDate).startOf('day');
    const endDate: number = _endDate
      ? moment(_endDate)
          .endOf('day')
          .unix()
      : s.endOf('day').unix();
    const startDate: number = s.unix();
    this._creatingHelpers.next(true);
    this.planningCenterService
      .getPlans(serviceTypeId)
      .pipe(
        map(plans => {
          // Get plans within date range
          return orderBy(
            plans.filter(plan => {
              const sortDate = moment(plan.attributes.sort_date).unix();
              return sortDate >= startDate && sortDate <= endDate;
            }),
            plan => {
              return plan.attributes.sort_date;
            }
          );
        }),
        take(1),
        switchMap(plans => {
          // Get team members on plans
          const planMembers$ = plans.map(plan => {
            return this.planningCenterService.getMembersOnPlan(serviceTypeId, plan.id).pipe(
              map(members => {
                return {
                  plan: plan,
                  members: members,
                };
              })
            );
          });
          return forkJoin(planMembers$);
        }),
        switchMap(planMembers => {
          const planArrangments$ = planMembers.map(planMember => {
            return this.planningCenterService
              .getArrangementsOnPlan(serviceTypeId, planMember.plan.id)
              .pipe(
                map(arrangements => {
                  return { ...planMember, arrangements: arrangements };
                })
              );
          });
          return forkJoin(planArrangments$);
        }),
        finalize(() => {
          this._creatingHelpers.next(false);
        })
      )
      .subscribe(plansMembers => {
        this._currentArrangements.next(plansMembers);
      });
  }
}
