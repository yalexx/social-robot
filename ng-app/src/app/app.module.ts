import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule, Routes} from '@angular/router';
import 'hammerjs';
import {SharedModule} from './core/modules/shared.module';
import {AppComponent} from './app.component';
import {FuseMainModule} from './main/main.module';
import {FuseSplashScreenService} from './core/services/splash-screen.service';
import {FuseConfigService} from './core/services/config.service';
import {FuseNavigationService} from './core/components/navigation/navigation.service';
import {TranslateModule} from '@ngx-translate/core';
import {ContainersModule} from "./main/content/containers/containers.module";
import {FusePagesModule} from "./main/content/pages/pages.module";

import {StatsModule} from "./main/content/stats/stats.module";
import {TasksModule} from "./main/content/tasks/tasks.module";
import {AuthInterceptor} from "./core/services/interceptors/authentication-interceptor.service";
import {ControlModule} from "./main/content/control/control.module";

const appRoutes: Routes = [
  {
    path: '**',
    redirectTo: 'control'
  }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    SharedModule,
    TranslateModule.forRoot(),
    FuseMainModule,
    ContainersModule,
    FusePagesModule,
    StatsModule,
    ControlModule,
    TasksModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    FuseSplashScreenService,
    FuseConfigService,
    FuseNavigationService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
