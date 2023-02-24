"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const taskModel_1 = require("../../models/taskModel");
const sidModel_1 = require("../../models/sidModel");
const checkAuth = require('../middleware/check-auth');
const router = express.Router();
const _ = require("lodash");
const taskModule_1 = require("../../modules/taskModule");
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /products'
    });
});
router.post('/createTask', checkAuth, (req, res, next) => {
    sidModel_1.SidModel.find(req.body.sidFilter, (err, sidsData) => {
        let SIDs = _.map(sidsData, (sid) => {
            return sid._id;
        });
        SIDs = _.shuffle(SIDs);
        console.log(typeof req.body.startSidsCount);
        const task = new taskModel_1.TaskModel({
            name: req.body.name,
            state: 'active',
            routine: req.body.routine,
            sids: SIDs.splice((SIDs.length - req.body.startSidsCount), SIDs.length),
            url: req.body.url,
            country: req.body.country,
            skipInvite: req.body.skipInvite,
            skipLike: req.body.skipLike,
            startSidsCount: req.body.startSidsCount,
            sidsUsed: [],
            priority: req.body.priority,
            dailyLimit: _.random(req.body.limitRange[0], req.body.limitRange[1]),
            limitRange: req.body.limitRange,
            createdOn: new Date(),
            actionsToday: 0,
        });
        task.save().then((result) => {
            res.status(201).json(task);
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    }).select('_id');
});
router.post('/editTask', (req, res, next) => {
    sidModel_1.SidModel.find(req.body.sidFilter, (err, sidsData) => {
        console.log('editTask filter: ', req.body.sidFilter);
        let newSids = _.map(sidsData, (sid) => {
            return sid._id;
        });
        newSids = _.shuffle(newSids);
        taskModel_1.TaskModel.findById(req.body.taskID).exec().then((task) => {
            let oldSids = task.sids;
            let newArray = newSids.filter((el) => {
                return task.sidsUsed.indexOf(el) < 0;
            });
            console.log('req.body.addNewSids: ', typeof req.body.addNewSids);
            if (newArray.length > 0) {
                task.sids = newArray.splice((newArray.length - (Number(req.body.addNewSids) + oldSids.length)), newArray.length);
                task.startSidsCount = task.sids.length;
                task.updatedOn = new Date();
                task.country = req.body.sidFilter.country;
                task.save();
            }
            res.status(201).json({
                oldSids: oldSids.length,
                sidsAdded: task.sids.length,
            });
        });
    }).select('_id');
});
router.post('/editState', (req, res, next) => {
    taskModel_1.TaskModel.findById(req.body.taskID).exec().then((task) => {
        task.state = req.body.state;
        task.save();
        res.status(201).json({
            message: 'State Updated'
        });
    });
});
router.get('/dailyLimitReset', (req, res, next) => {
    taskModule_1.TaskModule.dailyLimitReset().subscribe();
    res.status(201).json('Reset Done');
});
router.get('/getTask', (req, res, next) => {
    let selector;
    let priorityState = true;
    console.log('Get task');
    let taskIndex;
    getTask();
    function getTask() {
        if (priorityState) {
            selector = {
                "priority": true,
                "state": "active",
                "$expr": {
                    "$gt": ["$dailyLimit", "$actionsToday"]
                }
            };
        }
        else {
            selector = {
                "priority": { $ne: true },
                "state": 'active',
                "$expr": {
                    "$gt": ["$dailyLimit", "$actionsToday"]
                },
            };
        }
        /* if (priorityState) {
             selector = {
                 $where: "this.actionsToday < this.dailyLimit",
                 "state": 'active',
                 "priority": true,
             };
         }
         else {
             selector = {
                 $where: "this.actionsToday < this.dailyLimit",
                 "state": 'active',
                 "priority": {$ne: true}
             };
         }*/
        taskModel_1.TaskModel.find(selector).exec().then((doc) => {
            if (doc.length !== 0) {
                taskIndex = _.random(0, (doc.length - 1));
                doc = doc[taskIndex];
                if (doc.sids.length <= 1) {
                    doc.state = 'finished';
                    doc.save();
                    res.status(200).json({
                        message: 'Task finished'
                    });
                    console.log('Task Finished > set state finished');
                }
                else {
                    console.log('task name ', doc.name);
                    res.status(200).json({
                        routine: doc.routine,
                        taskID: doc._id,
                        skipInvite: doc.skipInvite,
                        skipLike: doc.skipLike,
                        type: doc.type,
                        url: doc.url,
                        sidsLeft: doc.sids.length,
                        sid_ID: _.sample(doc.sids)
                    });
                }
            }
            else {
                if (priorityState) {
                    priorityState = false;
                    getTask();
                }
                else {
                    res.status(200).json({
                        message: 'No tasks'
                    });
                }
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    }
});
router.get('/listTasks', (req, res, next) => {
    taskModel_1.TaskModel.find().exec().then((doc) => {
        if (doc) {
            let tasks = _.map(doc, (task) => {
                return {
                    name: task.name,
                    taskID: task._id,
                    url: task.url,
                    routine: task.routine,
                    skipLike: task.skipLike,
                    skipInvite: task.skipInvite,
                    country: task.country,
                    dailyLimit: task.dailyLimit,
                    sidsUsed: task.sidsUsed.length,
                    priority: task.priority,
                    state: task.state,
                    sidsLeft: task.sids.length,
                    sidsTotal: task.startSidsCount,
                    actionsToday: task.actionsToday
                };
            });
            console.log('Found task');
            res.status(200).json(tasks);
        }
        else {
            res.status(200).json({
                message: 'No tasks'
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
router.post('/updateTask', (req, res, next) => {
    taskModel_1.TaskModel.findById(req.body.taskID).exec().then((task) => {
        let sidID = req.body.sid_ID;
        let index = task.sids.indexOf(sidID);
        if (index > -1) {
            task.sids.splice(index, 1);
        }
        /*task.sidsUsed.push(sidID);*/
        task.sidsUsed = task.sidsUsed.concat(sidID);
        task.actionsToday++;
        console.log('/updateTask actionsToday: ', task.actionsToday);
        task.save((err) => {
            if (err) {
                res.status(500).json({
                    error: err
                });
            }
            else {
                res.status(201).json({
                    message: 'Task updated',
                    sidRemoved: sidID
                });
            }
        });
    });
});
router.get('/:taskId', (req, res, next) => {
    const id = req.params.taskId;
    taskModel_1.TaskModel.findById(id).exec().then(doc => {
        if (doc) {
            res.status(200).json(doc);
        }
        else {
            res.status(404).json({
                message: "Not valid entry for provided ID"
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
router.delete('/:taskId', (req, res, next) => {
    res.status(200).json({
        message: 'Deleted task!'
    });
});
module.exports = router;
//# sourceMappingURL=tasksRoute.js.map