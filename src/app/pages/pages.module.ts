import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material.module';
import { ServicesModule } from '../services/services.module';
import { HomePageComponent } from './home-page/home-page.component';

@NgModule({
    declarations: [
        HomePageComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        ServicesModule,
    ],
    providers: [],
    bootstrap: [HomePageComponent]
})
export class PagesModule { }
