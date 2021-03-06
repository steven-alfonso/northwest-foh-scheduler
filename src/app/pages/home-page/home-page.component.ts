import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlanningCenterStore } from '@stores/planning-center/planning-center.store';
import moment from 'moment/moment';

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
    this.planningCenterStore.createHelper(377977, moment().toDate(), moment().add(7, 'days').toDate());
    this.router.navigate(['weekend-experience']);
  }


}
