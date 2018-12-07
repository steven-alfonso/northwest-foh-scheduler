import { Component, OnDestroy } from '@angular/core';
import { Member } from '@models/member.model';
// import { EquipmentStore } from '@stores/equipment/equipment.store';
import { PlanningCenterStore } from '@stores/planning-center/planning-center.store';
import { map } from 'rxjs/operators';
import { ObservableDataSource } from '@utils/observable.source';
import { WeekendExperience } from '@models/weekend-experience.model';
import { EquipmentStore } from '@stores/equipment/equipment.store';

@Component({
  selector: 'app-weekend-experience-page',
  templateUrl: './weekend-experience-page.component.html',
  styleUrls: ['./weekend-experience-page.component.scss']
})
export class WeekendExperiencePageComponent implements OnDestroy {
  creatingHelpers$ = this.planningCenterStore.creatingHelpers$;
  weekendExperiences$ = this.planningCenterStore.weekendExperiences$;
  membersDataSource: ObservableDataSource<any>;
  microphones$ = this.weekendExperiences$.pipe(
    map(weekendExperiences => {
      if (weekendExperiences.length > 0) {
        return weekendExperiences[0].microphones.microphones;
      }
      return [];
    })
  );
  displayedColumns = ['name', 'positionName', 'microphone', 'personalMonitorChannel', 'iemPack', 'needsHeadphones'];

  constructor(
    private planningCenterStore: PlanningCenterStore,
    private equipmentStore: EquipmentStore
    ) {
    this.membersDataSource = new ObservableDataSource(
      this.weekendExperiences$.pipe(
        map(weekendExperiences => {
          if (weekendExperiences.length > 0) {
            return weekendExperiences[0].members;
          }
          return [];
        })
      )
    );
  }

  ngOnDestroy() {
    this.membersDataSource.removeSubscription();
  }

  microphoneSelected(micId, personId) {
    console.log(micId, personId);
    this.planningCenterStore.microphoneSelected(micId, personId, 38982319);
  }
}
