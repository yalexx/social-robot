import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {SharedModule} from '../../../core/modules/shared.module';
import {StatsComponent} from "./stats.component";
import {FuseWidgetModule} from "../../../core/components/widget/widget.module";


const routes = [
  {
    path: 'stats',
    component: StatsComponent
  }
];

@NgModule({
  declarations: [
    StatsComponent
  ],
  imports: [
    FuseWidgetModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    StatsComponent
  ]
})

export class StatsModule {
}
