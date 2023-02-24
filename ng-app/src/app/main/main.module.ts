import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../core/modules/shared.module';
import {HttpClientModule} from '@angular/common/http';
import {FuseMainComponent} from './main.component';
import {FuseContentComponent} from './content/content.component';
import {FuseFooterComponent} from './footer/footer.component';
import {FuseNavbarVerticalComponent} from './navbar/vertical/navbar-vertical.component';
import {FuseToolbarComponent} from './toolbar/toolbar.component';
import {FuseNavigationModule} from '../core/components/navigation/navigation.module';
import {FuseNavbarVerticalToggleDirective} from './navbar/vertical/navbar-vertical-toggle.directive';
import {FuseNavbarHorizontalComponent} from './navbar/horizontal/navbar-horizontal.component';
import {FuseQuickPanelComponent} from './quick-panel/quick-panel.component';
import {FuseThemeOptionsComponent} from '../core/components/theme-options/theme-options.component';
import {FuseShortcutsModule} from '../core/components/shortcuts/shortcuts.module';
import {FuseSearchBarModule} from '../core/components/search-bar/search-bar.module';
import {ApiService} from "../core/services/api.service";
import {AuthenticationService} from "../core/services/authentication.service";
import {AuthInterceptor} from "../core/services/interceptors/authentication-interceptor.service";
@NgModule({
  declarations: [
    FuseContentComponent,
    FuseFooterComponent,
    FuseMainComponent,
    FuseNavbarVerticalComponent,
    FuseNavbarHorizontalComponent,
    FuseToolbarComponent,
    FuseNavbarVerticalToggleDirective,
    FuseThemeOptionsComponent,
    FuseQuickPanelComponent
  ],
  providers: [
    ApiService,
    AuthenticationService,
  ],
  imports: [
    HttpClientModule,
    SharedModule,
    RouterModule,
    FuseNavigationModule,
    FuseShortcutsModule,
    FuseSearchBarModule
  ],
  exports: [
    FuseMainComponent
  ]
})

export class FuseMainModule {
}
