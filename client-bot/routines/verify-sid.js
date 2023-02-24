"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../modules/storage/storage");
let request = require('request');
let _ = require('lodash');
var VerifySid;
(function (VerifySid) {
    var updateVerifySid = storage_1.Storage.updateVerifySid;
    let url = 'http://socialtrack.fan-factory.com/verifysid.php?sid=';
    let data$ = storage_1.Storage.getSidData({
        sidID: { $exists: true },
        sidVerify: { $not: { $exists: true } }
    });
    let initiated = false;
    let verifyCount = 0;
    function init(app, socket, io) {
        if (!initiated) {
            getSidData(app);
            initiated = true;
        }
    }
    VerifySid.init = init;
    function getSidData(app) {
        data$.subscribe((data) => {
            app.userData = data;
            verify(app);
        });
    }
    function verify(app) {
        let requestURL = `${url}${app.userData.sidID}`;
        /*console.log('requestURL: ', requestURL);*/
        request(requestURL, (error, response, body) => {
            if (error) {
                console.log('Verify Request error: ', error);
            }
            let res = JSON.parse(body);
            console.log('body res: ', res);
            if (res.status = '1') {
                console.log(`------------ SID Verified ${verifyCount++} ------------ `);
                updateVerifyDb(app);
            }
        });
    }
    function updateVerifyDb(app) {
        updateVerifySid(app.userData._id).subscribe(() => {
            getSidData(app);
        });
    }
})(VerifySid = exports.VerifySid || (exports.VerifySid = {}));
