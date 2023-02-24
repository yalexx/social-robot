import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import {Utils} from "../modules/utils/unitls";
import Request = require("request");
import {Observable} from 'rxjs/Observable';
import {SETTINGS} from "../../settings";

export module ServerAPI {


    export function getJSON(url: any) {

        return Observable.create((observer: any) => {
            Request({
                url, method: 'GET', headers: {
                    'Accept': 'application/json',
                }
            }, (err: any, res: any, body: any) => {
                if (err) {
                    console.log('getJSON error: ', err);
                    observer.next(false);
                    observer.complete();

                }
                else {
                    observer.next(JSON.parse(body));
                    observer.complete();
                }
            });

        });
    }

    export function setLocation(app: any, socket: any, io: any) {

        /*console.log('@app.userData: ', app.userData.sidID);
         let locationURL = `${SERVER_API}/location/${app.userData.sidID}`;
         console.log('@locationURL: ', locationURL);

         let requestSettings = {
         url: locationURL,
         method: 'GET',
         headers: {
         'Accept': 'application/json',
         }
         };

         Request(requestSettings, (err, res, body) => {

         if (err) {
         app.doRestart();
         console.log('Get Location error, restart.');
         }
         else {
         io.emit('setLocation', {
         response: 'setLocationRes',
         location: JSON.parse(body),
         });

         console.log('@Server BODY: ', JSON.parse(body));
         }

         });*/

    }

    export function API(app: any, method: any, url: any, data?: any) {
        return Observable.create((observer: any) => {
            const apiUrl = `${SETTINGS.SERVER_API}` + url;
            /*const apiUrl = 'http://http://social-robots.ddns.net:3333';*/
            /*TODO dev server port */
            console.log('@API URL: : ', url);

            let requestSettings: any = {
                url: apiUrl,
                method: method,
                headers: {
                    'Accept': 'application/json',
                },
                json: true
            };
            if (method === 'POST') {
                requestSettings.body = data;
            }
            Request(requestSettings, (err: any, res: any, body: any) => {

                if (err) {
                    app.doRestart();
                    console.log('API Res error: ', err);
                }
                else {
                    observer.next(res.body);
                }
                observer.complete();
            });

        });
    }

    export function getTask(app: any) {
        return Observable.create((observer: any) => {

            let taskURL = `${SETTINGS.SERVER_API}/tasks/getTask`;
            console.log('@locationURL: ', taskURL);

            let requestSettings = {
                url: taskURL,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            };
            Request(requestSettings, (err: any, res: any, body: any) => {
                if (err) {
                    app.doRestart();
                    console.log('Get Location error, restart.');
                }
                else {
                    observer.next(JSON.parse(body));
                }
                observer.complete();
            });

        });
    }

    export function getContainerData(id: any) {
        return Observable.create((observer: any) => {

            let locationURL = `${SETTINGS.SERVER_API}/containers/${id}`;
            console.log('@locationURL: ', locationURL);

            Request({
                url: locationURL,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }, (err: any, res: any, body: any) => {
                if (err) {
                    console.log('Get Container Data error: ', err);
                }
                else {
                    observer.next(JSON.parse(body));
                }
                observer.complete();
            });

        });
    }

    export function updateContainerHost(id: any, hostname: any) {
        return Observable.create((observer: any) => {

            let locationURL = `${SETTINGS.SERVER_API}/containers/createOrUpdate`;
            console.log('@locationURL: ', locationURL);

            let requestSettings = {
                url: locationURL,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: {
                    id,
                    hostname
                },
                json: true
            };

            Request(requestSettings, (err: any, res: any) => {
                if (err) {
                    observer.next(err);
                    console.log('updateContainerHost error, restart.', err);
                }
                else {
                    observer.next(res);
                }
                observer.complete();
            });

        });
    }

    export function checkImageText(imgUrl: any) {
        return Observable.create((observer: any) => {

            let locationURL = `${SETTINGS.SERVER_API}/images/checkText`;
            console.log('@locationURL: ', locationURL);

            let requestSettings = {
                url: locationURL,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: {
                    imgUrl
                },
                json: true
            };

            Request(requestSettings, (err: any, res: any) => {
                if (err) {
                    observer.next(err);
                }
                else {
                    observer.next(res);
                }
                observer.complete();
            });

        });
    }

    export function updateTask(app: any, taskID: any, sid_ID: any) {

        return Observable.create((observer: any) => {

            let locationURL = `${SETTINGS.SERVER_API}/tasks/updateTask`;
            console.log('@locationURL: ', locationURL);

            let requestSettings = {
                url: locationURL,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: {
                    taskID: taskID,
                    sid_ID: sid_ID
                },
                json: true
            };

            Request(requestSettings, (err: any, res: any) => {
                if (err) {
                    app.doRestart();
                    console.log('Get Location error, restart.');
                }
                else {
                    observer.next(res);
                }
                observer.complete();
            });
        });
    }

    export function sendEvent(app: any, success: any, type?: any, data?: any) {

        console.log('New event: ', type || app.currentRoutine);
        console.log('Event Success: ', success);

        return Observable.create((observer: any) => {

            let locationURL = `${SETTINGS.SERVER_API}/stats/sendEvent`;
            console.log('@locationURL: ', locationURL);

            let requestSettings = {
                url: locationURL,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: {
                    type: type || app.currentRoutine,
                    success: success,
                    id: app.userData._id,
                    provider: app.userData.provider,
                    data: data || null
                },
                json: true
            };

            Request(requestSettings, (err: any, res: any) => {
                if (err) {
                    app.doRestart();
                    console.log('Get Location error, restart.');
                }
                else {
                    observer.next(res);
                }
                observer.complete();
            });

        });
    }

}