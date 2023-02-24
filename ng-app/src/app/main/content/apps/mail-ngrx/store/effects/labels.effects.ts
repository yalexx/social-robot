import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import { of } from 'rxjs/observable/of';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as LabelsActions from '../actions/labels.actions';
import { MailNgrxService } from '../../mail.service';

@Injectable()
export class LabelsEffect
{
    constructor(
        private actions: Actions,
        private mailService: MailNgrxService
    )
    {
    }

    /**
     * Get Labels from Server
     * @type {Observable<any>}
     */
    @Effect()
    getLabels: Observable<LabelsActions.LabelsActionsAll> =
        this.actions
            .ofType<LabelsActions.GetLabels>(LabelsActions.GET_LABELS)
            .pipe(
                switchMap((action) => {
                        return this.mailService.getLabels()
                                   .pipe(
                                       map((labels: any) => {
                                           return new LabelsActions.GetLabelsSuccess(labels);
                                       }),
                                       catchError(err => of(new LabelsActions.GetLabelsFailed(err)))
                                   );
                    }
                ));
}
