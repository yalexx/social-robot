"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
let _ = require('lodash');
let likesRange = [8, 20];
var InitialLikes;
(function (InitialLikes) {
    var clickElement = robot_1.Robot.clickElement;
    var updateInitialLikes = storage_1.Storage.updateInitialLikes;
    let data$ = storage_1.Storage.getRandomSidData({
        isVerified: true,
    }), T_TIME = 1000, pagesArray;
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
                            app.routineState = 'navigatePage';
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
    InitialLikes.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    InitialLikes.init = init;
    function navigatePage(app, socket, io) {
        if (pagesArray[0] !== undefined) {
            browser_1.Browser.navigateUrl(io, pagesArray[0], true);
            app.routineState = 'likePage';
        }
        else {
            app.doRestart();
        }
    }
    InitialLikes.navigatePage = navigatePage;
    function likePage(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('getActionBtnPos', {
                type: 'div',
                text: 'Like',
                response: 'likePageRes',
            });
        }, (T_TIME * _.random(4, 6)));
        pagesArray = _.slice(pagesArray, 1, pagesArray.length);
        timers_1.setTimeout(() => {
            app.routineState = 'navigatePage';
            checkState(app, socket, io);
        }, 13000);
    }
    InitialLikes.likePage = likePage;
    function setListeners(app, socket, io) {
        socket.on('likePageRes', (pos) => {
            if (pos) {
                if (pagesArray.length > 1) {
                    clickElement(pos, 1, app);
                    console.log('remove : ', pagesArray[0]);
                    console.log('@pagesArray: ', pagesArray);
                    console.log('@pagesArray length: ', pagesArray.length);
                }
                else {
                    updateInitialLikes(app).subscribe((res) => {
                        console.log('@Update initial likes');
                        app.doRestart();
                    });
                }
            }
            else {
                app.doRestart();
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(InitialLikes = exports.InitialLikes || (exports.InitialLikes = {}));
