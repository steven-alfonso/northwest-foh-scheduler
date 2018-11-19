import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { EquipmentStore } from './equipment/equipment.store';
import { PlanningCenterStore } from './planning-center/planning-center.store';

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule,
  ],
  providers: [
    EquipmentStore,
    PlanningCenterStore,
  ],
  bootstrap: [],
})
export class StoresModule {}
