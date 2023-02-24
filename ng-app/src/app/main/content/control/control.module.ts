import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {SharedModule} from '../../../core/modules/shared.module';
import {FuseWidgetModule} from "../../../core/components/widget/widget.module";
import {ControlComponent} from "./control.component";
import {SafePipe} from "./safe.pipe";


const routes = [
  {
    path: 'control',
    component: ControlComponent
  }
];

@NgModule({
  declarations: [
    ControlComponent,
    SafePipe
  ],
  imports: [
    FuseWidgetModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    ControlComponent
  ]
})

export class ControlModule {
}
