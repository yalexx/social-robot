"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
let _ = require('lodash');
let likesRange = [15, 24];
var StartShares;
(function (StartShares) {
    var clickElement = robot_1.Robot.clickElement;
    var updateStartShares = storage_1.Storage.updateStartShares;
    let data$ = storage_1.Storage.getRandomSidData({
        "isVerified": true,
        "startShares": { $exists: false }
    });
    const T_TIME = 1000;
    let pagesArray;
    let nextTimeoutCounter;
    /*let data$ = Storage.getSidByID('ad10de3373bd42a55df5ff9');*/
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID: ', app.userData);
                    storage_1.Storage.getInitialPages({}, app.userData.country + '_pages').subscribe((data) => {
                        console.log('@initialLikes Data: ');
                        pagesArray = _.shuffle(data['topPages']);
                        pagesArray = _.slice(pagesArray, 0, _.random(likesRange[0], likesRange[1]));
                        console.log('@spiced pagesArray: ', pagesArray);
                        console.log('@pagesArray length: ', pagesArray.length);
                    });
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
                            browser_1.Browser.navigateUrl(io, '/privacy/touch/enablepublic/', true);
                            app.routineState = 'enablePublic';
                            checkState(app, socket, io);
                        }, (T_TIME * 5));
                    }
                    else {
                        console.log('@no login do restart');
                        app.routineState = 'init';
                        app.doRestart();
                        clearTimeout(nextTimeoutCounter);
                    }
                }, (err) => {
                    console.log('@login error: ', err);
                });
                app.routineState = 'inLogin';
                break;
            case 'enablePublic':
                enablePublic(app, socket, io);
                break;
            case 'allowPublic':
                allowPublic(app, socket, io);
                break;
            case 'navigatePage':
                navigatePage(app, socket, io);
                break;
            case 'likePage':
                likePage(app, socket, io);
                app.routineState = 'idle';
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }
    StartShares.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    StartShares.init = init;
    function enablePublic(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('getElementPos', {
                response: 'clickEnablePublicRes',
                selector: 'button',
            });
        }, 7000);
        app.routineState = 'idle';
        timers_1.setTimeout(() => {
            browser_1.Browser.navigateUrl(io, '/privacy/touch/composer/selector/', true);
            app.routineState = 'allowPublic';
        }, 16000);
    }
    function allowPublic(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('getActionBtnPos', {
                type: 'span',
                text: 'Public',
                response: 'clickAllowPublicRes',
            });
        }, 4000);
    }
    function navigatePage(app, socket, io) {
        if (pagesArray[0] !== undefined) {
            let mobileUrl = pagesArray[0].replace("www.facebook.com", "m.facebook.com") + 'posts/';
            console.log(mobileUrl);
            browser_1.Browser.navigateUrl(io, mobileUrl, true);
            app.routineState = 'likePage';
        }
        else {
            app.doRestart();
            clearTimeout(nextTimeoutCounter);
        }
    }
    function likePage(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('getActionBtnPos', {
                type: 'div',
                text: 'Like',
                response: 'likePageRes',
            });
        }, (T_TIME * _.random(6, 8)));
        pagesArray = _.slice(pagesArray, 1, pagesArray.length);
        let nextTimeout = _.random(40000, 46000);
        console.log('nextTimeout: ', nextTimeout);
        nextTimeoutCounter = timers_1.setTimeout(() => {
            app.routineState = 'navigatePage';
            checkState(app, socket, io);
        }, nextTimeout);
    }
    function setListeners(app, socket, io) {
        socket.on('clickEnablePublicRes', (pos) => {
            if (pos && pos.top !== 0) {
                clickElement(pos, 1, app);
            }
        });
        socket.on('clickElement', (pos) => {
            if (pos && pos.top !== 0) {
                clickElement(pos, 1, app);
            }
        });
        socket.on('clickAllowPublicRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    app.routineState = 'navigatePage';
                    checkState(app, socket, io);
                }, 5000);
            }
            else {
                app.doRestart();
                clearTimeout(nextTimeoutCounter);
            }
        });
        socket.on('likePageRes', (pos) => {
            if (pos) {
                if (pagesArray.length > 1) {
                    clickElement(pos, 1, app);
                    timers_1.setTimeout(() => {
                        io.emit('getElementClass', {
                            response: 'clickShareRes',
                            classText: '._15kr._5a-2',
                            type: 'a',
                            position: 0
                        });
                    }, 6000);
                }
                else {
                    updateStartShares(app.userData._id).subscribe(() => {
                        console.log('@Updated start shares !');
                        app.doRestart();
                        clearTimeout(nextTimeoutCounter);
                    });
                }
            }
        });
        socket.on('clickShareRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    io.emit('getElementPos', {
                        response: 'clickElement',
                        text: 'Share Post Now',
                        type: 'span'
                    });
                    io.emit('getElementPos', {
                        response: 'clickElement',
                        text: 'Share Now',
                        type: 'span'
                    });
                }, 5000);
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(StartShares = exports.StartShares || (exports.StartShares = {}));
