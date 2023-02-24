"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const robot_1 = require("../modules/robot/robot");
let _ = require('lodash');
let T_TIME = 1000;
var Settings;
(function (Settings) {
    var clickElement = robot_1.Robot.clickElement;
    var settings = storage_1.Storage.settings;
    let data$ = storage_1.Storage.getRandomSidData({
        "settings": { $exists: false },
        "isVerified": true,
        "country": 'bg'
    });
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID: ', data);
                });
                app.routineState = 'login';
                break;
            case 'login':
                app.loginState = 'init';
                login_facebook_1.LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {
                    if (res) {
                        timers_1.setTimeout(() => {
                            app.routineState = 'seeFriendsRes';
                            browser_1.Browser.navigateUrl(io, '/privacy/touch/basic/');
                        }, (T_TIME * 3));
                    }
                    else {
                        console.log('@no login do restart');
                        app.doRestart();
                    }
                }, (err) => {
                    console.log('@login error: ', err);
                });
                app.routineState = 'inLogin';
                break;
            case 'seeFriendsRes':
                timers_1.setTimeout(() => {
                    seeFriendsRes(app, socket, io);
                }, 2000);
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }
    Settings.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    Settings.init = init;
    function seeFriendsRes(app, socket, io) {
        io.emit('getElementPos', {
            type: 'h3',
            text: 'Who can see your friends',
            response: 'seeFriendsRes',
        });
    }
    function setListeners(app, socket, io) {
        socket.on('clickFriendsElement', (pos) => {
            if (pos) {
                timers_1.setTimeout(() => {
                    clickElement(pos, 1, app);
                    settings(app.userData._id).subscribe();
                }, 1000);
            }
        });
        socket.on('seeFriendsRes', (pos) => {
            if (pos) {
                timers_1.setTimeout(() => {
                    clickElement(pos, 1, app);
                    timers_1.setTimeout(() => {
                        io.emit('getElementPos', {
                            type: 'div',
                            text: 'Your friends on Facebook',
                            response: 'clickFriendsElement',
                        });
                        timers_1.setTimeout(() => {
                            app.doRestart();
                        }, 6000);
                    }, 8000);
                }, 1000);
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(Settings = exports.Settings || (exports.Settings = {}));
