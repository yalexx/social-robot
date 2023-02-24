"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
require("rxjs/add/operator/map");
const unitls_1 = require("../utils/unitls");
var IsJsonString = unitls_1.Utils.IsJsonString;
const settings_1 = require("../../../settings");
class API {
    constructor(request) {
        this.APIURL = 'http://socialtrack.fan-factory.com/';
        this.wid = 3131;
        this.apikey = 'aIwo2Mm7cnJpUR';
        this.identity = `&wid=${this.wid}&apikey=${this.apikey}`;
        this.request = request;
    }
    actionGood(sid, kid, actionGood) {
        console.log('###### @ACTION GOOD: ', actionGood);
        console.log('@ACTION GOOD KID: ', kid);
        if (actionGood === false) {
            this.request({
                url: `${settings_1.SETTINGS.SERVER_API}/socialBots/notDisplay/${kid}`,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }, (err, res, body) => {
                if (body)
                    console.log('@Server res: ', body);
            });
        }
    }
    getActions(sid, campType) {
        // http://socialtrack.fan-factory.com/get_kamps/1/141063?weblimit=1
        let weblimit = 50;
        let requestURL = `${this.APIURL}get_kamps/${campType}/${sid}?weblimit=${weblimit}` + this.identity;
        console.log('@getActions url: ', requestURL);
        return Observable_1.Observable.create(observer => {
            this.request(requestURL, (error, response, body) => {
                if (error) {
                    observer.next(null);
                    console.log('@getActions error:', error);
                }
                if (body === null) {
                    observer.next(body);
                }
                else {
                    let res;
                    if (IsJsonString(body)) {
                        res = JSON.parse(body);
                    }
                    else {
                        console.log('@type: ', typeof body);
                        res = body;
                    }
                    observer.next(res);
                }
            });
        });
    }
    getTarget(kid) {
        let requestURL = `${this.APIURL}getpar.php?kid=${kid}` + this.identity;
        return Observable_1.Observable.create(observer => {
            this.request(requestURL, (error, response, body) => {
                if (error) {
                    observer.next(null);
                }
                let res;
                if (IsJsonString(body)) {
                    res = JSON.parse(body);
                    console.log('@getTarget body: ', res);
                }
                else {
                    res = body;
                }
                observer.next(res);
            });
        });
    }
    startTracking(sid, kid) {
        return Observable_1.Observable.create(observer => {
            let requestURL = `${this.APIURL}getcount?kid=${kid}&skipsid=1&setsid6311=${sid}` + this.identity;
            console.log('@startTracking URL:', requestURL);
            this.request(requestURL, (error, response, body) => {
                console.log('@START TRACKING body: ', body);
                if (body === '("E");') {
                    observer.next('E');
                }
                else {
                    console.log('Type of body: ', typeof body);
                    observer.next(body);
                }
            });
        });
    }
    afterActionFinished(kid, sid, count) {
        return Observable_1.Observable.create(observer => {
            let reqURL = `${this.APIURL}check?kid=${kid}&count=${count}&skipsid=1&setsid6311=${sid}` + this.identity;
            console.log('@afterActionFinished url: ', reqURL);
            this.request(reqURL, (error, response, res) => {
                console.log('afterActionFinished step 2: ', res);
                this.request(reqURL, (error, response, res) => {
                    console.log('ACTION VALIDATED: ', res);
                    let checkURL = `${this.APIURL}checkout_action/${kid}/${sid}?` + this.identity;
                    console.log('@ ACTION VALIDATED checkURL: ', checkURL);
                    // http://socialtrack.fan-factory.com/checkout_action/:kid/:sid
                    this.request(checkURL, (error, response, res) => {
                        observer.next(res);
                    });
                });
            });
        });
    }
}
exports.API = API;
