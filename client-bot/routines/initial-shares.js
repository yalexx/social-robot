"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../modules/storage/storage");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const robot_1 = require("../modules/robot/robot");
const moment = require("moment");
let _ = require('lodash');
let T_TIME = 1000;
var InitialShares;
(function (InitialShares) {
    var clickElement = robot_1.Robot.clickElement;
    var updateInitialShares = storage_1.Storage.updateInitialShares;
    let data$ = storage_1.Storage.getRandomSidData({
        isVerified: true,
        country: 'bg',
        $and: [{
                $or: [{ "initialShares": moment().subtract(5, 'd').toDate() },
                    {
                        "initialShares": { $exists: false }
                    }]
            }]
    });
    let noLikeBtn = 0;
    let sharePos = 0;
    let totalShares = 0;
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
                app.loginSubscription = login_facebook_1.LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {
                    if (app.loginSubscription)
                        app.loginSubscription.unsubscribe();
                    if (res) {
                        console.log('@login done');
                        timers_1.setTimeout(() => {
                            app.routineState = 'clickShare';
                            totalShares = _.random(1, 3);
                            sharePos = 0;
                            timers_1.setTimeout(() => {
                                checkState(app, socket, io);
                            }, T_TIME);
                        }, (T_TIME * 3));
                    }
                    else {
                        app.loginState = 'idle';
                        console.log('@no login do restart');
                        app.doRestart();
                    }
                }, (err) => {
                    console.log('@login error: ', err);
                });
                app.routineState = 'inLogin';
                break;
            case 'clickShare':
                clickShare(app, socket, io);
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }
    InitialShares.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    InitialShares.init = init;
    function clickShare(app, socket, io) {
        robot_1.Robot.doScroll(1);
        console.log('@Total Shares: ', totalShares);
        timers_1.setTimeout(() => {
            clickLike(app, socket, io);
            timers_1.setTimeout(() => {
                io.emit('getElementClass', {
                    response: 'clickShareRes',
                    classText: '._15kr._5a-2',
                    type: 'a',
                    position: sharePos
                });
            }, (T_TIME * 2));
        }, (T_TIME * 4));
    }
    function clickLike(app, socket, io) {
        console.log('@sharePos:', sharePos);
        if (sharePos > 16) {
            app.loginState = 'idle';
            app.doRestart();
            updateInitialShares(app).subscribe();
        }
        io.emit('getElementClass', {
            response: 'clickLike',
            classText: '._15ko._5a-2.touchable',
            type: 'a',
            position: sharePos
        });
    }
    function clickSharePostNow(app, socket, io) {
        io.emit('getElementPos', {
            response: 'clickShareNow',
            text: 'Share Post Now',
            type: 'span'
        });
    }
    function clickShareNow(app, socket, io) {
        io.emit('getElementPos', {
            response: 'clickShareNow',
            text: 'Share Now',
            type: 'span'
        });
    }
    function setListeners(app, socket, io) {
        socket.on('clickShareRes', (pos) => {
            if (pos) {
                let rand = _.random(1, 2);
                console.log('@click share roll 1/2: ', rand);
                if (rand === 2) {
                    if (pos && pos.top != 0 && pos.left != 0 && pos.width != 0) {
                        clickElement(pos, 1, app);
                    }
                    timers_1.setTimeout(() => {
                        clickSharePostNow(app, socket, io);
                        timers_1.setTimeout(() => {
                            clickShareNow(app, socket, io);
                        }, (T_TIME));
                    }, (T_TIME * 4));
                }
            }
            else {
                console.log('No Share Button');
            }
        });
        socket.on('clickLike', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    robot_1.Robot.doScroll(1);
                }, (T_TIME * 15));
            }
            else {
                console.log('No Like Button');
                noLikeBtn++;
                if (noLikeBtn) {
                }
            }
            sharePos += _.random(1, 2);
            timers_1.setTimeout(() => {
                /*checkState(app, socket, io);*/
                clickShare(app, socket, io);
            }, (T_TIME * _.random(15, 24)));
        });
        socket.on('clickShareNow', (pos) => {
            console.log('@clickShareNow pos: ', pos);
            if (pos && pos.top != 0 && pos.left != 0 && pos.width != 0) {
                timers_1.setTimeout(() => {
                    clickElement(pos, 1, app);
                    totalShares--;
                    if (totalShares <= 0) {
                        app.loginState = 'idle';
                        app.doRestart();
                        updateInitialShares(app).subscribe();
                    }
                }, T_TIME);
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(InitialShares = exports.InitialShares || (exports.InitialShares = {}));
