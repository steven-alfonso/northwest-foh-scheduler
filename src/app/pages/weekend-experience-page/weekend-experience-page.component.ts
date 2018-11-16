import { Component, OnDestroy } from '@angular/core';
import { Person } from '@models/person.model';
import { PlanningCenterStore } from '@stores/planning-center/planning-center.store';
import { ObservableDataSource } from 'src/app/utils/observable.source';
import { finalize, map, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-weekend-experience-page',
  templateUrl: './weekend-experience-page.component.html',
  styleUrls: ['./weekend-experience-page.component.scss'],
})
export class WeekendExperiencePageComponent implements OnDestroy {
  creatingHelpers$ = this.planningCenterStore.creatingHelpers$;
  arrangements$ = this.planningCenterStore.currentArrangements$;
  personListDataSource: ObservableDataSource<Person[]>;
  displayedColumns = ['name',  'teamPositionName', 'microphone', 'personalMonitorChannel', 'iemPack', 'needsHeadphones'];

  constructor(private planningCenterStore: PlanningCenterStore) {
    this.personListDataSource = new ObservableDataSource(this.arrangements$.pipe(
      map(arrangements => {
        if (arrangements.length > 0) {
          return arrangements[0].person
        }
        return [];
      })
    ));
  }

  ngOnDestroy() {
    this.personListDataSource.removeSubscription();
  }
}
