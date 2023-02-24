"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
let _ = require('lodash');
let request = require('request');
let T_TIME = 700;
var PostLink;
(function (PostLink) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var clickElement = robot_1.Robot.clickElement;
    var typeInputData = robot_1.Robot.typeInputData;
    let T_TIME = 100;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                /* data$.subscribe((data) => {
                     app.userData = data;
                     console.log('@SID: ', data);
                 });*/
                app.routineState = 'login';
                break;
            case 'login':
                app.loginState = 'init';
                login_facebook_1.LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {
                    if (res) {
                        console.log('@login done');
                        timers_1.setTimeout(() => {
                            app.routineState = 'clickShare';
                            /*totalShares = _.random(1, 3);
                            sharePos = 0;*/
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
            case 'clickShare':
                shareLink(app, socket, io);
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }
    PostLink.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    PostLink.init = init;
    function shareLink(app, socket, io) {
        console.log('@shareLink');
        timers_1.setTimeout(() => {
            browser_1.Browser.navigateUrl(io, 'http://m.facebook.com/sharer.php?u=' +
                app.url);
            timers_1.setTimeout(() => {
                app.routineState = 'clickPost';
                checkState(app, socket, io);
            }, (T_TIME * 10));
        }, (T_TIME * 10));
    }
    function clickPost(app, socket, io) {
        if (app.text) {
            console.log('@must write some text...:', app.text);
            writeInTextarea(app, socket, io);
        }
        else {
            timers_1.setTimeout(() => {
                getDomElementPosition(io, {
                    response: 'clickPost',
                    text: 'Post',
                    type: 'button',
                    position: 1
                });
            }, (T_TIME * 12));
        }
        socket.on('clickPost', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                app.APIRes.send(JSON.stringify({
                    status: true
                }));
                app.sharedLinks++;
                timers_1.setTimeout(() => {
                    app.routineState = 'idle';
                    app.doRestart();
                }, (T_TIME * 10));
            }
        });
    }
    function writeInTextarea(app, socket, io) {
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'writeInTextarea',
                id: 'u_0_i'
            });
        }, (T_TIME * 4));
    }
    function setListeners(app, socket, io) {
        socket.on('writeInTextarea', (resPos) => {
            if (resPos) {
                typeInputData(io, app.text, resPos, () => {
                    getDomElementPosition(io, {
                        response: 'clickPost',
                        text: 'Post',
                        type: 'button',
                        position: 1
                    });
                }, app);
            }
        });
    }
})(PostLink = exports.PostLink || (exports.PostLink = {}));
