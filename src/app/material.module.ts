import { NgModule } from '@angular/core';
import { MatButtonModule, MatCheckboxModule } from '@angular/material';

const MODULES = [MatButtonModule, MatCheckboxModule];

@NgModule({
  imports: [...MODULES],
  exports: [...MODULES],
})
export class MaterialModule { }