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
var SuggestedFriends;
(function (SuggestedFriends) {
    var clickElement = robot_1.Robot.clickElement;
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var sendEvent = server_connect_1.ServerAPI.sendEvent;
    let data$ = storage_1.Storage.getRandomSidData({
        isVerified: true,
        country: 'bg',
        lastAddFriends: { $exists: true },
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
                        console.log('@login done');
                        timers_1.setTimeout(() => {
                            clickFriendRequests(app, socket, io);
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
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }
    SuggestedFriends.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    SuggestedFriends.init = init;
    function clickFriendRequests(app, socket, io) {
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'clickFriendRequestsRes',
                text: 'Friend Requests',
                type: 'span',
                position: 0
            });
            app.routineState = 'searchFriends';
        }, (T_TIME * 8));
    }
    function clickAddFriend(app, socket, io) {
        console.log('@click add friend');
        io.emit('getActionBtnPos', {
            type: 'div',
            text: 'Confirm',
            response: 'clickAddFriendRes',
        });
        timers_1.setTimeout(() => {
            app.doRestart();
            io.emit('getActionBtnPos', {
                type: 'div',
                text: 'Add Friend',
                response: 'clickAddFriendRes',
            });
        }, (T_TIME * 15));
    }
    function setListeners(app, socket, io) {
        socket.on('clickFriendRequestsRes', (pos) => {
            if (pos) {
                pos.precise = true;
                pos.top = (pos.top + 20);
                pos.left = (pos.left + 40);
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    clickAddFriend(app, socket, io);
                }, (T_TIME * 6));
            }
        });
        socket.on('clickAddFriendRes', (pos) => {
            if (pos && pos.width !== 0 && pos.top !== 0) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    io.emit('getActionBtnPos', {
                        type: 'div',
                        text: 'Confirm',
                        response: 'clickAddFriendRes',
                    });
                    sendEvent(app, true).subscribe(() => {
                    });
                }, 2000);
            }
            else {
                console.log('No confirm button');
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(SuggestedFriends = exports.SuggestedFriends || (exports.SuggestedFriends = {}));
