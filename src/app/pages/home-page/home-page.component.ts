import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { PlanningCenterStore } from '@stores/planning-center/planning-center.store';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  constructor(
    private router: Router,
    private planningCenterStore: PlanningCenterStore
  ) { }

  navigateToWeekendExperience() {
    this.router.navigate(['weekend-experience']);
  }

  ch() {
    this.planningCenterStore.createHelper(377977, moment().toDate(), moment().add(5, 'days').toDate());
    this.router.navigate(['weekend-experience']);
  }


}
