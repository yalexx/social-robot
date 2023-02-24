"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/observable/of");
require("rxjs/add/operator/map");
const Request = require("request");
const Observable_1 = require("rxjs/Observable");
const settings_1 = require("../../settings");
var ServerAPI;
(function (ServerAPI) {
    function getJSON(url) {
        return Observable_1.Observable.create((observer) => {
            Request({
                url, method: 'GET', headers: {
                    'Accept': 'application/json',
                }
            }, (err, res, body) => {
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
    ServerAPI.getJSON = getJSON;
    function setLocation(app, socket, io) {
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
    ServerAPI.setLocation = setLocation;
    function API(app, method, url, data) {
        return Observable_1.Observable.create((observer) => {
            const apiUrl = `${settings_1.SETTINGS.SERVER_API}` + url;
            /*const apiUrl = 'http://http://social-robots.ddns.net:3333';*/
            /*TODO dev server port */
            console.log('@API URL: : ', url);
            let requestSettings = {
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
            Request(requestSettings, (err, res, body) => {
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
    ServerAPI.API = API;
    function getTask(app) {
        return Observable_1.Observable.create((observer) => {
            let taskURL = `${settings_1.SETTINGS.SERVER_API}/tasks/getTask`;
            console.log('@locationURL: ', taskURL);
            let requestSettings = {
                url: taskURL,
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
                    observer.next(JSON.parse(body));
                }
                observer.complete();
            });
        });
    }
    ServerAPI.getTask = getTask;
    function getContainerData(id) {
        return Observable_1.Observable.create((observer) => {
            let locationURL = `${settings_1.SETTINGS.SERVER_API}/containers/${id}`;
            console.log('@locationURL: ', locationURL);
            Request({
                url: locationURL,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }, (err, res, body) => {
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
    ServerAPI.getContainerData = getContainerData;
    function updateContainerHost(id, hostname) {
        return Observable_1.Observable.create((observer) => {
            let locationURL = `${settings_1.SETTINGS.SERVER_API}/containers/createOrUpdate`;
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
            Request(requestSettings, (err, res) => {
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
    ServerAPI.updateContainerHost = updateContainerHost;
    function checkImageText(imgUrl) {
        return Observable_1.Observable.create((observer) => {
            let locationURL = `${settings_1.SETTINGS.SERVER_API}/images/checkText`;
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
            Request(requestSettings, (err, res) => {
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
    ServerAPI.checkImageText = checkImageText;
    function updateTask(app, taskID, sid_ID) {
        return Observable_1.Observable.create((observer) => {
            let locationURL = `${settings_1.SETTINGS.SERVER_API}/tasks/updateTask`;
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
            Request(requestSettings, (err, res) => {
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
    ServerAPI.updateTask = updateTask;
    function sendEvent(app, success, type, data) {
        console.log('New event: ', type || app.currentRoutine);
        console.log('Event Success: ', success);
        return Observable_1.Observable.create((observer) => {
            let locationURL = `${settings_1.SETTINGS.SERVER_API}/stats/sendEvent`;
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
            Request(requestSettings, (err, res) => {
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
    ServerAPI.sendEvent = sendEvent;
})(ServerAPI = exports.ServerAPI || (exports.ServerAPI = {}));
