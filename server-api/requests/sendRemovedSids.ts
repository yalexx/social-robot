import {RemovedSidsModel} from "../models/removedSidsModel";
import moment = require("moment");

let request = require('request');
let express = require('express');
let _ = require('lodash');

export function sendRemovedSids(callback: any) {

    function checkIfTodayOrYesterday(nDate: any) {
        let isOk = false;
        let today = moment();
        let yesterday = moment().subtract(1, 'day');
        let engagementDate = moment(nDate);
        if (moment(engagementDate).isSame(yesterday, 'day')) {
            isOk = true;
        }
        return isOk;
    }

    RemovedSidsModel.find((err: any, removedSids: any) => {

        if (err) callback(err);

        let newData: Array<object> = [];

        _.map(removedSids, reduceSids);

        function reduceSids(removedSid: any) {

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

