"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const removedSidsModel_1 = require("../models/removedSidsModel");
const moment = require("moment");
let request = require('request');
let express = require('express');
let _ = require('lodash');
function sendRemovedSids(callback) {
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
    removedSidsModel_1.RemovedSidsModel.find((err, removedSids) => {
        if (err)
            callback(err);
        let newData = [];
        _.map(removedSids, reduceSids);
        function reduceSids(removedSid) {
            if (checkIfTodayOrYesterday(removedSid.removedDate)) {
                newData.push({
                    'sid': removedSid.sidID,
                    'value': removedSid.removedDate,
                    'accounttype': 'facebook'
                });
            }
        }
        /*request.post({
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            url: APIURL,
            body: "data=" + JSON.stringify(newData),
        }, function (error: any, response: any, body: any) {
            console.log('RemovedSids RES: ', body);
            if (error) {
                console.log('error: ', error);
                callback(error);
            }
            else {
                callback(body);
            }
        });*/
    });
}
exports.sendRemovedSids = sendRemovedSids;
//# sourceMappingURL=sendRemovedSids.js.map