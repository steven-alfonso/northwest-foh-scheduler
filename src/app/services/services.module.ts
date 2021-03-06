import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { PlanningCenterService } from './planning-center.service';
import { ConfigService } from './config.service';

@NgModule({
  declarations: [
  ],
  imports: [
    HttpClientModule,
  ],
  providers: [
    ConfigService,
    PlanningCenterService,
  ],
  bootstrap: []
})
export class ServicesModule { }
