import { NgModule } from '@angular/core';
import { MatButtonModule, MatCheckboxModule, MatTableModule, MatToolbarModule, MatSelectModule } from '@angular/material';

const MODULES = [
  MatButtonModule,
  MatCheckboxModule,
  MatTableModule,
  MatToolbarModule,
  MatSelectModule
];

@NgModule({
  imports: [...MODULES],
  exports: [...MODULES],
})
export class MaterialModule { }