import { Component, OnDestroy } from '@angular/core';
import { Member } from '@models/member.model';
import { EquipmentStore } from '@stores/equipment/equipment.store';
import { PlanningCenterStore } from '@stores/planning-center/planning-center.store';
import { map } from 'rxjs/operators';
import { ObservableDataSource } from '@utils/observable.source';

@Component({
  selector: 'app-weekend-experience-page',
  templateUrl: './weekend-experience-page.component.html',
  styleUrls: ['./weekend-experience-page.component.scss'],
})
export class WeekendExperiencePageComponent implements OnDestroy {
  creatingHelpers$ = this.planningCenterStore.creatingHelpers$;
  arrangements$ = this.planningCenterStore.currentArrangements$;
  w$ = this.planningCenterStore.weekendExperiences$;
  personListDataSource: ObservableDataSource<Member[]>;
  displayedColumns = [
    'name',
    'teamPositionName',
    'microphone',
    'personalMonitorChannel',
    'iemPack',
    'needsHeadphones',
  ];
  microphones$ = this.planningCenterStore.microphones$;

  constructor(
    private planningCenterStore: PlanningCenterStore,
    private equipmentStore: EquipmentStore
  ) {
    this.w$.subscribe();
    this.personListDataSource = new ObservableDataSource(
      this.arrangements$.pipe(
        map(arrangements => {
          if (arrangements.length > 0) {
            return arrangements[0].person;
          }
          return [];
        })
      )
    );
  }

  ngOnDestroy() {
    this.personListDataSource.removeSubscription();
  }

  microphoneSelected(micId, personId) {
    this.equipmentStore.microphoneSelected(micId, personId);
  }
}
