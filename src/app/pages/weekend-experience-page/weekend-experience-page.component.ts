import { Component } from '@angular/core';
import { PlanningCenterStore } from '@stores/planning-center/planning-center.store';

@Component({
  selector: 'app-weekend-experience-page',
  templateUrl: './weekend-experience-page.component.html',
  styleUrls: ['./weekend-experience-page.component.scss']
})
export class WeekendExperiencePageComponent {
  creatingHelpers$ = this.planningCenterStore.creatingHelpers$;
  arrangements$ = this.planningCenterStore.currentArrangements$;

  constructor(private planningCenterStore: PlanningCenterStore) { }

}
