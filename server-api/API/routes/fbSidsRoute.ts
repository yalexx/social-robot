import * as express from "express";
import * as mongoose from "mongoose";
import {fbSidModel} from "../../models/fbSidModel";
const router = express.Router();
let _ = require('lodash');
require('mongoose-query-random');

router.post('/save', (req: any, res: any, next: any) => {

    fbSidModel.find({
        'facebookID': req.body.facebookID
    }, (err: any, sidsData: any) => {

        if (sidsData.length === 0) {


            req.body.parseDate = new Date();
            const fbSid = new fbSidModel(req.body);

            fbSid.save().then((result) => {
                console.log(result);
            }).catch(err => {
                console.log(err);
            });
        }
        else {
            console.log('fbSid Exists');
        }
    });
    res.status(200).json();
});

router.get('/get', (req: any, res: any, next: any) => {

    fbSidModel.count({
        country: "bulgaria",
        friendsParsed: {$not: {$exists: true}}
    }).then((n) => {

        let r = Math.floor(Math.random() * n);
        fbSidModel.find({
            country: "bulgaria",
            friendsParsed: {
                $not: {$exists: true}
            }
        }).skip(r).limit(1).exec().then((doc: any) => {
            if (doc) {
                let fbSid = doc[0];
                console.log('fbSid ID: ', fbSid._id);
                res.status(200).json(fbSid);
            }
            else {
                res.status(200).json({
                    message: 'No FBSid for parsing found!'
                });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    });
});

router.get('/getFriend', (req: any, res: any, next: any) => {
    fbSidModel.count({
        country: "bulgaria",
    }).then((n) => {
        let r = Math.floor(Math.random() * n);
        fbSidModel.find({
            country: "bulgaria",
        }).skip(r).limit(1).exec().then((doc: any) => {
            if (doc) {
                let fbSid = doc[0];
                console.log('fbSid ID: ', fbSid._id);
                res.status(200).json(fbSid);
            }
            else {
                res.status(200).json({
                    message: 'No FBSid for parsing found!'
                });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    });
});

router.post('/friendsParsed', (req: any, res: any, next: any) => {

    console.log('update friendsParsed');
    fbSidModel.findOne({
        _id: req.body.id
    }).exec().then((fbSid: any) => {
        if (fbSid) {

            fbSid.friendsParsed = new Date();
            fbSid.save().then((result: any) => {
                console.log(result);
                res.status(200).json(fbSid);
            }).catch((err: any) => {
                console.log(err);
                res.status(500).json(err);
            });

        }
        else {
            res.status(200).json({
                message: 'No FBSid for parsing found!'
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

});

router.delete('/:sidId', (req: any, res: any, next: any) => {
    fbSidModel.remove({
        _id: req.params.sidId
    })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'fb Sid deleted',
                result
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;