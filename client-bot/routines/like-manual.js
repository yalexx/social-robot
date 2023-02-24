"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const robot_1 = require("../modules/robot/robot");
let _ = require('lodash');
let taskID;
let T_TIME = 1000;
let url = 'https://www.facebook.com/SG-Style-358421771326678/';
var LikeManual;
(function (LikeManual) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var clickElement = robot_1.Robot.clickElement;
    var updateCampaigns = storage_1.Storage.updateCampaigns;
    let data$;
    let likes = 0;
    function init(app, socket, io) {
        setListeners(app, socket, io);
        data$ = storage_1.Storage.getRandomSidData({
            "sg": { $ne: 1 },
            "country": 'bg',
            "lastAddFriends": { $exists: true },
            "isVerified": true,
        });
        /*data$ = Storage.getRandomSidData({
            "magi": {$exists: true},
            "isVerified": true,
        });*/
    }
    LikeManual.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@user:', app.userData._id);
                    console.log('@email:', app.userData.registerEmail);
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
                            navigatePage(app, socket, io);
                            checkState(app, socket, io);
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
            case 'navigatePage':
                navigatePage(app, socket, io);
                break;
            case 'idle':
                console.log('@API Like Page Idle 1');
                break;
            case 'inviteFriends':
                inviteFriends(app, socket, io);
                break;
        }
    }
    LikeManual.checkState = checkState;
    function navigatePage(app, socket, io) {
        browser_1.Browser.navigateUrl(io, url);
        timers_1.setTimeout(() => {
            /* io.emit('getActionBtnPos', {
                 type: 'span',
                 text: 'Posts',
                 response: 'clickLikeRes',
             });*/
            /*console.log('LOVE !!!!!!');


            io.emit('getActionBtnPos', {
                type: 'div',
                selector: 'a.touchable',
                text: 'Love',
                response: 'clickLikeRes',
            });*/
            io.emit('getActionBtnPos', {
                type: 'div',
                text: 'Like',
                response: 'clickLikeRes',
            });
        }, (T_TIME * 15));
    }
    function inviteFriends(app, socket, io) {
        console.log('inviteFriends');
        timers_1.setTimeout(() => {
            io.emit('getElementPos', {
                type: 'span',
                text: 'Invite',
                response: 'clickInviteFriend',
            });
        }, 1000);
    }
    function clickSeeFirst(app, socket, io) {
        getDomElementPosition(io, {
            response: 'clickSeeFirst',
            text: 'See First',
            type: 'span'
        });
    }
    function setListeners(app, socket, io) {
        socket.on('clickLikeRes', (pos) => {
            if (pos) {
                console.log('clickLikeRes: ', pos);
                pos.top -= 30;
                clickElement(pos, 1, app);
            }
            timers_1.setTimeout(() => {
                io.emit('getPageID', {
                    response: 'visitInvite',
                });
            }, 6000);
        });
        socket.on('clickInviteFriend', (pos) => {
            console.log('clickInviteFriend: pos', pos);
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    io.emit('removeElement', {
                        selector: 'button:disabled',
                        parent: 4
                    });
                    inviteFriends(app, socket, io);
                }, 1000);
            }
            else {
                updateCampaigns(app.userData._id).subscribe();
                app.doRestart();
                console.log('All invited');
            }
        });
        socket.on('visitInvite', (pageID) => {
            console.log('visitInvite: ', pageID);
            if (pageID) {
                timers_1.setTimeout(() => {
                    timers_1.setTimeout(() => {
                        browser_1.Browser.navigateUrl(io, '?_rdr#!/send_page_invite/?pageid=' + pageID);
                        app.routineState = 'inviteFriends';
                        checkState(app, socket, io);
                    }, 6000);
                }, 300);
            }
            else {
                app.doRestart();
            }
        });
        socket.on('clickSeeFirst', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(LikeManual = exports.LikeManual || (exports.LikeManual = {}));
