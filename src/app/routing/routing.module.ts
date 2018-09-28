import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from '../pages/home-page/home-page.component';

export const appRoutes: Routes = [
    {
        component: HomePageComponent,
        path: ''
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