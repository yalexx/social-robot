"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taskModel_1 = require("../models/taskModel");
const _ = require("lodash");
const rxjs_1 = require("rxjs");
var TaskModule;
(function (TaskModule) {
    function dailyLimitReset() {
        return rxjs_1.Observable.create((observer) => {
            taskModel_1.TaskModel.find({}).exec().then((tasksArray) => {
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
    TaskModule.dailyLimitReset = dailyLimitReset;
})(TaskModule = exports.TaskModule || (exports.TaskModule = {}));
//# sourceMappingURL=taskModule.js.map