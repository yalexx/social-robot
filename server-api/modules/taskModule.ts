import {TaskModel} from '../models/taskModel';
import * as _ from 'lodash';
import {Observable} from 'rxjs';

export module TaskModule {

    export function dailyLimitReset(): Observable<any> {

        return Observable.create((observer: any) => {

            TaskModel.find({}).exec().then((tasksArray: any) => {
                for (let task of tasksArray) {
                    const limit = _.random(task.limitRange[0], task.limitRange[1]);
                    task.dailyLimit = limit;
                    task.actionsToday = 0;
                    task.save();
                }
                observer.next(true);
            }).catch(err => {
                observer.error(err);

            });
            observer.complete();
        });

    }
}