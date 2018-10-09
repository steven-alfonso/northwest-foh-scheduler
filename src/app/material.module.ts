import { NgModule } from '@angular/core';
import { MatButtonModule, MatCheckboxModule, MatTableModule, MatToolbarModule } from '@angular/material';

const MODULES = [
  MatButtonModule,
  MatCheckboxModule,
  MatTableModule,
  MatToolbarModule,
];

@NgModule({
  imports: [...MODULES],
  exports: [...MODULES],
})
export class MaterialModule { }