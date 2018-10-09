import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlanningCenterService } from '@services/planning-center.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private router: Router, private planningCenterService: PlanningCenterService) { }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
