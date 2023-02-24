"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const removedSidsModel_1 = require("../../models/removedSidsModel");
const eventModel_1 = require("../../models/eventModel");
const router = express.Router();
const moment = require("moment");
const rxjs_1 = require("rxjs");
let removedSidsTotal;
const checkAuth = require('../middleware/check-auth');
let resObj = [];
router.post('/removedSids', (req, res, next) => {
    let now = new Date();
    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    console.log("now:", now);
    console.log("yesterday: ", yesterday);
    let searchObj = {
        "removedDate": { $gt: new Date(yesterday).toISOString() },
        "haveProfilePhoto": true,
        "verificationDate": { $lt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString() }
    };
    console.log(searchObj);
    removedSidsModel_1.RemovedSidsModel.count(searchObj).exec().then((removedSidsCount) => {
        console.log('Removed Sids count: ', removedSidsCount);
        res.status(200).json({
            removedToday: removedSidsCount
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
router.post('/events', (req, res, next) => {
    let yesterday = moment().subtract(1, 'day');
    console.log('Yesterday is: ', yesterday);
    console.log('Provider is: ', req.body.provider);
    const events = [
        "registerWebDe",
        "validateFacebookWebDe",
        "profilePhoto",
        "coverPhoto",
        "initialShares",
        "storeCookie",
        "addFriends",
        "suggestedFriends",
        "likePage",
        "postPhotos",
    ];
    function getEvents() {
        return rxjs_1.Observable.create((observer) => {
            for (let i = 0; i <= events.length; i++) {
                let searchObj = {
                    "date": { "$gte": yesterday, "$lt": moment() },
                    "type": events[i],
                };
                eventModel_1.EventModel.count(searchObj).exec().then((eventsData) => {
                    console.log(eventsData);
                    if (events[i]) {
                        observer.next({
                            name: events[i],
                            count: eventsData
                        });
                    }
                    if (i === events.length) {
                        setTimeout(() => {
                            observer.complete();
                        }, 300);
                    }
                }).catch(err => {
                    console.log(err);
                    observer.error(err);
                });
            }
        });
    }
    resObj = [];
    getEvents().subscribe((data) => {
        console.log(data);
        if (data)
            resObj.push(data);
    }, (err) => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }, () => {
        res.status(200).json(resObj);
    });
});
router.post('/sendEvent', (req, res, next) => {
    const event = new eventModel_1.EventModel({
        type: req.body.type,
        date: new Date(),
        id: req.body.id,
        success: req.body.success,
        provider: req.body.provider,
        customData: req.body.customData || null
    });
    event.save().then((result) => {
        console.log(result);
        res.status(201).json(event);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
module.exports = router;
//# sourceMappingURL=statsRoute.js.map