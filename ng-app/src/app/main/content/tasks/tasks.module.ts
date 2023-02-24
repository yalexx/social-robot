import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {SharedModule} from '../../../core/modules/shared.module';
import {TasksComponent} from "./tasks.component";
import {FuseWidgetModule} from "../../../core/components/widget/widget.module";


const routes = [
  {
    path: 'tasks',
    component: TasksComponent
  }
];

@NgModule({
  declarations: [
    TasksComponent
  ],
  imports: [
    FuseWidgetModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    TasksComponent
  ]
})

export class TasksModule {
}
