import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServicesModule } from '@services/services.module';
import { MaterialModule } from '../material.module';
import { HomePageComponent } from './home-page/home-page.component';
import { WeekendExperiencePageComponent } from './weekend-experience-page/weekend-experience-page.component';

@NgModule({
    declarations: [
        HomePageComponent,
        WeekendExperiencePageComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        ServicesModule,
    ],
    providers: [],
    bootstrap: [HomePageComponent],
})
export class PagesModule { }
