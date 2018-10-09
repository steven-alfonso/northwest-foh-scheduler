import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { PlanningCenterStore } from './planning-center/planning-center.store';

@NgModule({
  declarations: [
  ],
  imports: [
    HttpClientModule,
  ],
  providers: [
    PlanningCenterStore
  ],
  bootstrap: []
})
export class StoresModule { }
