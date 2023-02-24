"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const fbSidModel_1 = require("../../models/fbSidModel");
const router = express.Router();
let _ = require('lodash');
require('mongoose-query-random');
router.post('/save', (req, res, next) => {
    fbSidModel_1.fbSidModel.find({
        'facebookID': req.body.facebookID
    }, (err, sidsData) => {
        if (sidsData.length === 0) {
            req.body.parseDate = new Date();
            const fbSid = new fbSidModel_1.fbSidModel(req.body);
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
router.get('/get', (req, res, next) => {
    fbSidModel_1.fbSidModel.count({
        country: "bulgaria",
        friendsParsed: { $not: { $exists: true } }
    }).then((n) => {
        let r = Math.floor(Math.random() * n);
        fbSidModel_1.fbSidModel.find({
            country: "bulgaria",
            friendsParsed: {
                $not: { $exists: true }
            }
        }).skip(r).limit(1).exec().then((doc) => {
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
router.get('/getFriend', (req, res, next) => {
    fbSidModel_1.fbSidModel.count({
        country: "bulgaria",
    }).then((n) => {
        let r = Math.floor(Math.random() * n);
        fbSidModel_1.fbSidModel.find({
            country: "bulgaria",
        }).skip(r).limit(1).exec().then((doc) => {
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
router.post('/friendsParsed', (req, res, next) => {
    console.log('update friendsParsed');
    fbSidModel_1.fbSidModel.findOne({
        _id: req.body.id
    }).exec().then((fbSid) => {
        if (fbSid) {
            fbSid.friendsParsed = new Date();
            fbSid.save().then((result) => {
                console.log(result);
                res.status(200).json(fbSid);
            }).catch((err) => {
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
router.delete('/:sidId', (req, res, next) => {
    fbSidModel_1.fbSidModel.remove({
        _id: req.params.sidId
    })
        .exec()
        .then(result => {
        res.status(200).json({
            message: 'fb Sid deleted',
            result
        });
    })
        .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
module.exports = router;
//# sourceMappingURL=fbSidsRoute.js.map