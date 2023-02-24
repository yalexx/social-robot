"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
let _ = require('lodash');
var PostText;
(function (PostText) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var clickElement = robot_1.Robot.clickElement;
    var typeInputData = robot_1.Robot.typeInputData;
    let T_TIME = 1200;
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
                timers_1.setTimeout(() => {
                    login_facebook_1.LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        if (res) {
                            postText(app, socket, io);
                        }
                        else {
                            app.routineState = 'init';
                            app.doRestart();
                        }
                    });
                }, T_TIME);
                app.routineState = 'inLogin';
                break;
            case 'inLogin':
                console.log('Still not logged in.');
                break;
        }
    }
    PostText.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    PostText.init = init;
    function clickPublic(app, socket, io) {
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'clickPublic',
                class: '_1ig0',
                position: "0",
                type: 'div',
                child_position: 0
            });
        }, (T_TIME * 4));
    }
    function postText(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('timelineTextarea', {
                response: 'postText'
            });
        }, (T_TIME * 4));
    }
    function setListeners(app, socket, io) {
        socket.on('postText', (resPos) => {
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
        socket.on('clickPost', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                app.APIRes.send(JSON.stringify({
                    status: true
                }));
                timers_1.setTimeout(() => {
                    app.routineState = 'idle';
                    app.doRestart();
                }, (T_TIME * 10));
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(PostText = exports.PostText || (exports.PostText = {}));
