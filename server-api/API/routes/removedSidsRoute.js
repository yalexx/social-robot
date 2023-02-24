"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const removedSidsModel_1 = require("../../models/removedSidsModel");
const moment = require("moment");
const sidModel_1 = require("../../models/sidModel");
let _ = require('lodash');
let request = require('request');
let express = require('express');
let router = express.Router();
/*let APIURL =  'https://httpbin.org/post';*/
let APIURL = 'http://socialtrack.fan-factory.com/socialbots/update_accounts/mark_deleted';
router.get('/all', (req, res, next) => {
    console.log('Send all removed sids manually.');
    banSend();
    function banSend() {
        removedSidsModel_1.RemovedSidsModel.findOne({
            provider: { $ne: "abv.bg" },
            sidVerify: true,
            banSend: {
                $not: {
                    $lt: new Date(),
                    $gte: new Date(new Date().setDate(new Date().getDate() - 1))
                }
            }
        }).exec().then((resSid) => {
            console.log('SID: ', resSid);
            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: APIURL,
                body: "data=" + JSON.stringify([{
                        "sid": resSid.sidID,
                        "value": resSid.removedDate,
                        "accounttype": "facebook"
                    }]),
            }, (error, response, body) => {
                console.log('RemovedSids RES: ', body);
                if (error) {
                    console.log('error: ', error);
                    /*res.json(error);*/
                }
                else {
                    resSid.banSend = new Date();
                    resSid.save();
                    console.log('res body: ', body);
                    banSend();
                }
                console.log("SendRemovedSids res: ", body);
            });
        }).catch(err => console.log(err));
    }
});
router.get('/lastLoginRemovedSids', (req, res, next) => {
    console.log('Send all removed sids manually.');
    lastLoginSendSids();
    function lastLoginSendSids() {
        removedSidsModel_1.RemovedSidsModel.findOne({
            provider: { $ne: "abv.bg" },
            sidVerify: true,
            sidID: { $exists: true },
            loginSend: { $not: { $exists: true } }
        }).exec().then((resSid) => {
            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: 'http://socialtrack.fan-factory.com/socialbots/update_accounts/update_data',
                body: "data=" + JSON.stringify([{
                        "sid": resSid.sidID,
                        "lastlogin": resSid.lastLogin,
                        "accounttype": "facebook"
                    }]),
            }, (error, response, body) => {
                console.log('RemovedSids RES: ', body);
                if (error) {
                    console.log('error: ', error);
                    /*res.json(error);*/
                }
                else {
                    resSid.loginSend = new Date();
                    resSid.save();
                    console.log('res body: ', body);
                    lastLoginSendSids();
                }
                console.log("SendRemovedSids res: ", body);
            });
        }).catch(err => console.log(err));
    }
});
router.get('/lastLoginSids', (req, res, next) => {
    console.log('Send all removed sids manually.');
    lastLoginSend();
    function lastLoginSend() {
        sidModel_1.SidModel.findOne({
            provider: { $ne: "abv.bg" },
            sidVerify: true,
            sidID: { $exists: true },
            loginSend: { $not: { $exists: true } }
        }).exec().then((resSid) => {
            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: 'http://socialtrack.fan-factory.com/socialbots/update_accounts/update_data',
                body: "data=" + JSON.stringify([{
                        "sid": resSid.sidID,
                        "lastlogin": resSid.lastLogin,
                        "accounttype": "facebook"
                    }]),
            }, (error, response, body) => {
                console.log('RemovedSids RES: ', body);
                if (error) {
                    console.log('error: ', error);
                    /*res.json(error);*/
                }
                else {
                    resSid.loginSend = new Date();
                    resSid.save();
                    console.log('res body: ', body);
                    lastLoginSend();
                }
                console.log("SendRemovedSids res: ", body);
            });
        }).catch(err => console.log(err));
    }
});
router.get('/reset', (req, res, next) => {
    console.log('Send all removed sids manually.');
    lastLoginSend();
    let i = 1;
    function lastLoginSend() {
        // groupInvited | group
        sidModel_1.SidModel.findOne({
            'groupInvited': { $exists: true }, 'isVerified': true
        }).exec().then((resSid) => {
            console.log('Sid reset', i++);
            resSid.groupInvited = undefined;
            resSid.save({ validateBeforeSave: false });
            lastLoginSend();
        }).catch(err => console.log(err));
    }
});
function checkIfTodayOrYesterday(nDate) {
    let isOk = false;
    let today = moment();
    let yesterday = moment().subtract(1, 'day');
    let engagementDate = moment(nDate);
    if (moment(engagementDate).isSame(yesterday, 'day')) {
        isOk = true;
    }
    return isOk;
}
router.get('/', (req, res, next) => {
    removedSidsModel_1.RemovedSidsModel.find((err, removedSids) => {
        if (err)
            return next(err);
        let newData = [];
        _.map(removedSids, reduceSids);
        function reduceSids(removedSid) {
            if (checkIfTodayOrYesterday(removedSid.removedDate)) {
                newData.push({
                    'sid': removedSid.sidID,
                    'value': removedSid.removedDate,
                    'accounttype': 'facebook',
                });
            }
        }
        console.log('RemovedSids COUNT: ', newData.length);
        request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: APIURL,
            body: "data=" + JSON.stringify(newData),
        }, function (error, response, body) {
            console.log('RemovedSids RES: ', body);
            if (error) {
                console.log('error: ', error);
            }
            console.log("SendRemovedSids res: ", body);
        });
        res.json(newData.length);
    });
});
module.exports = router;
//# sourceMappingURL=removedSidsRoute.js.map