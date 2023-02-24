import {Storage} from "../modules/storage/storage";

let request = require('request');
let _ = require('lodash');

export module VerifySid {

    import updateVerifySid = Storage.updateVerifySid;
    let url = 'http://socialtrack.fan-factory.com/verifysid.php?sid=';
    let data$ = Storage.getSidData({
        sidID: {$exists: true},
        sidVerify: {$not: {$exists: true}}
    });
    let initiated = false;
    let verifyCount: number = 0;

    export function init(app, socket, io) {
        if (!initiated) {
            getSidData(app);
            initiated = true;
        }

    }

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
}