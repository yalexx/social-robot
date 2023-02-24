"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const robot = require("robotjs");
const userGenerator_1 = require("../modules/userGenerator/userGenerator");
let _ = require('lodash');
let taskID;
let T_TIME = 1000;
let url = '/settings/account/?name';
var Rename;
(function (Rename) {
    var updateGame = storage_1.Storage.updateGame;
    var generateSIDData = userGenerator_1.userGenerator.generateSIDData;
    var updateSidData = storage_1.Storage.updateSidData;
    let data$;
    function init(app, socket, io) {
        setListeners(app, socket, io);
        data$ = storage_1.Storage.getRandomData({ "country": "de", "isVerified": true }, 'sids');
    }
    Rename.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@user:', app.userData);
                });
                app.routineState = 'login';
                break;
            case 'login':
                app.loginState = 'init';
                login_facebook_1.LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {
                    if (res) {
                        console.log('@login done');
                        timers_1.setTimeout(() => {
                            app.routineState = 'idle';
                            navigatePage(app, socket, io);
                        }, (T_TIME * 3));
                    }
                    else {
                        console.log('@no login do restart');
                        app.routineState = 'init';
                        app.doRestart();
                    }
                }, (err) => {
                    console.log('@login error: ', err);
                });
                app.routineState = 'inLogin';
                break;
            case 'idle':
                console.log('@API Like Page Idle 1');
                break;
        }
    }
    Rename.checkState = checkState;
    function navigatePage(app, socket, io) {
        browser_1.Browser.navigateUrl(io, url);
        let subscribe = storage_1.Storage.getNameData('bulgariannames').subscribe((data) => {
            let bgUserData = generateSIDData(data, 'abv.bg', app.userData.gender);
            app.userData.name = bgUserData.name;
            app.userData.familyName = bgUserData.familyName;
            app.userData.country = bgUserData.country;
            app.userData.city = bgUserData.city;
            app.userData.street = bgUserData.street;
            console.log('@new bg app.userData: ', app.userData);
            subscribe.unsubscribe();
        });
        timers_1.setTimeout(() => {
            console.log('Change name: ', app.userData.name);
            io.emit('textExists', {
                response: 'checkAlreadyChangedRes',
                text: "You can't change your name",
                type: 'div'
            });
            io.emit('setValue', {
                selector: ['input[name="primary_first_name"]', 'input[name="primary_first_name"]'],
                val: app.userData.name
            });
            timers_1.setTimeout(() => {
                console.log('Change familyName: ', app.userData.familyName);
                io.emit('setValue', {
                    selector: ['input[name="primary_last_name"]', 'input[name="primary_last_name"]'],
                    val: app.userData.familyName
                });
                timers_1.setTimeout(() => {
                    io.emit('click', {
                        selector: ['#m-settings-form > div:nth-child(4) > button', '#m-settings-form > div:nth-child(4) > button'],
                        response: 'res',
                    });
                    timers_1.setTimeout(() => {
                        console.log('Change familyName: ', app.userData.registerPassword);
                        io.emit('setValue', {
                            selector: ['input[name="save_password"]'],
                            val: app.userData.registerPassword
                        });
                        timers_1.setTimeout(() => {
                            console.log('click layerConfirm');
                            io.emit('click', {
                                selector: ['#m-settings-form > div:nth-child(6) > button'],
                                response: 'res',
                            });
                            timers_1.setTimeout(() => {
                                robot.keyTap('f5');
                                timers_1.setTimeout(() => {
                                    console.log('textExists: ', app.userData.name);
                                    io.emit('textExists', {
                                        response: 'checkNewNameRes',
                                        text: app.userData.name,
                                        type: 'span'
                                    });
                                }, 12000);
                            }, 8000);
                        }, 8000);
                    }, 8000);
                }, 13000);
            }, 6000);
        }, (T_TIME * 15));
    }
    function setListeners(app, socket, io) {
        socket.on('checkNewNameRes', (res) => {
            console.log('checkNewNameRes: ', res);
            if (res.exists) {
                updateSidData(app).subscribe((res) => {
                    console.log('Updated User Data: ');
                });
            }
            else {
                console.log('Just Restart');
            }
            app.doRestart();
        });
        socket.on('checkAlreadyChangedRes', (res) => {
            console.log('checkAlreadyChangedRes: ', res);
            if (res.exists) {
                updateSidData(app).subscribe((res) => {
                    console.log('Updated User Data: ');
                });
                app.doRestart();
            }
        });
        socket.on('clickLikeRes', (exists) => {
            console.log('exists', exists);
            if (exists) {
                timers_1.setTimeout(() => {
                    updateGame(app.userData._id).subscribe();
                }, 1000);
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(Rename = exports.Rename || (exports.Rename = {}));
