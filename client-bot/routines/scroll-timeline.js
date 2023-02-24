"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../modules/storage/storage");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const robot_1 = require("../modules/robot/robot");
let _ = require('lodash');
let T_TIME = 1000;
var ScrollTimeline;
(function (ScrollTimeline) {
    var doScroll = robot_1.Robot.doScroll;
    let data$ = storage_1.Storage.getRandomSidData({
        isVerified: true,
        isUsed: false,
        //TODO temp
        registerEmail: 'marlisalangguth29wg@gmx.de',
    }), scrollLock = false;
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
                        console.log('@login done');
                        timers_1.setTimeout(() => {
                            app.routineState = 'scrollTimeline';
                            checkState(app, socket, io);
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
            case 'scrollTimeline':
                scrollLock = false;
                scrollTimeline(app, socket, io);
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }
    ScrollTimeline.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    ScrollTimeline.init = init;
    function scrollTimeline(app, socket, io) {
        doScroll(15);
        doRestart(app, socket, io);
    }
    ScrollTimeline.scrollTimeline = scrollTimeline;
    function doRestart(app, socket, io) {
        timers_1.setTimeout(() => {
            scrollLock = true;
            app.routineState = 'init';
            console.log('Scroll time finish. Restart.');
            app.doRestart();
        }, (T_TIME * _.random(40, 90)));
    }
    function setListeners(app, socket, io) {
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(ScrollTimeline = exports.ScrollTimeline || (exports.ScrollTimeline = {}));
