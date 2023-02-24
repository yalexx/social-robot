import * as express from "express";
import {TaskModel} from "../../models/taskModel";
import {SidModel} from "../../models/sidModel";
import * as mongoose from "mongoose";

const router = express.Router();
let _ = require('lodash');

router.post('/getSid', (req: any, res: any, next: any) => {
    let fields = {registerEmail: 1, name: 1, familyName: 1, gender: 1, lastLogin: 1, country: 1};
    let options = {limit: 10};
    SidModel.findRandom(req.body.sidFilter, fields, options, (err, sidsData) => {
        if (err) {
            res.status(500).json(err);
            console.log(err);
        }
        else {
            res.status(200).json(sidsData);
        }
    });
});

router.post('/setFavorites', (req: any, res: any, next: any) => {
    let fields = {registerEmail: 1, name: 1, familyName: 1, gender: 1, lastLogin: 1, country: 1, favorites: 1};

    console.log('req.body.SIDId: ', req.body.SIDId);
    console.log('req.body.userID: ', req.body.userID);

    SidModel.findById(req.body.SIDId, fields, {}, (err, sidsData: any) => {
        if (err) {
            res.status(500).json(err);
            console.log(err);
        }
        else {
            sidsData.favorites = req.body.userID;
            sidsData.save();
            res.status(200).json(sidsData);
        }
    });
});

router.post('/removeFavorites', (req: any, res: any, next: any) => {
    let fields = {registerEmail: 1, name: 1, familyName: 1, gender: 1, lastLogin: 1, country: 1, favorites: 1};
    SidModel.findById(req.body.SIDId, fields, {}, (err, sidsData: any) => {
        if (err) {
            res.status(500).json(err);
            console.log(err);
        }
        else {
            sidsData.favorites = undefined;
            sidsData.save();
            res.status(200).json(sidsData);
        }
    });
});

router.post('/getFavorites', (req: any, res: any, next: any) => {
    let fields = {registerEmail: 1, name: 1, familyName: 1, gender: 1, lastLogin: 1, country: 1, favorites: 1};
    let filter = {
        "favorites": {"$exists": true},
    };
    SidModel.find(filter, fields, {}, (err, sidsData: any) => {
        if (err) {
            res.status(500).json(err);
            console.log(err);
        }
        else {
            res.status(200).json(sidsData);
        }
    });
});

router.post('/getRandomSid', (req: any, res: any, next: any) => {

    let sidFilter: any = {};
    sidFilter[req.body.sidFilter] = {$exists: true};

    SidModel.find(sidFilter, (err: any, sidsData: any) => {

        let SIDs = _.map(sidsData, (sid: any) => {
            return sid._id
        });

        const task = new TaskModel({
            name: req.body.name,
            routine: req.body.routine,
            sids: SIDs,
            url: req.body.url,
            startSidsCount: SIDs.length
        });
        task.save().then((result) => {
            console.log(result);
            res.status(201).json(task);
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

    }).select('_id');
});

router.get('/getTask', (req: any, res: any, next: any) => {

    TaskModel.find({
        "routine": 'likePage'
    }).exec().then((doc: any) => {
        let taskIndex = _.random(0, (doc.length - 1));
        console.log('@Task Index: ', taskIndex);
        doc = doc[taskIndex];
        console.log('Task ID: ', doc._id);
        console.log('Task Name: ', doc.name);

        if (doc) {
            let sidsArray: any = doc.sids;
            res.status(200).json({
                taskID: doc._id,
                url: doc.url,
                sidsLeft: sidsArray.length,
                sid_ID: _.sample(sidsArray)
            });
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

router.post('/updateTask', (req: any, res: any, next: any) => {

    TaskModel.findById(req.body.taskID).exec().then((task: any) => {

        let sidID = req.body.sid_ID;
        let index = task.sids.indexOf(sidID);
        if (index > -1) {
            task.sids.splice(index, 1);
        }

        task.save((err: any) => {
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

router.get('/:taskId', (req: any, res: any, next: any) => {
    const id = req.params.taskId;

    TaskModel.findById(id).exec().then(doc => {

        if (doc) {
            res.status(200).json(doc);
        }
        else {
            res.status(404).json({
                message: "Not valid entry for provided ID"
            })
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:taskId', (req: any, res: any, next: any) => {
    res.status(200).json({
        message: 'Deleted task!'
    })
});

module.exports = router;