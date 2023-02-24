"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
let _ = require('lodash');
let taskID;
let T_TIME = 1000;
let url = 'http://www.multiporgame.info/#l';
var LikeGame;
(function (LikeGame) {
    var updateGame = storage_1.Storage.updateGame;
    let data$;
    function init(app, socket, io) {
        setListeners(app, socket, io);
        data$ = storage_1.Storage.getRandomSidData({
            "country": "de",
            "isVerified": true,
            "game": { $exists: false },
        });
    }
    LikeGame.init = init;
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
    LikeGame.checkState = checkState;
    function navigatePage(app, socket, io) {
        browser_1.Browser.navigateUrl(io, url);
        timers_1.setTimeout(() => {
            console.log('click Confirm');
            io.emit('click', {
                selector: ['button[name="__CONFIRM__"', ''],
                response: 'res',
            });
            timers_1.setTimeout(() => {
                browser_1.Browser.navigateUrl(io, '#l');
                timers_1.setTimeout(() => {
                    console.log('click Image house');
                    io.emit('click', {
                        selector: ['.image130 .pic', ''],
                        response: 'res1',
                    });
                    timers_1.setTimeout(() => {
                        console.log('click clickLikeRes');
                        io.emit('click', {
                            selector: ['.vote_bg .like_button:visible', '1'],
                            response: 'clickLikeRes',
                        });
                        timers_1.setTimeout(() => {
                            console.log('restart');
                            app.doRestart();
                        }, (T_TIME * 12));
                    }, (T_TIME * 10));
                }, (T_TIME * 20));
            }, (T_TIME * 20));
        }, (T_TIME * 28));
    }
    function setListeners(app, socket, io) {
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
})(LikeGame = exports.LikeGame || (exports.LikeGame = {}));
