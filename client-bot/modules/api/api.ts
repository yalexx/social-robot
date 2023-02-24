import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import {Utils} from "../utils/unitls";
import IsJsonString = Utils.IsJsonString;
import {SETTINGS} from "../../../settings";

export class API {

    private APIURL = 'http://socialtrack.fan-factory.com/';
    private request;
    private wid = 3131;
    private apikey = 'aIwo2Mm7cnJpUR';

    private identity = `&wid=${this.wid}&apikey=${this.apikey}`;

    constructor(request) {
        this.request = request;
    }

    actionGood(sid, kid, actionGood) {

        console.log('###### @ACTION GOOD: ', actionGood);
        console.log('@ACTION GOOD KID: ', kid);

        if (actionGood === false) {
            this.request({
                url: `${SETTINGS.SERVER_API}/socialBots/notDisplay/${kid}`,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }, (err, res, body) => {
                if (body) console.log('@Server res: ', body);
            });
        }

    }

    getActions(sid, campType) {

        // http://socialtrack.fan-factory.com/get_kamps/1/141063?weblimit=1

        let weblimit = 50;

        let requestURL = `${this.APIURL}get_kamps/${campType}/${sid}?weblimit=${weblimit}` + this.identity;

        console.log('@getActions url: ', requestURL);

        return Observable.create(observer => {

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

        return Observable.create(observer => {

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

        return Observable.create(observer => {

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

        return Observable.create(observer => {

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