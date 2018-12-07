import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppInitService } from './app.init';
import { MaterialModule } from './material.module';
import { PagesModule } from './pages/pages.module';
import { RoutingModule } from './routing/routing.module';
import { ServicesModule } from './services/services.module';
import { StoresModule } from './stores/stores.module';

export function initApp(appInitService: AppInitService) {
  return () => appInitService.init();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    // AngularFireModule.initializeApp(config.firebase),
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    PagesModule,
    RoutingModule,
    ServicesModule,
    StoresModule
  ],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AppInitService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
