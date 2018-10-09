import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from '@pages/home-page/home-page.component';
import { WeekendExperiencePageComponent } from '@pages/weekend-experience-page/weekend-experience-page.component';

export const appRoutes: Routes = [
    {
        component: HomePageComponent,
        path: '',
    },
    {
        component: WeekendExperiencePageComponent,
        // children: [{
        //     path: '',
        //     pathMatch: 'full',
        //     redirectTo: ':weekendExperienceId'
        // }, {
        //     component: null,
        //     path: ':weekendExperienceId'
        // }],
        path: 'weekend-experience'
    },
    {
        component: HomePageComponent,
        path: '**'
    }
];

@NgModule({
    exports: [
        RouterModule
    ],
    imports: [
        RouterModule.forRoot(appRoutes)
    ]
})
export class RoutingModule { }