import * as express from "express";
import {RemovedSidsModel} from "../../models/removedSidsModel";
import {EventModel} from "../../models/eventModel";

const router = express.Router();
import moment = require("moment");
import {Browser} from "../../../client-bot/modules/browser/browser";
import {Observable, Subject, ReplaySubject, from, of, range} from 'rxjs';

let removedSidsTotal: any;
const checkAuth = require('../middleware/check-auth');
let resObj: any = [];

router.post('/removedSids', (req, res, next) => {
    let now = new Date();
    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

    console.log("now:", now);
    console.log("yesterday: ", yesterday);

    let searchObj: any = {
        "removedDate": {$gt: new Date(yesterday).toISOString()},
        "haveProfilePhoto": true,
        "verificationDate": {$lt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString()}
    };

    console.log(searchObj);

    RemovedSidsModel.count(searchObj).exec().then((removedSidsCount: any) => {
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

    function getEvents(): Observable<object> {

        return Observable.create((observer: any) => {

            for (let i = 0; i <= events.length; i++) {

                let searchObj: any = {
                    "date": {"$gte": yesterday, "$lt": moment()},
                    "type": events[i],
                };

                EventModel.count(searchObj).exec().then((eventsData: any) => {
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

    getEvents().subscribe((data: any) => {
        console.log(data);
        if (data) resObj.push(data);

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

    const event = new EventModel({
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