"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const robot_1 = require("../modules/robot/robot");
const server_connect_1 = require("../API/server-connect");
let _ = require('lodash');
let T_TIME = 1000;
let friendsAdded = 0;
let maxFriends = 0;
var AddFriends;
(function (AddFriends) {
    var clickElement = robot_1.Robot.clickElement;
    var sendEvent = server_connect_1.ServerAPI.sendEvent;
    var API = server_connect_1.ServerAPI.API;
    var updateLastAddFriends = storage_1.Storage.updateLastAddFriends;
    var removeSid = storage_1.Storage.removeSid;
    let data$ = storage_1.Storage.getRandomSidData({
        "isVerified": { $exists: true },
        "lastAddFriends": { $exists: false },
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
                maxFriends = _.random(20, 50);
                friendsAdded = 0;
                login_facebook_1.LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {
                    if (res) {
                        timers_1.setTimeout(() => {
                            console.log('Current location');
                            console.log();
                            API(app, 'GET', '/fbSids/getFriend').subscribe((data) => {
                                console.log('fbUser URL: ', data);
                                if (app.currentLocation.host !== 'm.facebook.com') {
                                    app.routineState = 'init';
                                    app.doRestart();
                                }
                                browser_1.Browser.navigateUrl(io, data.userUrl);
                                app.routineState = 'addFriend';
                            });
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
            case 'addFriend':
                addFriend(app, socket, io);
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }
    AddFriends.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    AddFriends.init = init;
    function addFriend(app, socket, io) {
        console.log('friendsAdded: >>> ', friendsAdded);
        console.log('maxFriends: >>> ', maxFriends);
        if (friendsAdded >= maxFriends) {
            app.doRestart();
            updateLastAddFriends(app.userData._id).subscribe();
        }
        else {
            timers_1.setTimeout(() => {
                io.emit('getActionBtnPos', {
                    type: 'a',
                    text: 'Add Friend',
                    response: 'clickAddFriendRes',
                });
                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'We want to make',
                    type: 'div'
                });
                timers_1.setTimeout(() => {
                    API(app, 'GET', '/fbSids/getFriend').subscribe((data) => {
                        console.log('fbUser URL: ', data);
                        if (app.currentLocation.host !== 'm.facebook.com') {
                            app.doRestart();
                            app.routineState = 'init';
                        }
                        browser_1.Browser.navigateUrl(io, data.userUrl);
                    });
                }, (T_TIME * _.random(11, 14)));
            }, 3000);
        }
    }
    function setListeners(app, socket, io) {
        socket.on('clickAddFriendRes', (pos) => {
            if (pos) {
                timers_1.setTimeout(() => {
                    clickElement(pos, 1, app);
                    sendEvent(app, true).subscribe(() => {
                    });
                    friendsAdded++;
                    timers_1.setTimeout(() => {
                        io.emit('getActionBtnPos', {
                            type: 'button',
                            text: 'Confirm',
                            response: 'clickElement',
                        });
                    }, 2000);
                }, 2000);
            }
            else {
                console.log('No add friend button');
            }
        });
        socket.on('clickElement', (pos) => {
            if (pos) {
                timers_1.setTimeout(() => {
                    clickElement(pos, 1, app);
                }, 1000);
            }
        });
        socket.on('checkUnusualActivity', (res) => {
            if (res.exists) {
                console.log('@Unusual Activity error, remove sid: ', res.exists);
                removeSid(app.userData).subscribe(() => {
                });
                app.doRestart();
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(AddFriends = exports.AddFriends || (exports.AddFriends = {}));
