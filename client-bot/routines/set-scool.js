"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
let _ = require('lodash');
let request = require('request');
let T_TIME = 1000;
var SetScool;
(function (SetScool) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var clickElement = robot_1.Robot.clickElement;
    function init(app, socket, io) {
        checkState(app, socket, io);
        setListeners(app, socket, io);
        function checkState(app, socket, io) {
            console.log('@Current State: ', app.routineState);
            switch (app.routineState) {
                case 'init':
                    storage_1.Storage.getSidData({
                        facebookID: (app.facebookID.toString()),
                    }).subscribe((data) => {
                        console.log('@USER DATA: ', data);
                        app.userData = data;
                        app.routineState = 'login';
                        checkState(app, socket, io);
                    });
                    app.routineState = 'login';
                    break;
                case 'login':
                    app.loginState = 'init';
                    login_facebook_1.LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        if (res) {
                            visitProfile(app, socket, io);
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
                case 'inLogin':
                    console.log('Still not logged in.');
                    break;
                case 'clickAddFriend':
                    clickAddFriend(app, socket, io);
                    break;
                case 'idle':
                    console.log('Idle');
                    break;
            }
        }
        function visitProfile(app, socket, io) {
            timers_1.setTimeout(() => {
                browser_1.Browser.navigateUrl(io, app.url);
                timers_1.setTimeout(() => {
                    app.routineState = 'clickAddFriend';
                    checkState(app, socket, io);
                }, (T_TIME * 4));
            }, (T_TIME * 4));
        }
        function clickAddFriend(app, socket, io) {
            timers_1.setTimeout(() => {
                getDomElementPosition(io, {
                    response: 'AddFriend',
                    selectClass: 'sx_b4ca13',
                });
            }, (T_TIME * 6));
        }
        function setListeners(app, socket, io) {
            socket.on('AddFriend', (pos) => {
                if (pos) {
                    clickElement(pos, 1, app);
                    app.APIRes.send(JSON.stringify({
                        status: true
                    }));
                    app.addedFriends++;
                    timers_1.setTimeout(() => {
                        app.routineState = 'idle';
                        app.doRestart();
                    }, (T_TIME * 6));
                }
            });
        }
    }
    SetScool.init = init;
})(SetScool = exports.SetScool || (exports.SetScool = {}));
