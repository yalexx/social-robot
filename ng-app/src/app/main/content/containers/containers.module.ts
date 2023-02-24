import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../../core/modules/shared.module';

import { ContainersComponent } from './containers.component';

const routes = [
    {
        path     : 'containers',
        component: ContainersComponent
    }
];

@NgModule({
    declarations: [
      ContainersComponent
    ],
    imports     : [
        SharedModule,
        RouterModule.forChild(routes)
    ],
    exports     : [
      ContainersComponent
    ]
})

export class ContainersModule
{
}
