import { NgModule } from '@angular/core';
import { SharedModule } from '../../../core/modules/shared.module';
import { RouterModule } from '@angular/router';
import { FuseAngularMaterialModule } from '../components/angular-material/angular-material.module';

const routes = [
    {
        path        : 'dashboards/project',
        loadChildren: './dashboards/project/project.module#FuseProjectDashboardModule'
    },
    {
        path        : 'dashboards/analytics',
        loadChildren: './dashboards/analytics/analytics.module#FuseAnalyticsDashboardModule'
    },
    {
        path        : 'mail',
        loadChildren: './mail/mail.module#FuseMailModule'
    },
    {
        path        : 'mail-ngrx',
        loadChildren: './mail-ngrx/mail.module#FuseMailNgrxModule'
    },
    {
        path        : 'chat',
        loadChildren: './chat/chat.module#FuseChatModule'
    },
    {
        path        : 'calendar',
        loadChildren: './calendar/calendar.module#FuseCalendarModule'
    },
    {
        path        : 'e-commerce',
        loadChildren: './e-commerce/e-commerce.module#FuseEcommerceModule'
    },
    {
        path        : 'academy',
        loadChildren: './academy/academy.module#FuseAcademyModule'
    },
    {
        path        : 'todo',
        loadChildren: './todo/todo.module#FuseTodoModule'
    },
    {
        path        : 'file-manager',
        loadChildren: './file-manager/file-manager.module#FuseFileManagerModule'
    },
    {
        path        : 'contacts',
        loadChildren: './contacts/contacts.module#FuseContactsModule'
    },
    {
        path        : 'scrumboard',
        loadChildren: './scrumboard/scrumboard.module#FuseScrumboardModule'
    }
];

@NgModule({
    imports     : [
        SharedModule,
        RouterModule.forChild(routes),
        FuseAngularMaterialModule
    ],
    declarations: []
})
export class FuseAppsModule
{
}
